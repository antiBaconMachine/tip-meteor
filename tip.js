Games = new Meteor.Collection("games");

if (Meteor.isClient) {

    //DOM setup function
    $(function() {
        $("#container").on("click", "a", function(e) {

        });
    });
    Router.configure({
        layout: 'layout'
    });
    Router.map(function() {
        this.route('index', {path: '/'});
        this.route('showGame', {
            path: '/game/:_id',
            controller: 'GameController',
            action: 'show'
        });
    });

    GameController = RouteController.extend({
        data: function() {
            return Session.get("currentGame");
        },
        show: function() {
            Session.set("currentGame", Games.findOne(this.params._id));
            this.render();
        }
    });

    Template.listGames.games = function() {
        return Games.find();
    };

    Template.createButton.events({
        'click .btn': function() {
            openCreateDialog();
        }
    });

    Template.showGame.events({
        'click #btnAddPlayer': function(event, template) {
            var name = template.find("#playerName").value;
            var race = template.find("#playerRace").value;

            if (name && race) {
                var player = {name: name, race:race};
                var gameId = Session.get("currentGame")._id;
                console.log("adding player %o to gameId %s", player, gameId);
                Meteor.call("addPlayer", gameId, player);  
            } else {
                console.error("supply name and race buttmunch");
            }
            event.preventDefault();
        }
    });

    Template.index.showCreateDialog = function() {
        return Session.get("showCreateDialog");
    };

    Template.createDialog.events({
        'click .save': function(event, template) {
            var title = template.find(".title").value;
            var description = template.find(".description").value;
            
            if (title.length) {
                Meteor.call(
                        'createGame',
                        {
                            title: title,
                            description: description,
                        }
                );
                Session.set("showCreateDialog", false);
            } else {
                Session.set("createError",
                        "It needs a title and a description, or why bother?");
            }
        },
        'click .cancel': function() {
            Session.set("showCreateDialog", false);
        }
    });

    var openCreateDialog = function() {
        Session.set("createError", null);
        Session.set("showCreateDialog", true);
    };
}

if (Meteor.isServer) {
    Meteor.startup(function() {
        // code to run on server at startup
        Meteor.methods({
            createGame: function(game, cb) {
                cb = cb || function(){};
                game.players = [];
                console.log("adding game %o with cb %f", game, cb);
                var id = Games.insert(game);
                if (id) {
                    cb(false, game);
                }
            },
            addPlayer: function(gameId, player, cb) {
                var game = Games.findOne(gameId);
                cb = cb || function() {};
                console.info("Updating game %o with player %o", game, player);
                game.players.push(player);
                var id = Games.update(game._id, game);
                
            }
        });
    });
}
