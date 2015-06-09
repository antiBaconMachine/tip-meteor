describe("Game", function () {

    var TEMPLATE = {
        name: "Test Game",
        date: new Date(),
        location: "A place",
        description: "A description",
        selectionMethod: SELECTION_METHODS.PICK_FROM_SELECTION.key,
        countRaces: 3,
        maxPlayers: 3,
        racePool: _.pluck(Races.find().fetch(), "_id"),
        players: [],
        owner: testUsers[0]["_id"],
        hideRaces: false
    };
    var gameId;
    var user1 = testUsers[0];
    var user2 = testUsers[1];

    var getGame = function() {
        return Games.find({_id:gameId}).fetch()[0];
    };

    describe("(in select from n mode)", function () {
        beforeAll(function (done) {
            var game = _.extend({}, TEMPLATE, {
                racePool: TEMPLATE.racePool.slice(0,4)
            });
            gameId = Games.insert(game, function (err, doc) {
                if (err) {
                    throw err;
                }
                done();
            });
        });

        beforeEach(function(done) {
            Games.update({_id: gameId}, {$set: {players: []}}, done);
        });

        it("exclusively locks a selection when a player joins", function(done) {
            Meteor.call("addPlayer", gameId, user1._id, function() {
                Meteor.call("addPlayer", gameId, user2._id, function() {
                    var game = getGame();
                    expect(game.players.length).toBe(2);
                    expect(game.players[0].raceSelection.length).toBe(3);
                    expect(game.players[1].raceSelection.length).toBe(1);
                    done();
                });
            });
        });

        it("releases unselected races when a player selects their race", function(done) {
            Meteor.call("addPlayer", gameId, user1._id, function() {
                var player1Race =  getGame().players[0].raceSelection[0];
                Meteor.call("selectRace", gameId, user1._id, player1Race, function() {
                    expect(getGame().players[0].race).toBe(player1Race);
                    Meteor.call("addPlayer", gameId, user2._id, function() {
                        var game = getGame();
                        expect(game.players.length).toBe(2);
                        expect(game.players[0].raceSelection.length).toBe(3);
                        expect(game.players[1].raceSelection.length).toBe(3);
                        done();
                    });
                });
            });
        });

        afterAll(function (done) {
            Games.remove(gameId);
        });
    });

});