Template.createDialog.events({
    'click .save': function(event, template) {
        var title = template.find(".title").value;
        var description = template.find(".description").value;

        if (title.length) {
            Meteor.call(
                    'createGame',
                    {
                        title: title,
                        description: description
                    }
            );
            Session.set("showCreateDialog", false);
        } else {
            Session.set("createError",
                    "It needs a title and a description, or why bother?");
        }
    },
    'click .cancel': function() {
        Session.set("showCreateDialog", false);
    }
});