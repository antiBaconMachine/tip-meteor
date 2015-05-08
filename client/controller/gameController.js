gameController = RouteController.extend({
    data: function() {
        return Session.get("currentGame");
    },
    waitOn: function() {
        return Meteor.subscribe("singleGame", this.params._id);
    },
    showGame: function() {
        var game = Games.findOne(this.params._id);
        if (game) {
            var user = Meteor.user();
            var currentPlayer = findPlayer(game, user._id);
            var raceSelection = null;
            if (currentPlayer && !currentPlayer.picked) {
                if (game.selectionMethod === SELECTION_METHODS.FREE.key) {
                    raceSelection = game.selectionPool;
                } else if (currentPlayer.raceSelection) {
                    raceSelection = currentPlayer.raceSelection;
                }
            }
            Session.set("raceSelection", raceSelection);
            Session.set("currentGame", game);
            Session.set("currentPlayer", currentPlayer);
            this.render();
        }
    },
    createGame: function() {
        this.render();
    },
    editGame: function() {
        var game = Games.findOne(this.params._id);
        if (game) {
            var user = Meteor.user();
            if (game.owner === user._id) {
                this.render('editGame', {
                    data : {
                        game: game
                    }
                });
            } else {
                Router.go('index');
            }
        }
    },
    before: function() {
        if (_.isNull(Meteor.user())) {
            console.warn('uauth');
            Router.go('index');
        } else {
            this.next();
        }
    }
});