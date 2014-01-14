Template.races.helpers({
    races: function() {
        return Races.find().map(function(doc, index, cursor) {
            var i = _.extend(doc, {index: index});
            return i;
        });
    }
});
