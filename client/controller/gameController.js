gameController = RouteController.extend({
    data: function() {
        return Session.get("currentGame");
    },
    waitOn: function() {
        return Meteor.subscribe("gamesPub", this.params._id);
    },
    showGame: function() {
        var game = Games.findOne(this.params._id);
        if (game) {
            var user = Meteor.user();
            var currentPlayer = findPlayer(game, user._id);
            var raceSelection = null;
            if (currentPlayer && !currentPlayer.race && currentPlayer.raceSelection) {
                raceSelection = currentPlayer.raceSelection;
            }
            Session.set('hoverRace', null);
            Session.set("raceSelection", raceSelection);
            Session.set("currentGame", game);
            Session.set("currentPlayer", currentPlayer);
            Meteor.call('getPlayersForGame', this.params._id, function(err, players) {
                console.log("pfg",players);
                Session.set('playersForGame', players);
            });
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
                this.render();
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