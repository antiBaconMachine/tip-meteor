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
            var currentPlayer = game.players[user._id];
            if (currentPlayer && !currentPlayer.race && currentPlayer.raceSelection) {
                Session.set("raceSelection", currentPlayer.raceSelection);
            }
            Session.set("currentGame", game);
            Session.set("currentPlayer", currentPlayer);
            this.render();
        }
    }
});