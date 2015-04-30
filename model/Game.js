SELECTION_METHODS = {
    PICK_FROM_SELECTION: {
        key: "PICK_FROM_SELECTION",
        label: "selection",
        description: "Pick from a random selection of %i races",
        options: {
            noRaces: 1
        },
        checked: 1
    },
    RANDOM: {
        key: "RANDOM",
        label: "random",
        description: "Random assigment"
    },
    FREE: {
        key: "FREE",
        label: 'free choice',
        description: "Free choice"
    }
};
//Games = new Meteor.Collection("games");
Games = new Meteor.Collection("games");
gameSchema = new SimpleSchema({

    name: {
        type: String
    },
    date: {
        type: Date
    },
    location: {
        type: String
    },
    description: {
        type: String,
        optional: true
    },
    selectionMethod: {
        type: String
    },
    countRaces: {
        type: Number,
        optional: true,
        min: 2,
        max: 5
    },
    maxPlayers: {
        type: Number,
        min: 3,
        max: 8
    },
    racePool: {
        type: [String]
    },
    players: {
        type: [Object],
        minCount: 0
    },
    "players.$.race": {
        type: String,
        optional: true
    },
    "players.$.raceSelection": {
        type: [String]
    },
    "players.$._id": {
        type: String
    },
    _id: {
        type: String,
        optional: true
    }
});
Games.attachSchema(gameSchema);

Games.allow({
    insert: function () {
        return true;
    }
});
Games.beforeInsert = function (game) {
    console.log("about to insert game %o", game);
    game.players = [];
    //TODO this is bullshit, why do we have to do it?
    game.maxPlayers = 1 * game.maxPlayers;
    return game;
};
//Games.afterInsert(function (error, gameId) {
//    console.log(gameId);
//    if (!error) {
//        Router.go(Router.path("showGame", {_id: gameId}));
//    }
//});

//TODO something more efficient for player retrieval. We used to store 
//players under id key bt this caused issues with simple schema. 
//We need to rework the schema if we continue using simple schema 
//as there doesn't seem to be a clean way to specify arbitrary 
//key value collections 
findPlayer = function (game, playerId) {
    return _.find(game.players, function (player) {
        return player._id === playerId;
    });
}