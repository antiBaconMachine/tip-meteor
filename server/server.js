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

    Meteor.publish("gamesPub", function(id) {
        return Games.find({
            _id: id
        });
    });

    Meteor.publish("allGames", function() {
        return Games.find();
    });

    Meteor.publish("races", function() {
        return Races.find();
    });
    Meteor.methods({
        addPlayer: function(gameId, playerId) {
            console.info("Add player");
            var game = Games.findOne(gameId);
            console.info("Updating game %j with player %s", game, playerId);
            if (_.has(_.pluck(game.players, "_id"), playerId)) {
                throw "Player already in game";
            }
            var raceSelection = generateRaceSelection(game);
            console.log("race selection %j", raceSelection);
            var player = {
                race: null,
                raceSelection: _.pluck(raceSelection, "_id"),
                _id: playerId
            };
            console.info("pushing player %j", player);
            var mod = {$push: {players: player}};
            game.players.push(player);

//          Debug validation errors
//          var context = Games.simpleSchema().newContext();
//          context.validate(mod, {modifier : true});
//          console.info("Invalid keys : %j", context.invalidKeys());
//          console.info(Games.validate(mod, {modifier : true}));

            //fails validation if using collection2 for unknown reasons, using wrapped collection for now
            Games._collection.update({_id: game._id}, mod);

            //return a player object with resolved raceSelections instead of the db object which just has race ids
            //player.raceSelection = raceSelection;

            console.log("player: %j", player);
            return player;
        },
        selectRace: function(gameId, playerId, raceId) {
            var game = Games.findOne(gameId);

            var player = findPlayer(game, playerId);
            if (!_.contains(player.raceSelection, raceId)) {
                console.error("Selected race $s is not in valid set of selections %j", raceId, player.raceSelection);
                throw "Illegal race selection";
            }
            player.race = raceId;
            Games.update({_id: gameId, "players._id": playerId}, {$set: {"players.$.race": raceId}});
            return player;
        },
        getPlayersForGame: function(gameId) {
            var game = Games.findOne(gameId);
            var players = _.map(game.players, function(player) {
                var raceId = null;
                var raceLabel = 'Pending ';
                if (game.hideRaces) {
                    if (player.race) {
                        raceLabel = "Picked";
                    }
                } else {
                    if (player.race) {
                        raceId = player.race;
                        raceLabel = Races.findOne(raceId).name;
                    } else if (player.raceSelection) {
                        var races = _.map(player.raceSelection, function (selection) {
                            return Races.findOne(selection).name;
                        });
                        raceLabel += '- ' + races.join(', ');
                    }
                }
                return {
                    name: getNameFromUser(Meteor.users.findOne(player._id)),
                    race: raceLabel,
                    raceId: raceId
                };
            });
            console.log("SS players for game %j", players);
            return players;
        }
    });
});

var generateRaceSelection = function(game) {
    console.log("generating race selection for %j", game);
    var notList = _.flatten(_.collect(game.players, function(player) {
        return player.race || player.raceSelection;
    }));
    var inList = game.racePool;
    console.log("disalowed races %j", notList);
    var selection = Races.find({
        _id: {
            $nin: notList,
            $in: inList
        }
    }).fetch();
    console.info(game.selectionMethod);
    if (game.selectionMethod === SELECTION_METHODS.PICK_FROM_SELECTION.key || game.selectionMethod === SELECTION_METHODS.RANDOM.key) {
        //TODO: when underscore smart package is updated to use 1.5.2 we can use _.sample()
        selection = _.shuffle(selection).slice(0, (game.countRaces || 1));
    }
    console.log("%s available races: %j", selection.length, _.pluck(selection, "name"));
    return selection;
};

var getNameFromUser = function(user) {
    if (user) {
        if (user.profile && user.profile.name) {
            return user.profile.name;
        } else if (user.emails) {
            var email = user.emails[0].address;
            if (email) {
                var matches = email.match(/(.*)@.*/);
                if (matches.length > 1) {
                    return matches[1];
                }
            }
        }
    }
    return "Billy No-name"
};