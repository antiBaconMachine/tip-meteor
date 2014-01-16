var colors = ['purple', 'brown', 'green'];
var i = 0;
Template.listRaces.helpers({
    decorated: function() {
        var race = this._id ? this : Races.findOne(this.toString());
        if (race) {
            race.color = colors[(race.index || i++) % 3];
            return race;
        }
    }
});