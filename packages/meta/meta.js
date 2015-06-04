var meta;
Meteor.startup(function() {
    try {
        var data = YAML.safeLoad(Assets.getText('meta.yaml'));
        if (data.changelog) {
            data.changelog = data.changelog.reverse();
        }
        meta = data;
    } catch (e) {
        console.log(e);
    }

    Meteor.methods({
        meta: function() {
            return meta;
        },
        clogVersion: function() {
            if (meta && meta.changelog && meta.changelog.length) {
                return Object.keys(meta.changelog[0])[0];
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


