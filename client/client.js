Meteor.subscribe("allGames", this.userId);
Meteor.subscribe("races");

Handlebars.registerHelper('eachMapEntries', function(context, options) {
    var ret = "";
    $.each(context, function(key, value) {
        var entry = {
            "key": key,
            "value": value
        };
        ret = ret + options.fn(entry);
    });
    return ret;
});

Router.configure({
    layout: 'layout'
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
        path : '/game/create',
        controller : 'gameController',
        action : 'create'
    });
});