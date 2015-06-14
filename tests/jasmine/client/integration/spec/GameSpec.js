describe("Game", function () {
    var TEMPLATE,
        ALL_RACES;
    var gameId,
        pool,
        user1;

    var insertGame = function (game, done) {
        //TODO update to use meteor method;
        gameId = Games.insert(game, function (err, doc) {
            if (err) {
                throw err;
            }
            done();
        });
    };

    var getGame = function () {
        return Games.findOne(gameId);
    };

    beforeAll(function (done) {
        var testUsers = Package.fixtures.Fixtures.testUsers;
        user1 = testUsers[0];
        Meteor.loginWithPassword(user1.email, user1.password, function(err) {
            if (err) {
                done();
                throw err;
            }
            ALL_RACES = _.pluck(Races.find().fetch(), "_id");
            var GAME_TEMPLATE = {
                name: "Test Game",
                date: new Date(),
                location: "A place",
                description: "A description",
                selectionMethod: SELECTION_METHODS.PICK_FROM_SELECTION.key,
                countRaces: 3,
                maxPlayers: 3,
                racePool: ["foo", "bar", "spam", "eggs"],
                owner: "foo",
                players: [],
                hideRaces: false
            };
            TEMPLATE = _.extend({}, GAME_TEMPLATE, {
                racePool: ALL_RACES,
                owner: Meteor.userId()
            });

            done();
        });
    });

    it("should be logged in before starting tests", function() {
        expect(Meteor.userId()).toBeDefined();
    });

    describe("in free choice mode", function () {

        beforeAll(function (done) {
            pool = ALL_RACES.slice(0, 4);
            insertGame(_.extend({}, TEMPLATE, {
                racePool: TEMPLATE.racePool.slice(0, 4),
                selectionMethod: SELECTION_METHODS.FREE.key
            }), done);
        });

        beforeEach(function (done) {
            Games.update({_id: gameId}, {$set: {players: []}});
            Meteor.call("kickplayer", gameId, user1._id, done);
        });

        it("allows players to join", function (done) {
            expect(getGame().players.length).toBe(0);
            Meteor.promise("addPlayer", gameId, user1._id)
                .then(function () {
                    expect(getGame().players.length).toBe(1);
                })
                .then(done)
                .catch(function (err) {
                    expect(err).not.toBeDefined();
                    throw err;
                    done();
                })
        });

        it("allows players to select a race", function (done) {
            Meteor.promise("addPlayer", gameId, user1._id)
                .then(function () {
                    var player = getGame().players[0];
                    expect(player.picked).toBe(false);
                    return Meteor.promise("selectRace", gameId, user1._id, pool[0]);
                })
                .then(function () {
                    player = getGame().players[0];
                    expect(player.picked).toBe(true);
                    expect(player.race).toBe(pool[0]);
                })
                .then(done)
                .catch(done);
        });

        it("removes picked races from race pool", function (done) {
            expect(getGame().selectionPool).toBeDefined();
            expect(getGame().selectionPool.sort()).toEqual(pool.sort(), "selectionPool and racePool do not initially match");

            Meteor.promise("addPlayer", gameId, user1._id)
                .then(function () {
                    expect(getGame().players.length).toBe(1);
                    expect(getGame().players[0].picked).toBe(false);
                    expect(getGame().selectionPool.sort()).toEqual(pool.sort(), "selectionPool has been affected by a player joining but not picking");
                    return Meteor.promise("selectRace", gameId, user1._id, pool[0]);
                })
                .then(function () {
                    expect(getGame().players[0].picked).toBe(true);
                    expect(getGame().players[0].race).toBe(pool[0]);
                    expect(_.contains(getGame().selectionPool, pool[0])).not.toBe(true, "races are not being removed from shared pool");
                    expect(getGame().selectionPool.sort()).toEqual(_.without(pool.sort(), pool[0]), "selectionPool has been updated incorrectly");
                })
                .then(done)
                .catch(done);
        });

        afterAll(function (done) {
            Games.remove(gameId, done);
        });

    });

    describe("is published", function() {

        it("when in the future", function(done) {
            var d = new Date();
            d.setDate(d.getDate() + 1);
            insertGame(_.extend({}, TEMPLATE, {
                date: d
            }), function() {
                var games = Games.find().fetch();
                expect(_.chain(games).pluck("_id").contains(gameId).value()).toBe(true);
                done();
            });
        });

        it("when today", function(done) {
            var d = new Date();
            insertGame(_.extend({}, TEMPLATE, {
                date: d
            }), function() {
                var games = Games.find().fetch();
                expect(_.chain(games).pluck("_id").contains(gameId).value()).toBe(true);
                done();
            });
        });

        it("not when in past", function(done) {
            var d = new Date();
            d.setDate(d.getDate() - 1);
            insertGame(_.extend({}, TEMPLATE, {
                date: d
            }), function() {
                var games = Games.find().fetch();
                expect(_.chain(games).pluck("_id").contains(gameId).value()).toBe(false);
                done();
            });
        });

        afterEach(function(done) {
            Games.remove(gameId, done);
        });
    });

    afterAll(function (done) {
        Games.remove(gameId);
        Meteor.logout(done);
    });
});