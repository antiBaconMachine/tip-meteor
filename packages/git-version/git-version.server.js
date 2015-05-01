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
            console.log(arguments);
            console.log("VERSION: %s", v);
        });
    } catch(e) {
        console.log("could not get version no: %o", e);
    }
    cb(v);
};

gitVersion = function(versioner) {
    versioner(function(v) {
        version = v;
    });
};

Meteor.startup(function() {
    gitVersion(getVersion);
    Meteor.methods({
        "gitVersion" : function() {
            return version;
        }
    });
});


