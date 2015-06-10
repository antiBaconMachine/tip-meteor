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

describe("Game", function () {

    describe("with races shown", function () {
        it("does stuff", function () {
            expect(true).toBeFalsy();
        });
    });

});