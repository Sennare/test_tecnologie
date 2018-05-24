/*global $ */
/*jshint unused:false */
var app = app || {};

// noinspection BadExpressionStatementJS
(function ($) {
    'use strict';

    var router = Backbone.Router.extend({
        routes: {
            'home':     'index',
            'zoom/:query':  'lol'
        },

        index: function() {

        },

        lol(query) {
            console.log("res "+query);
        }
    });

    app.routing = new router();
    Backbone.history.start();

})();