userController = RouteController.extend({
    data: function() {
        return Meteor.users.findOne({_id: this.params._id});
    }
});