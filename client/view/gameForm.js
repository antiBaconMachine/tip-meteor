Template.gameForm.events({
    "change input[name='selectionMethod']": function (event, template) {
        console.info("Cheanged selection method to %s, compare to %s, %o", event.target.value, SELECTION_METHODS.PICK_FROM_SELECTION.key, event);
        if (event.target.value ===
            SELECTION_METHODS.PICK_FROM_SELECTION.key) {
            console.info("true");
            Session.set("isCountRaces", true);
        } else {
            Session.set("isCountRaces", false);
        }
    }
});
Template.gameForm.helpers({
    selectionMethod: function () {
        return _.collect(SELECTION_METHODS, function (v, k) {
            return {
                value: k,
                label: v.label,
                description: v.description,
                checked: v.checked ? "checked='checked'" : ""
            };
        });
    },
    isCountRaces: function () {
        return Session.get("isCountRaces");
    },
    countRaces: function () {
        return _.collect(_.range(2, 6, 1), function (i) {
            return {
                value: i,
                label: i
            };
        });
    },
    racePool: _.once(function () {
        return _.collect(Races.find().fetch(), function (race) {
            return {
                value: race._id,
                label: race.name
            };
        });
    }),
    maxPlayers: function () {
        return _.collect(_.range(3, 9, 1), function (i) {
            return {
                value: i,
                label: i
            };
        });
    },
    isNew: function() {
        return this.type === "insert";
    }
});


AutoForm.hooks({
    insertGameForm : {
        onSuccess: function(formType) {
            Router.go("showGame", {_id: this.docId});
        }
    }
});
