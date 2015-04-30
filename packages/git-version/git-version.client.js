Meteor.startup(function() {
    Meteor.call("gitVersion", function(err, version) {
        Session.set("gitVersion", version);
    });
});

Template.gitVersion.helpers({
    version: function() {
        return Session.get("gitVersion");
    }
});

getVersion = function() {
    return "version";
}