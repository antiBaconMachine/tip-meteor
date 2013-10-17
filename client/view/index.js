Template.index.allUpcomingGames = function() {
    return Games.find({date : {$gte : new Date()}}, {sort : {date : 1}});
};
Template.index.myGames = function() {
    return Games.find({date : {$gte : new Date()}, "players._id" : Meteor.user()._id}, {sort : {date : 1}});
}