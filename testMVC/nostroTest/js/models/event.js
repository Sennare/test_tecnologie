var app = app || {};

(function () {
    'use strict';

    app.Event = Backbone.Model.extend({
        toString: function() {
            return this.get('date') + ' - ' + this.get('description');
        }
    });
})();
