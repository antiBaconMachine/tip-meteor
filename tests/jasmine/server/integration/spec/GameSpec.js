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
        owner: null,
        hideRaces: false
    };
    var gameId;

    beforeAll(function (done) {
        var game = _.extend({}, TEMPLATE, {owner: testUsers[0]["_id"]});
        gameId = Games.insert(game, function (err, doc) {
            if (err) {
                throw err;
            }
            done();
        });
    });

    it("should be seeded with a test game", function () {
        expect(Games.find().count()).toBeGreaterThan(0);
    });

    afterAll(function (done) {
        Games.remove(gameId);
    });

});