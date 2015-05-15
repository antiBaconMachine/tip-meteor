Meteor.subscribe("allGames", this.userId);
Meteor.subscribe("races");

UI.registerHelper('prettyDate', function (date) {
    if (date) {
        return pad(date.getDate()) + "/" + pad(date.getMonth() + 1) + "/" + (date.getYear() + 1900);
    }
});

UI.registerHelper('guid', function () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : r & 3 | 8;
        return v.toString(16);
    });
});

UI.registerHelper("mapToArray", function () {
    var arr = [];
    _.each(this, function(v, k) {
        arr.push({
            key: k,
            value: v
        });
    });
    return arr;
});

var pad = function (n) {
    return ("0" + n).slice(("" + n).length - 1);
};

Router.plugin('dataNotFound', {notFoundTemplate: '404'});
Router.configure({
    layoutTemplate: 'layout'
});
Router.map(function () {
    this.route('index', {
        path: '/'
    });
    this.route('showGame', {
        path: '/game/show/:_id',
        controller: 'gameController',
        action: 'showGame'
    });
    this.route('createGame', {
        path: '/game/create',
        controller: 'gameController'
    });
    this.route('editGame', {
        path: '/game/edit/:_id',
        controller: 'gameController',
        action: 'editGame'
    });
    this.route('user', {
        path: '/user/:_id',
        controller: 'userController'
    });
    this.route('races');
});

userController = RouteController.extend({
   data: function() {
       return Meteor.users.findOne({_id: this.params._id});
   }
});

Meteor.startup(function() {

    $('body').on('click', 'a', function (event) {
        event.preventDefault();
        var route = this.href;
        if (route) {
            Router.go(route);
        }
        return false;
    });

});

SimpleSchema.debug = true;