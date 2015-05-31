Meteor.startup(function() {
    // code to run on server at startup
    JSON.parse(Assets.getText("import/races.json")).forEach(function(race) {
        var r = Races.findOne({
            name: race.name
        });
        if (!r) {
            console.info("Importing race definition %s", race.name);
            Races.insert(race);
        } else {
            console.info("Updating race definition %s", race.name);
            Races.update(r._id, race);
        }
    });

    var EXPIRED_EXCLUSION = {date: {$gte: new Date()}};
    //publish games with the players collection transformed to hide races and provide nice UI labels. This prevents people sneaking a peak using the client side minimongo collection
    Meteor.publish("allGames", function() {
        //console.log("publishing single game %s", id);
        var self = this;
        //Transform function
        var transform = function(doc) {
            //console.log("transforming doc %j", doc);
            doc.players = _.map(doc.players, function(player) {
                var raceLabel = "Pending ", raceId, raceSelection = [];
                if ((self.userId !== player._id) && doc.hideRaces) {
                    if (player.race) {
                        raceLabel = "Picked";
                    }
                } else {
                    if (player.race) {
                        raceId = player.race;
                        raceLabel = Races.findOne(raceId).name;
                    } else if (player.raceSelection) {
                        raceSelection = player.raceSelection;
                        var races = _.map(player.raceSelection, function (selection) {
                            return Races.findOne(selection).name;
                        });
                        raceLabel += '- ' + races.join(', ');
                    }
                }

               return {
                   name: getNameFromUser(Meteor.users.findOne(player._id)),
                   _id: player._id,
                   picked: (player.race ? true : false),
                   race: raceLabel,
                   raceId: raceId,
                   raceSelection: raceSelection
               }
            });
            if (doc.selectionMethod == SELECTION_METHODS.FREE.key) {
                doc.selectionPool = _.pluck(generateRaceSelection(doc), "_id");
            }
            //console.log("transformed doc %j", doc);
            return doc;
        };

        var observer = Games.find(EXPIRED_EXCLUSION).observe({
            added: function (document) {
                //console.log("added ", document);
                self.added('games', document._id, transform(document));
            },
            changed: function (newDocument, oldDocument) {
                var transformed = transform(newDocument);
                console.log("changing game players from %j to %j via transform %j", oldDocument.players, newDocument.players, transformed.players);
                self.changed('games', oldDocument._id, transformed);
            },
            removed: function (oldDocument) {
                self.removed('games', oldDocument._id);
            }
        });

        self.onStop(function () {
            observer.stop();
        });

        self.ready();

    });

    Meteor.publish("races", function() {
        return Races.find();
    });

    Meteor.methods({
        addPlayer: function(gameId, playerId) {
            //console.info("Add player");
            var game = Games.findOne(gameId);
            //console.info("Updating game %j with player %s", game, playerId);
            if (_.has(_.pluck(game.players, "_id"), playerId)) {
                throw "Player already in game";
            }
            if (game.players.length >= game.maxPlayers) {
                throw "Too many players in game";
            }
            var raceSelection = generateRaceSelection(game),
                race = null,
                selectionIds;

            //console.log("race selection for %s game is %j", game.selectionMethod, raceSelection);

            if (!raceSelection || !raceSelection.length) {
                throw "No valid race selection could be made";
            }
            selectionIds = _.pluck(raceSelection, "_id");

            if (game.selectionMethod === SELECTION_METHODS.RANDOM.key) {
                race = selectionIds[0];
                selectionIds = null;
            } else if (game.selectionMethod === SELECTION_METHODS.FREE.key) {
                selectionIds = null;
            }

            var player = {
                race: race,
                raceSelection: selectionIds,
                _id: playerId
            };

            //console.info("pushing player %j", player);
            var mod = {$push: {players: player}};
            game.players.push(player);

//          Debug validation errors
//          var context = Games.simpleSchema().newContext();
//          context.validate(mod, {modifier : true});
//          console.info("Invalid keys : %j", context.invalidKeys());
//          console.info(Games.validate(mod, {modifier : true}));

            Games.update({_id: game._id}, mod);

            //return a player object with resolved raceSelections instead of the db object which just has race ids
            //player.raceSelection = raceSelection;

            console.log("player: %j", player);
            return player;
        },
        kickPlayer: function(gameId, playerId) {
            console.log("kicking player %s from %s", playerId, gameId);
            var game = Games.findOne(gameId);
            var player = findPlayer(game, playerId);
            if (this.userId === game.owner) {
                Games.update({_id: gameId}, {$pull: {players: {_id: playerId}}});
            } else {
                throw "Not authorised to kick player";
            }
        },
        selectRace: function(gameId, playerId, raceId) {
            var game = Games.findOne(gameId);

            var player = findPlayer(game, playerId);
            var pool = (game.selectionMethod === SELECTION_METHODS.FREE.key) ? _.pluck(generateRaceSelection(game), "_id") : player.raceSelection;
            if (!_.contains(pool, raceId)) {
                console.error("Selected race %s is not in valid set of selections %j", raceId, pool);
                throw "Illegal race selection";
            }
            player.race = raceId;
            var update = {"players.$.race": raceId};
            if (game.hideRaces && pickingComplete(gameId, -1)) {
                update['hideRaces'] = false;
            }
            Games.update({_id: gameId, "players._id": playerId}, {$set: update});
            return player;
        }
    });
});

var generateRaceSelection = function(game) {
    console.log("generating race selection for %j", game.players);
    var notList = _.flatten(_.collect(game.players, function(player) {
        return player.raceId || player.raceSelection;
    }));
    var inList = game.racePool;
    //console.log("disalowed races %j", notList);
    var selection = Races.find({
        _id: {
            $nin: notList,
            $in: inList
        }
    }).fetch();
    //console.info(game.selectionMethod);
    if (game.selectionMethod === SELECTION_METHODS.PICK_FROM_SELECTION.key || game.selectionMethod === SELECTION_METHODS.RANDOM.key) {
        //TODO: when underscore smart package is updated to use 1.5.2 we can use _.sample()
        selection = _.shuffle(selection).slice(0, (game.countRaces || 1));
    }
    //console.log("%s available races: %j", selection.length, _.pluck(selection, "name"));
    return selection;
};

var pickingComplete = function(gameId, offset) {
    offset = offset || 0;
    var game = Games.findOne(gameId);
    var pickedPlayers = _.reduce(game.players, function(i, player) {
        return i + (player.race ? 1 : 0)
    }, 0);
    return pickedPlayers >= (game.maxPlayers + offset);
};