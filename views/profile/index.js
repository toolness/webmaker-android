var view = require('../../lib/view');

module.exports = view.extend({
    id: 'profile',
    template: require('./index.html'),
    data: {
        title: 'My Profile',
        back: false,
        myApps: []
    },
    computed: {
        user: function () {
            return this.model.data.session.user;
        }
    },
    methods: {
        logout: function (e) {
            e.preventDefault();
            this.model.auth.logout();
        },
        clean: function (e) {
            var self = this;
            self.$data.myApps.forEach(function (app) {
                self.model.firebase.child(app.id).remove();
            });
            self.$data.myApps = [];
        }
    },
    created: function () {
        var self = this;
        var user = self.model.data.session.user;
        var userId = user && user.id || self.model.data.session.guestId;

        function onRemoved(snapshot) {
            var key = snapshot.key();
            var index = false;
            self.$data.myApps.forEach(function (app, i) {
                console.log(app.id);
                if (app.id === key) index = i;
            });
            if (index !== false) self.$data.myApps.splice(index, 1);
        }

        function onChanged(snapshot) {
            var key = snapshot.key();
            var val = snapshot.val();
            if (!val) return;
            val.id = key;
            self.$data.myApps.forEach(function (app, i) {
                if (app.id === key) {
                    self.$data.myApps[i] = val;
                }
            });
        }

        self.$root.isReady = true;
        self.$root.myApps = [];
        function onAdded(snapshot) {
            var data = snapshot.val();
            var dupe;
            if (!data) return;
            data.id = snapshot.key();
            // Duplicates
            self.$data.myApps.forEach(function (app) {
                if (app.id === data.id) dupe = true;
            });
            if (!dupe) self.$data.myApps.push(data);
        }

        if (userId) {
            var query = self.model.firebase
                .orderByChild('userId')
                .equalTo(userId);

            query.on('child_added', onAdded);
            query.on('child_changed', onChanged);
            query.on('child_removed', onRemoved);
        } else {
            self.$root.isReady = true;
        }
    }
});
