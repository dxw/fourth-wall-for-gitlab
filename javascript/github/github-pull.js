(function () {
  "use strict";
  window.FourthWall = window.FourthWall || {};

  FourthWall.GitHubPull = Backbone.Model.extend({
    initialize: function () {
      this.set('repo', this.collection.repo);
      this.comment = new FourthWall.GitHubComment();
      this.comment.url = this.get('comments_url');
      this.on('change:comments_url', function () {
        this.comment.url = this.get('comments_url');
        this.comment.fetch();
      }, this);
      this.comment.on('change', function () {
        this.trigger('change');
      }, this);
      this.status = new FourthWall.GitHubStatus({
        baseUrl: this.collection.baseUrl,
        userName: this.collection.userName,
        repo: this.get('repo'),
        sha: this.get('head').sha
      });
      this.on('change:head', function () {
        this.status.set('sha', this.get('head').sha);
      }, this);
      this.status.on('change', function () {
        this.trigger('change');
      }, this);
      this.info = new FourthWall.GitHubInfo({
        baseUrl: this.collection.baseUrl,
        userName: this.collection.userName,
        repo: this.get('repo'),
        pullId: this.get('number')
      }),
      this.on('change:head', function () {
        this.info.set('sha', this.get('head').sha);
      }, this);
      this.info.on('change', function () {
        this.trigger('change');
      }, this);
      this.fetch();
    },

    fetch: function () {
      this.status.fetch();
      this.comment.fetch();
      this.info.fetch();
    },

    parse: function (data) {
      data.elapsed_time = this.elapsedSeconds(data.created_at);
      return data;
    },

    elapsedSeconds: function (created_at) {
      var now = moment();
      created_at = moment(created_at);
      return now.unix() - created_at.unix();
    }
  });
}());