Meteor.startup(function() {
    // code to run on server at startup
    JSON.parse(Assets.getText("import/races.json")).forEach(function(race) {
        if (!Races.findOne({
            name: race.name
        })) {
            console.info("Importing race definition %s", race.name);
            Races.insert(race);
        }
    });

    Meteor.publish("gamesPub", function(id) {
        return Games.find({
            _id: id
        })
    });

    Meteor.publish("allGames", function(userId) {
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
            player.raceSelection = raceSelection;
            console.log("player: %j", player);
            return player;
        },
        selectRace: function(gameId, playerId, raceId) {
            var game = Games.findOne(gameId);
            //TODO something more efficient for player retrieval. We used to store 
            //players under id key bt this caused issues with simple schema. 
            //We need to rework the schema if we continue using simple schema 
            //as there doesn't seem to be a clean way to specify arbitrary 
            //key value collections 
            var player = _.find(game.players, function(player) {
                return player._id === playerId;
            });
            if (!_.contains(player.raceSelection, raceId)) {
                console.error("Selected race $s is not in valid set of selections %j", raceId, player.raceSelection);
                throw "Illegal race selection";
            }
            player.race = raceId;
            Games.update({_id : gameId, "players._id" : playerId}, {$set : {"players.$.race" : raceId}})
            return player;
        }
    });
});

var generateRaceSelection = function(game) {
    console.log("generating race selection for %j", game);
    var notList = _.flatten(_.collect(game.players, function(player) {
        return player.race || player.raceSelection;
    }));
    console.log("disalowed races %j", notList);
    var selection = Races.find({
        _id: {
            $nin: notList
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