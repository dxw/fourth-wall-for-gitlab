(function () {
  "use strict";
  window.FourthWall = window.FourthWall || {};

  FourthWall.GitLabPull = Backbone.Model.extend({
    initialize: function () {
      this.set('repo', this.collection.repo);
      this.status = new FourthWall.GitLabStatus({
        baseUrl: this.collection.baseUrl,
        repo: this.get('repo'),
        sha: this.get('sha')
      });
      this.on('change:head', function () {
        this.status.set('sha', this.get('head').sha);
      }, this);
      this.status.on('change', function () {
        this.trigger('change');
      }, this);
      this.fetch();
    },

    fetch: function () {
      this.status.fetch();
    },

    getAuthorName: function() {
      return this.get('author').name;
    },

    getAuthorUsername: function() {
      return this.get('author').username;
    },

    getAuthorAvatar: function() {
      return this.get('author').avatar_url;
    },

    getNumber: function() {
      return this.get('iid');
    },

    isMergeable: function() {
      return !this.isUnchecked() && 'can_be_merged' === this.get('merge_status');
    },

    isUnchecked: function() {
      return 'unchecked' === this.get('merge_status');
    },

    getCommentCount: function() {
      return this.get('user_notes_count');
    },

    getWebUrl: function() {
      return this.get('web_url');
    },

    parse: function (data) {
      data.elapsed_time = this.elapsedSeconds(data.created_at);
      return data;
    },

    getRepoName: function() {
      return decodeURIComponent(this.get('repo'));
    },
    
    elapsedSeconds: function (created_at) {
      var now = moment();
      created_at = moment(created_at);
      return now.unix() - created_at.unix();
    }
  });
}());
