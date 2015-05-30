var log;
Meteor.startup(function() {
    try {
        var data = YAML.safeLoad(Assets.getText('changelog.yaml'));
        if (data.length) {
            log = data.reverse();
        }
    } catch (e) {
        console.log(e);
    }

    Meteor.methods({
        changelog: function() {
            return log;
        },
        clogVersion: function() {
            if (log && log.length) {
                return Object.keys(log[0])[0];
            }
        }
    });
});

var version = null;
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


