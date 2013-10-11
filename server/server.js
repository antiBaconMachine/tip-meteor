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
        createGame: function(game) {
            game.players = {};
            console.log("adding game %o", game);
            if (!Games.insert(game))
                throw "could not insert";

        },
        addPlayer: function(gameId, playerId) {
            var game = Games.findOne(gameId);
            console.info("Updating game %o with player %o", game, playerId);
            if (_.has(game.players, playerId)) {
                throw "Player already in game";
            }
            var player = {
                race: null,
                raceSelection: generateRaceSelection(gameId),
                _id: playerId
            };
            game.players[playerId] = player;
            var id = Games.update(game._id, game);
            return player;
        },
        selectRace: function(gameId, playerId, raceId) {
            var game = Games.findOne(gameId);
            var player = game.players[playerId];
            var raceIds = _.pluck(player.raceSelection, "_id");
            if (!_.contains(raceIds, raceId)) {
                console.error("Selected race $s is not is valid set of selections %j", raceId, raceIds);
                throw "Illegal race selection";
            }
            player.race = raceId;
            game.players[playerId] = player;
            Games.update(game._id, game);
            return player;
        }
    });
});

var generateRaceSelection = function(gameId) {
    var game = Games.findOne(gameId);
    console.log("generating race selection for %j", game);
    var picked = _.pluck(Games.findOne(gameId).players, "race");
    console.log("pikced players %j", picked);
    var selection = _.shuffle(Races.find({
        _id: {
            $nin: picked
        }
    }).fetch()).slice(0, 3);
    console.log("%s available races: %j", selection.length, _.pluck(selection, "name"));
    return selection;
}