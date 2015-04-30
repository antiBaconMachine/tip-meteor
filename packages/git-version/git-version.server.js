var version = "DEV";

getVersion = function(cb) {
    var v = version;
    try {
        Npm.require("child_process").exec("git describe", function(error, sout, serr) {
            if (!error) {
                v = sout;
            } else {
                console.warn(error);
            }
            console.log("VERSION: %s", version);
        });
    } catch(e) {
        console.log("could not get version no: %o", e);
    }
    cb(v);
}

Meteor.startup(function() {
    Package["abm:git-version"]["getVersion"](function(v) {
       version = v;
    });
    Meteor.methods({
        "gitVersion" : function() {
            return version;
        }
    });
});


