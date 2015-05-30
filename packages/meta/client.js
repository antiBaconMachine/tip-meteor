Meteor.startup(function() {
    Meteor.call("gitVersion", function(err, version) {
        Session.set("gitVersion", version);
    });
    Meteor.call("clogVersion", function(err, version) {
        Session.set("clogVersion", version);
    });
});