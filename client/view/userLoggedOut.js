Template.userLoggedOut.events({
"click #sign-in-facebook": function(e, tmpl){
    Meteor.loginWithFacebook({

    }, function (err) {
        if (err){
            console.log("ERROR: " + err);//error handling
        } else {
            console.log("NO ERROR ON LOGIN");//show an alert
        }
    })
}
});