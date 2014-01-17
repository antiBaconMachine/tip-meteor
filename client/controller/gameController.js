gameController = RouteController.extend({
    data: function() {
        return Session.get("currentGame");
    },
    waitOn: function() {
        return Meteor.subscribe("gamesPub", this.params._id);
    },
    show: function() {
        var game = Games.findOne(this.params._id);
        if (game) {
            var user = Meteor.user();
            var currentPlayer = findPlayer(game, user._id);
            var raceSelection = null;
            if (currentPlayer && !currentPlayer.race && currentPlayer.raceSelection) {
                raceSelection = currentPlayer.raceSelection;
            }
            Session.set("raceSelection", raceSelection);
            Session.set("currentGame", game);
            Session.set("currentPlayer", currentPlayer);
            this.render();
        }
    },
    create: function() {
        this.render();
    },
    before: function() {
        if (_.isNull(Meteor.user())) {
            console.warn('uauth');
            Router.go(Router.path('index'));
        }
    }
});