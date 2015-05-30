Template.about.helpers({
    changelog: function() {
        if (!Session.get("changelog")) {
            Meteor.call("changelog", function(err, log) {
                Session.set("changelog", log);
            });
        }
        return Session.get("changelog");
    }
});