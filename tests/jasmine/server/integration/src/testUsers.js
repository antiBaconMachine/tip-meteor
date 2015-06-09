testUsers = [
    {name: "q", email: "q@q", password: "qqqqqq"}
];

Meteor.startup(function () {
    console.log("Generating test users");
    _.each(testUsers, function (user) {
        var result = Meteor.users.find({"emails": {"$elemMatch": {"address": user.email}}});
        if (result.count() !== 0) {
            user._id = result.fetch()[0]["_id"];
        } else {
            user._id = Accounts.createUser({
                email: user.email,
                password: user.password,
                profile: {name: user.name}
            });
        }
    });
});