var handler = require("./bundle/index.js").handler;

var event = {};

var context = {
    success: function (a) {
        console.log(a);
    },
    fail: function (a) {
        console.log(a);
    }
};

handler(event, context);
