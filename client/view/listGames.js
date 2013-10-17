Template.listGames.helpers({
    games: function() {
        return Games.find({date: {$gte: new Date()}}, {sort: {date: 1}});
    },
    prettyDate: function() {
        var date = this.date;
        if (date) {
           return pad(date.getDay() + "/" + pad(date.getMonth()+1) + "/" + date.getYear());
        }
    }
});

var pad = function(n) {
    return ("0"+n).slice(n.length - 2);
}