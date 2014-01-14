var colors = ['purple', 'brown', 'green'];

Template.listRaces.helpers({
    decorated: function() {
        this.color = colors[this.index % 3];
        return this;
    }
});