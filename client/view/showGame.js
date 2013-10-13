Template.showGame.events({
    'click #btnJoinGame': function() {
        var gameId = Session.get("currentGame")._id;
        var playerId = Meteor.user()._id;
        console.info("joining game id %s with player %s", gameId, playerId);

        Meteor.call("addPlayer", gameId, playerId, function(err, player) {
            console.info("add player cb %o", player, err);
            Session.set("raceSelection", player.raceSelection);
        });
    },
    'click a.selectRace': function(event, template) {
        event.preventDefault();
        var userId = Meteor.user()._id;
        var raceId = $(event.target).data("raceid")
        var gameId = Session.get("currentGame")._id;
        console.log("selecting race for player %s: %s", name, raceId);
        if (userId && raceId) {
            Meteor.call("selectRace", gameId, userId, raceId, function(err, player) {
                Session.set("currentPlayer", player);
                Session.set("raceSelection");
            });
        } else {
            console.error("supply user, race and game IDs buttmunch");
        }
    }
});
Template.showGame.raceSelection = function() {
    return Session.get("raceSelection");
};
Template.showGame.screenName = function(id) {
    //TODO optionally use passed id
    var user = Meteor.user();
    if (user.profile && user.profile.name) {
        return user.profile.name;
    } else if (user.username) {
        return user.username;
    } else if (user.emails && user.emails.length) {
        return user.emails[0].address;
    } else {
        return user._id;
    }
};
Template.showGame.players = function() {
    var players = [];
    console.log(this.players);
    _.each(this.players, function(player) {
        if (player.race) {
            players.push({
                name: player._id,
                race: Races.findOne(player.race).name
            });
        }
    });
    return players;
};