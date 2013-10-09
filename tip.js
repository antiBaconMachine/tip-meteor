Races = new Meteor.Collection("races");
Games = new Meteor.Collection("games");

if (Meteor.isClient) {
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
            path: '/game/:_id',
            controller: 'GameController',
            action: 'show'
        });
    });

    GameController = RouteController.extend({
        data: function() {
            return Session.get("currentGame");
        },
        waitOn: function () {
            return Meteor.subscribe("gamesPub", this.params._id);
        },
        show: function() {
            var game = Games.findOne(this.params._id);
            if (game) {
                var user = Meteor.user();
                var currentPlayer = game.players[user._id];
                if (currentPlayer && !currentPlayer.race && currentPlayer.raceSelection) {
                    Session.set("raceSelection", currentPlayer.raceSelection);
                }
                Session.set("currentGame", game);
                Session.set("currentPlayer", currentPlayer);
                this.render();
            }
        }
    });

    Template.listGames.games = function() {
        return Games.find();
    };

    Template.index.events({
        'click #btnCreateGame': function() {
            console.info("creating game");
            openCreateDialog();
        }
    });

    Template.showGame.events({
        'click #btnJoinGame' : function() {
            var gameId = Session.get("currentGame")._id;
            var playerId = Meteor.user()._id;
            console.info("joining game id %s with player %s", gameId, playerId);
            
            Meteor.call("addPlayer", gameId, playerId, function(err, player) {
                console.info("add player cb %o", player, err);
                Session.set("raceSelection", player.raceSelection);
            });
        },
        'click a.selectRace': function(event, template) {
            event.preventDefault();
            var userId = Meteor.user()._id;
            var raceId = $(event.target).data("raceid")
            var gameId = Session.get("currentGame")._id;
            console.log("selecting race for player %s: %s",name,raceId);
            if (userId && raceId) {
                Meteor.call("selectRace", gameId, userId, raceId, function(err, player) {
                    Session.set("currentPlayer", player);
                    Session.set("raceSelection");
                });  
            } else {
                console.error("supply user, race and game IDs buttmunch");
            }
        }
    });
    Template.showGame.raceSelection = function() {
        return Session.get("raceSelection");
    };
    Template.showGame.screenName = function(id) {
        //TODO optionally use passed id
        var user = Meteor.user();
        return user.username || (user.emails.length ? user.emails[0].address : "");
    };
    Template.showGame.players = function() {
        var players = [];
        console.log(this.players);
        _.each(this.players, function(player) {
           if (player.race) {
               players.push({
                   name : player._id,
                   race : Races.findOne(player.race).name
               });
           } 
        });
        return players;
    };

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
        console.info("hi");
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
        
        Meteor.publish("allGames", function(userId) {
           return Games.find(); 
        });
                
        Meteor.publish("races", function() {
           return Races.find(); 
        });
        Meteor.methods({
            createGame: function(game) {
                game.players = {};
                console.log("adding game %o", game);
                if (!Games.insert(game)) throw "could not insert";
                
            },
            addPlayer: function(gameId, playerId) {
                var game = Games.findOne(gameId);
                console.info("Updating game %o with player %o", game, playerId);
                if (_.has(game.players, playerId)) {
                    throw "Player already in game";
                }
                var player = {
                    race : null,
                    raceSelection : generateRaceSelection(gameId),
                    _id : playerId
                };
                game.players[playerId] = player;
                var id = Games.update(game._id, game);
                return player;
            },
            selectRace : function(gameId, playerId, raceId) {
                var game = Games.findOne(gameId);
                var player = game.players[playerId];
                var raceIds = _.pluck(player.raceSelection, "_id");
                if (!_.contains(raceIds, raceId)) {
                    console.error("Selected race $s is not is valid set of selections %j", raceId, raceIds);
                    throw "Illegal race selection";
                }
                player.race = raceId;
                game.players[playerId] = player;
                Games.update(game._id, game);
                return player;
            }
        });
    });
    
    var generateRaceSelection = function(gameId) {
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
}