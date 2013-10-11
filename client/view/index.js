Template.index.showCreateDialog = function() {
    return Session.get("showCreateDialog");
};
Template.index.events({
    'click #btnCreateGame': function() {
        console.info("creating game");
        openCreateDialog();
    }
});
var openCreateDialog = function() {
    console.info("hi");
    Session.set("createError", null);
    Session.set("showCreateDialog", true);
};