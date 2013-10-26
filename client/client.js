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

Handlebars.registerHelper('formatDate', function(context, options) {
    var date = context
    var day = date.getDate();
    if (day < 10) {
        day = '0' + day;
    }
    var month = date.getMonth() + 1;
    if (month < 10) {
        month = '0' + month
    }
    var hours = date.getHours();
    if (hours < 10) {
        hours = '0' + hours;
    }
    var mintues = date.getMinutes();
    if (mintues < 10) {
        mintues = '0' + mintues;
    }
    var seconds = date.getSeconds();
    if (seconds < 10) {
        seconds = '0' + seconds;
    }
    return (day + '/' + month + '/' + date.getFullYear() +
            ' ' + hours + ':' + mintues + ':' + seconds);
});

Handlebars.registerHelper('everyNth', function(options) {
    var fn = options.fn, inverse = options.inverse,
        context = options.hash.items, every = options.hash.i;
    var ret = "";
    if (context && context.length > 0) {
        for (var i = 0, j = context.length; i < j; i++) {
            var modZero = i % every === 0;
            ret = ret + fn(_.extend({}, context[i], {
                isModZero: modZero,
                isModZeroNotFirst: modZero && i > 0,
                isLast: i === context.length - 1
            }));
        }
    } else {
        ret = inverse(this);
    }
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
        path: '/game/create',
        controller: 'gameController',
        action: 'create'
    });
});