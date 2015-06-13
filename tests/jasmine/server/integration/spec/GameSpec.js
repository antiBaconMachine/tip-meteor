describe("Game", function () {
    var testUsers = Package.fixtures.Fixtures.testUsers;
    var ALL_RACES = _.pluck(Races.find().fetch(), "_id");
    var GAME_TEMPLATE = {
        name: "Test Game",
        date: new Date(),
        location: "A place",
        description: "A description",
        selectionMethod: SELECTION_METHODS.PICK_FROM_SELECTION.key,
        countRaces: 3,
        maxPlayers: 3,
        racePool: ["foo", "bar", "spam", "eggs"],
        owner: "user1",
        players: [],
        owner: testUsers[0]["_id"],
        hideRaces: false
    };
    var TEMPLATE = _.extend({}, GAME_TEMPLATE, {
        racePool: ALL_RACES,
        owner: testUsers[0]["_id"],
    });
    var gameId;
    var user1 = testUsers[0];
    var user2 = testUsers[1];
    var user3 = testUsers[2];
    var user4 = testUsers[3];

    var insertGame = function (game, done) {
        gameId = Games.insert(game, function (err, doc) {
            if (err) {
                throw err;
            }
            done();
        });
    };

    var getGame = function () {
        return Games.find({_id: gameId}).fetch()[0];
    };

    beforeEach(function (done) {
        Games.update({_id: gameId}, {$set: {players: []}}, done);
    });

    describe("(in select from n mode)", function () {
        beforeAll(function (done) {
            insertGame(_.extend({}, TEMPLATE, {
                racePool: TEMPLATE.racePool.slice(0, 4)
            }), done);
        });

        it("exclusively locks a selection when a player joins", function (done) {
            Meteor.call("addPlayer", gameId, user1._id);
            Meteor.call("addPlayer", gameId, user2._id);
            var game = getGame();
            expect(game.players.length).toBe(2);
            expect(game.players[0].raceSelection.length).toBe(3);
            expect(game.players[1].raceSelection.length).toBe(1);
            done();
        });

        it("releases unselected races when a player selects their race", function (done) {
            Meteor.call("addPlayer", gameId, user1._id, function () {
                var player1Race = getGame().players[0].raceSelection[0];
                Meteor.call("selectRace", gameId, user1._id, player1Race, function () {
                    expect(getGame().players[0].race).toBe(player1Race);
                    Meteor.call("addPlayer", gameId, user2._id, function () {
                        var game = getGame();
                        expect(game.players.length).toBe(2);
                        expect(game.players[0].raceSelection.length).toBe(3);
                        expect(game.players[1].raceSelection.length).toBe(3);
                        done();
                    });
                });
            });
        });

        it("errors when a user attempts to select a race not in their selection", function () {
            Meteor.call("addPlayer", gameId, user1._id);
            expect(function () {
                Meteor.call("selectRace", gameId, user1._id, ALL_RACES[10]);
            }).toThrow();
        });

    });

    describe("(In free selection mode)", function () {
        var pool = TEMPLATE.racePool.slice(0, 4);
        beforeAll(function (done) {
            insertGame(_.extend({}, TEMPLATE, {
                racePool: pool,
                selectionMethod: SELECTION_METHODS.FREE.key
            }), done);
        });

        beforeEach(function () {
            Meteor.call("addPlayer", gameId, user1._id);
        });

        it("allows any unpicked race from the pool", function () {
            Meteor.call("selectRace", gameId, user1._id, pool[0]);
            expect(getGame().players[0].race).toBe(pool[0]);
        });

        it("does not allow races from outside pool", function () {
            expect(function () {
                Meteor.call("selectRace", gameId, user1._id, ALL_RACES[10]);
            }).toThrow();
        });

        it("does not allow races which have already been picked", function () {
            Meteor.call("selectRace", gameId, user1._id, pool[0]);
            expect(function () {
                Meteor.call("selectRace", gameId, user2._id, pool[0]);
            }).toThrow();
        });

        it("does not exclusively lock races", function () {
            Meteor.call("addPlayer", gameId, user2._id);
            Meteor.call("selectRace", gameId, user2._id, pool[0]);
            var player = getGame().players[1];
            expect(player.race).toBe(pool[0], "Race not selected");
            expect(player._id).toBe(user2._id);
        });

        //test is solid but must be run on client as it relies on a pub transform
        //it("removes picked races from race pool", function() {
        //    Meteor.call("selectRace", gameId, user1._id, pool[0]);
        //    expect(getGame().raceSelection).not.toBeNull();
        //    expect(_.contains(getGame().raceSelection, pool[0])).not.toBe(true);
        //    console.log("TEST RACE SELECTION ", getGame());
        //    expect(_.contains(getGame().raceSelection, pool[1])).toBe(true, getGame());
        //    Meteor.call("addPlayer", gameId, user2._id);
        //    Meteor.call("selectRace", gameId, user2._id, pool[0]);
        //    expect(_.contains(getGame().raceSelection, pool[1])).not.toBe(true, "races are not being removed from shared pool");
        //});

    });

    describe("(In random mode)", function () {
        var pool = TEMPLATE.racePool.slice(0, 4);
        beforeAll(function (done) {
            insertGame(_.extend({}, TEMPLATE, {
                racePool: pool,
                selectionMethod: SELECTION_METHODS.RANDOM.key
            }), done);
        });

        it("Immediately adds a player with a race from the pool", function () {
            Meteor.call("addPlayer", gameId, user1._id);
            var player = getGame().players[0];
            expect(_.contains(pool, player.race)).toBeTruthy();
            expect(player.raceSelection).toBeFalsy();
        });

        it("does not allow more than max players", function () {
            Meteor.call("addPlayer", gameId, user1._id);
            Meteor.call("addPlayer", gameId, user2._id);
            Meteor.call("addPlayer", gameId, user3._id);
            expect(function () {
                Meteor.call("addPlayer", gameId, user4._id);
            }).toThrow();
        });

    });

    describe("with races shown", function () {
        var pool = TEMPLATE.racePool.slice(0, 3);
        beforeAll(function (done) {
            insertGame(_.extend({}, TEMPLATE, {
                racePool: pool
            }), done);
        });

        beforeEach(function (done) {
            Meteor.call("addPlayer", gameId, user1._id, done);
        });

        it("does not provide rejected races before the player has picked", function () {
            var game = getGame();
            var player = game.players[0];
            expect(game.rejected(player)).toBeNull();
        });

        it("provides a list of rejected races once the user has picked", function () {
            Meteor.call("selectRace", gameId, user1._id, pool[0]);
            var game = getGame();
            var player = game.players[0];
            var rejected = game.rejected(player);
            expect(rejected).not.toBeNull();
            expect(rejected.length).toBe(2);
            expect(_.contains(rejected, Races.findOne(pool[0]).name)).toBeFalsy();
            expect(_.contains(rejected, Races.findOne(pool[1]).name)).toBeTruthy();
            expect(_.contains(rejected, Races.findOne(pool[2]).name)).toBeTruthy();
        });
    });

    describe("with races hidden", function() {
        var pool = TEMPLATE.racePool.slice(0, 3);
        beforeAll(function (done) {
            insertGame(_.extend({}, TEMPLATE, {
                racePool: pool,
                hideRaces: true
            }), done);
        });

        //TODO this would be more appropriate client side as that's where it's used. Haven't got client side tests working yet, but should be straightforward to move once they are
        it("does not provide rejected races until races are shown", function() {
            Meteor.call("addPlayer", gameId, user1._id);
            Meteor.call("selectRace", gameId, user1._id, pool[0]);
            var game = getGame();
            var rejected = game.rejected(game.players[0]);
            expect(rejected).toBeNull();
            Games.update({_id: gameId}, {$set: {hideRaces: false}});
            game = getGame();
            rejected = game.rejected(game.players[0]);
            expect(rejected).not.toBeNull();
            expect(rejected.length).toBe(2);
        })
    });

    afterAll(function (done) {
        Games.remove(gameId);
    });

});