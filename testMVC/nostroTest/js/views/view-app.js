var app = app || {};

(function ($) {
    'use strict';

    app.viewApp = Backbone.View.extend({
        template: _.template($('#app-template').html()),
        el: '.placeholder', // target

        events: {
            // Events here
            'click #new-event' : 'new-event'
        },

        initialize: function() {

            this.$el.html(this.template({'test': 'example'}));
            this.$date = this.$('#event-date');
            this.$descr= this.$('#event-descr');
            this.$list= this.$('.cliccabili');

            var toolbar = new app.viewToolbarElements();
            this.$list.html(toolbar.render().el);

            this.listenTo(toolbar, 'clicked', this.test)
            //app.events.fetch({reset: true});
        },

        render: function() {
        },


        test: function() {
            console.log('test');
        },

        'new-event': function(e) {
            // e.target();
            app.events.create(this.getAttributes());
            //app.events.sync();
        },

        getAttributes: function () {
            return {
                'date': this.$date.val().trim(),
                'descr': this.$descr.val().trim()
            };
        },
    });
})(jQuery);