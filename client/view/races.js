Template.races.helpers({
    races: function() {
        return Races.find().fetch();
    }
});
