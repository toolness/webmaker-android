var view = require('../../lib/view');
var utils = require('../../lib/utils');

var colorGroups = [
    '#333444',
    '#FC5D5E',
    '#FEE444',
    '#1CB0B4',
    '#31ABDF'
];

var ref;

module.exports = view.extend({
    id: 'color-picker',
    template: require('./index.html'),
    created: function () {
        var self = this;
        var id = self.$root.$data.params.id;
        var index = self.$root.$data.params.index;
        var $data = self.$data;

        self.$data.back = '/make/' + id + '/block/' + index;

        // Create block reference
        var path = id + '/blocks/' + index + '/attributes/color/value';
        ref = self.model.firebase.child(path);

        ref.on('value', function (snapshot) {
            var val = snapshot.val();
            self.$root.isReady = true;
            if (!val) return;
            $data.selectedColor = val;
            $data.colors.forEach(function (arr, i) {
                arr.forEach(function (color) {
                    if (color === val) {
                        $data.selectedGroup = i;
                    }
                });
                $data.selectedGroup = $data.selectedGroup || 0;
            });
        });

    },
    data: {
        title: 'Select Color',
        onSelect: function (color) {
            this.$data.selectedColor = color;
            ref.set(color);
        },
        onGroupSelect: function (i) {
            this.$data.selectedGroup = i;
            this.onSelect(colorGroups[i]);
        },
        colorGroups: colorGroups,
        colors: colorGroups.map(function (base) {
            var tints = [];
            for (var i = -5; i < 10; i++) {
                tints.push(utils.shadeColor(base, i * 6));
            }
            return tints;
        })
    }
});
