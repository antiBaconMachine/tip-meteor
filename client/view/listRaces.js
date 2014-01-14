var colors = ['purple', 'brown', 'green'];

Template.listRaces.helpers({
   decorated: function() {
       var race = this.value;
       race.color = colors[this.key % 3];
       return race;
   } 
});