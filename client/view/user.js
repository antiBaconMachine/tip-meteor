Template.user.rendered = function () {
    $('#displayName.editable').editable({
        success: function (response, newValue) {
            var user = Meteor.user();
            Meteor.users.update({_id: user._id}, {$set: {"profile.displayName": newValue}});
        }
    });
};