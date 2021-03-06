(function () {
  "use strict";
  window.FourthWall = window.FourthWall || {};
  
  FourthWall.getQueryVariables = function(search) {
    search = search || FourthWall._getLocationSearch();
    return search
      .replace(/(^\?)/,'')
      .split("&")
      .reduce( function(params, n) {
        n = n.split("=");
        var arrayKey = /^(.*)\[\]$/.exec(n[0]);
        if (arrayKey) {
          if (params[arrayKey[1]] instanceof Array) {
            params[arrayKey[1]].push(n[1]);
          } else {
            params[arrayKey[1]] = [n[1]];
          }
        } else {
          params[n[0]] = n[1];
        }
        return params;
      }, {});
  };

  FourthWall.getQueryVariable = function (name, search) {
    return FourthWall.getQueryVariables(search)[name];
  };

  FourthWall.getGitLabApiUrl = function() {
    var gitLabHost = FourthWall.getGitLabHost();
    if(!gitLabHost) {
      console.log( 'No GitLab host is given. Set gitlab_host=my.gitlab.host in the URL.' )
    }
    return 'https://' + gitLabHost + '/api/v3';
  }

  FourthWall.getRepositoryEndpoint = function() {
    return FourthWall.getGitLabApiUrl() + '/projects';
  };

  FourthWall.getGitLabHost = function() {
    var host;
    host = FourthWall.getQueryVariable('gitlab_host');
    if(!host) {
      host = localStorage.getItem('gitlab_host');
    }
    return host;
  }

  FourthWall._getLocationSearch = function() {
    return window.location.search;
  };

  FourthWall.buildQueryString = function(params) {
    var param_string = $.param(params);
    if(param_string.length > 0) {
      param_string = "?" + param_string;
    }
    return param_string;
  };

  FourthWall.getToken = function() {
    var token;
    token = FourthWall.getQueryVariable('token');
    if(!token) {
      token = localStorage.getItem('token');
    }
    return token;
  };

  FourthWall.fetchDefer = function(options) {
    var d = $.Deferred();
    var needsAuthentication = !options.url.match(/api\.github\.com\/gists/);
    $.ajax({
      type: "GET",
      beforeSend: needsAuthentication ? setupGitLabAuthentication(options.url) : function(){},
      url: options.url,
      data: options.data
    }).done(function(result) {
      d.resolve(options.done(result));
    }).fail(d.reject);

    return d.promise();
  };

  FourthWall.overrideFetch = function(url) {
    return Backbone.Model.prototype.fetch.apply(this, [{
      beforeSend: setupGitLabAuthentication(url)
    }]);
  };

  var setupGitLabAuthentication = function (baseUrl) {
    return function(xhr) {
      var token = FourthWall.getToken();
      if (token !== false && token !== '') {
        xhr.setRequestHeader('PRIVATE-TOKEN', token);
      }
    };
  };

  // hack for SimpleHTTPServer appending a slash
  var stripSlash = function(string){
    if (string) {
      return string.replace(/\/$/, '');
    }
  };

  FourthWall.appendCSS = function(css) {
    var $custom_css = $('<style>');
    $custom_css.text( css );
    $('head').append( $custom_css );
  };

  FourthWall.gistId = stripSlash(
    FourthWall.getQueryVariable('gist')
  );

  FourthWall.jsonUrl = stripSlash(
    FourthWall.getQueryVariable('json')
  );

  FourthWall.cssUrl = stripSlash(
    FourthWall.getQueryVariable('css')
  );
})();
