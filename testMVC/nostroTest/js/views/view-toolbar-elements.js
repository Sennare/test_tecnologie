var app = app || {};

(function ($) {
    'use strict';

    app.viewToolbarElements = Backbone.View.extend({

        template: _.template($('#toolbarelements-template').html()),
        tagName: 'li',

        events: {
            // Events here
            'click .clickMe' : 'clicked'
        },

        initialize: function() {
        },

        render: function() {
            this.$el.html(this.template({}));
            return this;
        },

        clicked: function() {
            console.log('step 1');
            this.trigger("clicked");
        }
    });
})(jQuery);