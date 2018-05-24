var app = app || {};

(function () {
    'use strict';

    app.Event = Backbone.Model.extend({
        defaults: {
            'data': '',
            'descr': ''
        },

        toString: function() {
            return this.get('date') + ' - ' + this.get('description');
        },

        insert: function(field, value) {
            if (this.has(field))
                this.set(field, value);
        }
    });
})();
