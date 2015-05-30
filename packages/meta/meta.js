var log;
changelog = function() {
    return log;
};

Meteor.startup(function() {
    try {
        var data = YAML.safeLoad(Assets.getText('changelog.yaml'));
        if (data.length) {
            log = data.reverse();
        }
    } catch (e) {
        console.log(e);
    }
});
