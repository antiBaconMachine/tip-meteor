Meteor.startup(function () {
    if (!Session.get("meta")) {
        Meteor.call("meta", function (err, log) {
            Session.set("meta", log);
        });
    }
});

Template.about.helpers({
    changelog: function () {
        return (Session.get("meta") || {})["changelog"];
    },
    lastPublished: function () {
        return (Session.get("meta") || {})["published"];
    },
    commitDate: function() {
        return new Date(this.value.date).toLocaleDateString();
    }
});