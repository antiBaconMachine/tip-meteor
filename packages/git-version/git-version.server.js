var version = "DEV";
Meteor.startup(function() {
    try {
        Npm.require("child_process").exec("git describe", function(error, sout, serr) {
            if (!error) {
                version = sout;
            }
            console.log("VERSION: %s", version);
        });
    } catch(e) {
        console.log("could not get version no: %o", e);
    }

    Meteor.methods({
        "gitVersion" : function() {
            return version;
        }
    });
});

