var VERSION = "XXX";
Meteor.startup(function() {
    gitVersion(function(cb) {
        cb(VERSION);
    });
});

if (Meteor.isClient) {
    Tinytest.add('Version is set as session var', function (test) {
        test.equal(Session.get("gitVersion"), VERSION);
    });
}

Tinytest.addAsync("meteor method returns version", function (test, next) {
    Meteor.call("gitVersion", function (err, version) {
        test.equal(version, VERSION);
        next();
    });
});
