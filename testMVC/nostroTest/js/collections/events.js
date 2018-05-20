var app = app || {};

(function () {
    'use strict';

    var collectionEvent = Backbone.Collection.extend({
        model: app.Event,

        // Salvo in locale
        localStorage: new Backbone.LocalStorage('Ironworks'),

        comparator: 'date'
    });

    app.events = new collectionEvent();
})();
