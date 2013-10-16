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
            var player = {
                race: null,
                raceSelection: _.pluck(generateRaceSelection(game), "_id"),
                _id: playerId
            };
            console.info("pushing player %j",player);
            var mod = {$push : {players : player}};
            game.players.push(player);
            var context = Games.simpleSchema().newContext();
            context.validate(mod, {modifier : true});
            console.info("Invalid keys : %j", context.invalidKeys());
            
            console.info(Games.validate(mod, {modifier : true}));
            //fails validation if using collection2
            Games._collection.update({_id : game._id}, mod);
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

var generateRaceSelection = function(game) {
    console.log("generating race selection for %j", game);
    var notList = _.flatten(_.collect(game.players, function(player) {
        return player.race || player.raceSelection;
    }));
    console.log("disalowed races %j", notList);
    var selection = _.shuffle(Races.find({
        _id: {
            $nin: notList
        }
    }).fetch()).slice(0, 3);
    console.log("%s available races: %j", selection.length, _.pluck(selection, "name"));
    return selection;
}