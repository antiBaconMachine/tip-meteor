Template.index.helpers({
    allUpcomingGames: function() {
        //return Session.get("index.allUpcomingGames");
        return Games.find({}, {sort: {date: 1}});
    },
    myGames: function() {
        return Games.find({"players._id": Meteor.user()._id}, {sort: {date: 1}});
    },
    displayName: function() {
        return getNameFromUser(Meteor.user());
    },
    userId: function() {
        return Meteor.user()._id;
    }
});