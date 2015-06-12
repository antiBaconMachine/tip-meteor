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
            owner: "user1",
            players: [],
            owner: "foo",
            hideRaces: false
        };
        TEMPLATE = _.extend({}, GAME_TEMPLATE, {
            racePool: ALL_RACES
        });
        var testUsers = Package.fixtures.Fixtures.testUsers;
        user1 = testUsers[0];
        Meteor.loginWithPassword(user1.email, user1.password);
        done();
    });

    describe("free choice", function () {

        beforeAll(function(done) {
            pool = ALL_RACES.slice(0, 4);
            insertGame(_.extend({}, TEMPLATE, {
                racePool: TEMPLATE.racePool.slice(0, 4)
            }), done);
        });

        beforeEach(function (done) {
            Games.update({_id: gameId}, {$set: {players: []}}, done);
        });

        it("removes picked races from race pool", function () {
            expect(getGame().raceSelection).not.toBeNull();
            expect(_.contains(getGame().raceSelection, pool[0])).toBe(true);
            expect(_.contains(getGame().raceSelection, pool[1])).toBe(true);
            Meteor.call("addPlayer", gameId, user1._id);
            Meteor.call("selectRace", gameId, user1._id, pool[0]);
            expect(_.contains(getGame().raceSelection, pool[0])).not.toBe(true, "races are not being removed from shared pool");
            expect(_.contains(getGame().raceSelection, pool[1])).toBe(true);
        });

    });

    afterAll(function (done) {
        Games.remove(gameId);
    });
});