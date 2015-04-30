if (Meteor.isClient) {
    Tinytest.add('Version is set as session var', function (test) {
        test.isNotNull(Session.get("gitVersion"));
    });
}

Tinytest.addAsync("meteor method returns version", function (test, next) {
    Meteor.call("gitVersion", function (err, version) {
        test.isNotNull(version);
        next();
    });
});
