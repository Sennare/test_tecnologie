/*global $ */
/*jshint unused:false */
var app = app || {};

(function () {
    'use strict';

    app.viewApp = Backbone.View.extend({
        tagName: 'div',
        className: 'app-container',
        template: _.template($('#app-template').html()),
        el: '.placeholder',

        events: {
            // Events here
            'click #new-event' : 'new-event'
        },

        initialize: function() {
            this.render();

            this.$date = this.$('#event-date');
            this.$descr= this.$('#event-descr');

            app.events.fetch({reset: true});
        },

        render: function() {
            this.$el.html(this.template({'test': 'example'}));
            return this;
        },

        'new-event': function(e) {
            // e.target();
            app.events.create(this.getAttributes());
            app.events.sync();
        },

        getAttributes: function () {
            return {
                'date': this.$date.val().trim(),
                'descr': this.$descr.val().trim()
            };
        },
    });
})();