Races = new Meteor.Collection("races");
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
        this.route('index', {
            path: '/'
        });
        this.route('showGame', {
            path: '/game/:_id',
            controller: 'GameController',
            action: 'show'
        });
    });

    GameController = RouteController.extend({
        data: function() {
            var game = Session.get("currentGame")
            console.log("retrieving race selection for %o", game);
            var selections = Meteor.call("raceSelection", game._id);
            console.log("race selections %o", selections);
            return _.extend({}, game, {
                raceSelection : selections
            });
        },
        waitOn: function () {
            return Meteor.subscribe("gamesPub");
        },
        show: function() {
            Session.set("currentGame", Games.findOne(this.params._id));
            console.log("Set currentGame to %o", Session.get("currentGame"));
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
        'click a.selectRace': function(event, template) {
            event.preventDefault();
            return false;
            var name = template.find("#playerName").value;
            var race = template.find("#playerRace").value;

            if (name && race) {
                var player = {
                    name: name, 
                    race:race
                };
                var gameId = Session.get("currentGame")._id;
                console.log("adding player %o to gameId %s", player, gameId);
                Meteor.call("addPlayer", gameId, player);  
            } else {
                console.error("supply name and race buttmunch");
            }
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
                        description: description
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
        JSON.parse(Assets.getText("import/races.json")).forEach(function(race) {
            if (!Races.findOne({
                name : race.name
            })) {
                console.info("Importing race definition %s",race.name);
                Races.insert(race);
            } 
        });
        
        Meteor.publish("gamesPub", function() { 
            return Games.find() 
        });
                
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
            },
            raceSelection : function(gameId, cb) {
                var game = Games.findOne(gameId);
                console.log("generating race selection for %j", game);
                var picked = _.pluck(Games.findOne(gameId).players, "race");
                console.log("pikced players %j", picked);
                var selection = _.shuffle(Races.find({
                    _id : {
                        $nin : picked
                    }
                }).fetch()).slice(0,3);
                console.log("%s available races:\n%j", selection.length, selection);
                return selection;
            }
        });
    });
}
