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
            console.log("created test game ", doc._id);
            done();
        });
    };

    var getGame = function () {
        return Games.findOne(gameId);
    };

    beforeAll(function (done) {
        var testUsers = Package.fixtures.Fixtures.testUsers;
        user1 = testUsers[0];

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
            owner: user1._id,
            players: [],
            hideRaces: false
        };
        TEMPLATE = _.extend({}, GAME_TEMPLATE, {
            racePool: ALL_RACES,
            owner: user1._id
        });
        Meteor.loginWithPassword(user1.email, user1.password);
        done();
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
            expect(getGame().players.length).toBe(0);
            expect(getGame().selectionPool).toBeDefined();
            expect(getGame().selectionPool.sort()).toEqual(pool.sort(), "selectionPool and racePool do not initially match");
            expect(_.contains(getGame().selectionPool, pool[0])).toBe(true);
            expect(_.contains(getGame().selectionPool, pool[1])).toBe(true);

            Meteor.promise("addPlayer", gameId, user1._id)
                .then(function () {
                    expect(getGame().players.length).toBe(1);
                    expect(getGame().players[0].picked).toBe(false);
                    return Meteor.promise("selectRace", gameId, user1._id, pool[0]);
                })
                .then(function () {
                    expect(getGame().players[0].picked).toBe(true);
                    expect(getGame().players[0].race).toBe(pool[0]);
                    expect(_.contains(getGame().selectionPool, pool[0])).not.toBe(true, "races are not being removed from shared pool");
                    expect(_.contains(getGame().selectionPool, pool[1])).toBe(true);
                })
                .then(done)
                .catch(done);
        });

    });

    afterAll(function (done) {
        Games.remove(gameId);
    });
});