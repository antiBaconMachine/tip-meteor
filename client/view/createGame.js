Template.createGame.events({
    'click .save': function(event, template) {
        saveGame(template);
        Router.go("index");
        return false;
    },
    'click .cancel': function() {
        
    },
    "change input[name='selectionMethod']" : function(event, template) {
        console.info("Event %o", event);
        if (event.target.value === 
                SELECTION_METHODS.PICK_FROM_SELECTION.key) {
                Session.set("isCountRaces", true);
        } else {
                Session.set("isCountRaces", false);
        }
    }
});

Template.createGame.helpers({
     selectionMethod : function() {
         return _.collect(SELECTION_METHODS, function(v, k) {
             return {
                 method : k,
                 label : v.label,
                 description : v.description,
                 checked : v.checked ? "checked='checked'" : ""
             };
         });
     },
     countRaces : function() {
        return [2,3,4,5,];
     },
     maxPlayers : function() {
        return [3,4,5,6,7,8];
     }
});

var dataFromTemplate = function(template) {
    return {
        title : template.find(".title").value,
        description : template.find(".description").value,
        date : template.find(".date").value,
        location : template.find(".location").value,
        config : {
            selectionMethod : {
                selectionMethod : template.find(".selectionMethod").value,
                options : {
                    noRaces : template.find(".noRaces").value
                }
            },
            maxPlayers : template.find(".maxPlayers").value,
            racePool : generateRacePool(template)
        }
    }
}

var saveGame = function(template) {
    var data = dataFromTemplate(template);
    var game = new Game(data);
    
    //TODO validate
    if (true) {
        Meteor.call('createGame',game);
        Session.set("showCreateDialog", false);
    } else {
        Session.set("createError",
                "It needs a title and a description, or why bother?");
    }
};

var generateRacePool = function(template) {
    return _.pluck(Races.find({}).fetch(), "_id");
};