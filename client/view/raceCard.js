Template.raceCard.helpers({
   fade : function() {
       return !this.noFade;
   }
});

Template.raceCard.events({
   "click .raceCard__title" : function(event) {
        $(event.target).closest('.raceCard').find('.fold').toggleClass("collapsed");
   }
});