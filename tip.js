Games = new Meteor.Collection("games");

if (Meteor.isClient) {
    Template.listGames.games = function() {
        return Games.find();
    }

}

if (Meteor.isServer) {
    Meteor.startup(function() {
        // code to run on server at startup
    });
}
