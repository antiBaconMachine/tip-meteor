var VERSION = "XXX";

if (Meteor.isServer) {
    var package = Package['abm:git-version'];
    stubs.create('getVersion', package, 'getVersion');
    stubs.getVersion.returns("XXX");
}

if (Meteor.isClient) {
    Tinytest.add('Version is set as session var', function (test) {
        test.equal(Session.get("gitVersion"), VERSION);
    });
}

Tinytest.addAsync("meteor method returns version", function (test, next) {
    Meteor.call("gitVersion", function (err, version) {
        test.isNotNull(version);
        next();
    });
});
