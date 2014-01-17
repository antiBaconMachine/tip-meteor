Meteor.subscribe("allGames", this.userId);
Meteor.subscribe("races");

Handlebars.registerHelper('eachMapEntries', function(context, options) {
    var ret = "";
    if (context) {
        $.each(context, function(key, value) {
            var entry = {
                "key": key,
                "value": value
            };
            ret = ret + options.fn(entry);
        });
    }
    return ret;
});

Handlebars.registerHelper('prettyDate', function(date) {
    if (date) {
        return pad(date.getDate()) + "/" + pad(date.getMonth() + 1) + "/" + (date.getYear() + 1900);
    }
});
var pad = function(n) {
    return ("0"+n).slice(("" + n).length - 1);
};

Router.configure({
    layoutTemplate: 'layout'
});
Router.map(function() {
    this.route('index', {
        path: '/'
    });
    this.route('showGame', {
        path: '/game/show/:_id',
        controller: 'gameController',
        action: 'show'
    });
    this.route('createGame', {
        path: '/game/create',
        controller: 'gameController',
        action: 'create'
    });
    this.route('races', {
        path: '/races'
    });
});