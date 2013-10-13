SELECTION_METHODS = {
    PICK_FROM_SELECTION: {
        key: "PICK_FROM_SELECTION",
        label: "selection",
        description: "Pick from a random selection of n races",
        options: {
            noRaces: 1
        },
        checked: 1
    },
    RANDOM: {
        key: "RANDOM",
        label: "random",
        description: "Randomly assigmed"
    },
    FREE: {
        key: "FREE",
        label: 'free choice',
        description: "Free choice of races"
    }
};

Games = new Meteor.Collection2("games", {
    schema: {
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
            minCount : 0
        },
        "players.$.race": {
            type : String,
            optional : true
        },
        "players.$.raceSelection": {
            type : [String]
        },
        "players.$._id": {
            type : String
        },
        _id: {
            type: String,
            optional: true
        }
    }
});
Games.beforeInsert = function(game) {
    game.players = [];
    //TODO this is bullshit, why do we have to do it?
    game.maxPlayers = 1*game.maxPlayers;
    return game;
};