Races = new Meteor.Collection("races");
Games = new Meteor.Collection("games");

if (Meteor.isClient) {
    
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

    
    //DOM setup function
    $(function() {
     
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
            Meteor.call("raceSelection", game._id, function(err, raceSelection) {
                console.log(arguments);
                console.log("raceSelection cb with %o", raceSelection);
                Session.set("raceSelection", raceSelection);
            });
            return game;
        },
        waitOn: function () {
            return Meteor.subscribe("gamesPub", this.params._id);
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

    Template.index.events({
        'click #btnCreateGame': openCreateDialog
    });

    Template.showGame.events({
        'click a.selectRace': function(event, template) {
            event.preventDefault();
            var name = Meteor.user().username;
            var race = $(event.target).data("raceid")
            console.log("selecting race for player %s: %s",name,race);
            if (name && race) {
                var player = {
                    name: name, 
                    race:race
                };
                var gameId = Session.get("currentGame")._id;
                Meteor.call("addPlayer", gameId, player);  
            } else {
                console.error("supply name and race buttmunch");
            }
        }
    });
    Template.showGame.raceSelection = function() {
        return Session.get("raceSelection");
    }
    Template.showGame.screenName = function() {
        var user = Meteor.user();
        return user.username || (user.emails.length ? user.emails[0].address : "");
    }

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
        
        Meteor.publish("gamesPub", function(id) { 
            return Games.find({
                _id : id
            }) 
        });
                
        Meteor.methods({
            createGame: function(game) {
                game.players = [];
                console.log("adding game %o", game);
                if (!Games.insert(game)) throw "could not insert";
                
            },
            addPlayer: function(gameId, player) {
                var game = Games.findOne(gameId);
                console.info("Updating game %o with player %o", game, player);
                player.race = Races.findOne(player.race);
                game.players.push(player);
                var id = Games.update(game._id, game);
            },
            raceSelection : function(gameId) {
                var game = Games.findOne(gameId);
                console.log("generating race selection for %j", game);
                var picked = _.pluck(Games.findOne(gameId).players, "race");
                console.log("pikced players %j", picked);
                var selection = _.shuffle(Races.find({
                    _id : {
                        $nin : picked
                    }
                }).fetch()).slice(0,3);
                console.log("%s available races: %j", selection.length, _.pluck(selection, "name"));
                return selection;
            }
        });
    });
}
