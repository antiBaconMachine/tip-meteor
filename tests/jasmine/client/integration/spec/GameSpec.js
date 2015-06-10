var insertGame = function (game, done) {
    return Games.insert(game, function (err, doc) {
        if (err) {
            throw err;
        }
        done(doc);
    });
};


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

//todo these need to be in a utility helper somewhere
gameHelpers = {
    allRaces: ALL_RACES,
    gameTemplate: GAME_TEMPLATE,
    insertGame: insertGame
};

describe("Game", function () {

    var gameId;
    var game;

    describe("with races shown", function () {

        beforeAll(function (done) {
            gameId = gameHelpers.insertGame(_.extend({}, gameHelpers.gameTemplate, {
                players: [{
                    _id: "foo",
                    raceSelection: ["foo", "bar", "spam"],
                    race: null
                }]
            }), function (doc) {
                game = doc;
                done();
            });
        });

        it("Does not provide rejected races until a user has picked", function () {
            expect(game.rejected(game.players[0])).toBeNull();
        });

    });

    afterAll(function () {
        Games.remove(gameId);
    });
});