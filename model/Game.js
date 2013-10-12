SELECTION_METHODS = {
    PICK_FROM_SELECTION : {
        key : "PICK_FROM_SELECTION",
        label : "selection",
        description : "Pick from a random selection of n races",
        options : {
            noRaces : 1
        },
        checked : 1
    },
    RANDOM : {
        key : "RANDOM",
        label : "random",
        description : "Randomly assigmed"
    },
    FREE : {
        key : "FREE",
        label : 'free choice',
        description : "Free choice of races"
    }
};

Game = function(data) {
    return _.extend({
        name        : null,
        description : null,
        date        : null,
        location    : null,
        config : {
            selectionMethod : {
                method : PICK_FROM_SELECTION,
                options : {
                    noRaces : 3,
                }
            },
            maxPlayers      : 6,
            racePool        : []
        }
    }, (data || {}));
};