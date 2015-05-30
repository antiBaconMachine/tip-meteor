Template.races.helpers({
    races: function() {
        return Races.find().map(function(doc, index, cursor) {
            var race = _.extend(doc, {index: index});
            return race;
        });
    }
});
