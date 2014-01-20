var hoverTimeout;

Template.showGame.events({
    'click #btnJoinGame': function() {
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
        var raceId = $(event.target).data("raceid");
        var gameId = Session.get("currentGame")._id;
        console.log("selecting race for player %s: %s", name, raceId);
        if (confirm(_.template('Select <%=race%>?', {
            race: Races.findOne(raceId).name
        }))) {
            if (userId && raceId) {
                Meteor.call("selectRace", gameId, userId, raceId, function(err, player) {
                    Session.set("currentPlayer", player);
                    Session.set("raceSelection");
                });
            } else {
                console.error("supply user, race and game IDs buttmunch");
            }
        }
    },
    'mouseenter #players>li': function(event) {
        var raceId = $(event.target).data('raceid');
        console.info('Mousenter id: %s args: %o', raceId, arguments);
        if (raceId) {
            Session.set('hoverRace', Races.findOne(raceId));
            $('#hoverRace').show();
        }
    },
    'mouseleave #players>li': function(event) {
        Session.set('hoverRace', null);
    }
});
Template.showGame.helpers({
    raceSelection: function() {
        var rs = Session.get("raceSelection");
        console.info("raceSelection: %o", rs);
        return rs;
    },
    raceSelections: function() {

    },
    screenName: function(id) {
        //TODO fix this
        var user = id ? Meteor.user(id) : Meteor.user();
        if (user.profile && user.profile.name) {
            return user.profile.name;
        } else if (user.username) {
            return user.username;
        } else if (user.emails && user.emails.length) {
            return user.emails[0].address;
        } else {
            return user._id;
        }
    },
    getPlayer: function() {
        var player;
        if (this.race) {
            var user = Meteor.users.findOne(this._id);

            var name = (user && user.profile) ? user.profile.name : getNameFromUser(user);
            player = {
                name: name,
                race: Races.findOne(this.race).name
            };

        }
        return player;
    },
    isLivePlayer: function() {
        return getLivePlayer(this.players);
    },
    myRace: function() {
        var player = getLivePlayer(this.players);
        if (player) {
            return Races.findOne(player.race);
        }
    },
    getRace: function(id) {
        return Races.findOne(id);
    },
    selectionMethod: function() {
        var method = SELECTION_METHODS[this.selectionMethod];

        return method ? method.description.replace(/%i/, this.countRaces) : SELECTION_METHODS[this.selectionMethod];
    },
    playersForGame: function() {
        return Session.get('playersForGame');
    },
    hoverRace: function() {
        return Session.get('hoverRace');
    }
});
var getLivePlayer = function(players) {
    return _.find(players, function(player) {
        return player._id === Meteor.user()._id && player.race;
    });
};