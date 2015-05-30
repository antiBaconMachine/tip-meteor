Template.layout.helpers({
    version: function() {
        return Session.get("gitVersion") || Session.get("clogVersion");
    }
});