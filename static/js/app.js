(function() {
  var App;

  App = window.App = angular.module('subfwd', []);

  App.controller('ManagerController', function($rootScope, $scope, $window, $http, $timeout, console, storage) {
    var scope;
    scope = $rootScope.mgr = $scope;
    scope.domain = "";
    scope.$watch("domain", function() {
      return scope.setupOk = false;
    });
    scope.loading = false;
    return scope.setup = function() {
      scope.setupOk = false;
      scope.setupErr = "";
      scope.loading = true;
      $http.get("/setup?domain=" + scope.domain).success(function() {
        ga('send', 'event', 'Setup OK', scope.domain);
        return scope.setupOk = true;
      }).error(function(err) {
        ga('send', 'event', 'Setup Error', scope.domain, err);
        console.error(err);
        return scope.setupErr = err;
      })["finally"](function() {
        return scope.loading = false;
      });
    };
  });

  App.directive("enter", function() {
    return function(scope, element, attrs) {
      element.bind("keydown keypress", function(event) {
        if (event.which !== 13) {
          return;
        }
        scope.$apply(function() {
          scope.$eval(attrs.enter);
        });
        return event.preventDefault();
      });
    };
  });

  App.factory('console', function($window) {
    var c, str;
    ga('create', 'UA-38709761-15', 'auto');
    ga('send', 'pageview');
    setInterval((function() {
      return ga('send', 'event', 'Ping');
    }), 60 * 1000);
    str = function(args) {
      return Array.prototype.slice.call(args).join(' ');
    };
    c = $window.console;
    return {
      log: function() {
        c.log.apply(c, arguments);
        return ga('send', 'event', 'Log', str(arguments));
      },
      error: function() {
        c.error.apply(c, arguments);
        return ga('send', 'event', 'Error', str(arguments));
      }
    };
  });

  App.factory('storage', function() {
    var storage, wrap;
    wrap = function(ns, fn) {
      return function() {
        arguments[0] = [ns, arguments[0]].join('-');
        return fn.apply(null, arguments);
      };
    };
    storage = {
      create: function(ns) {
        var fn, k, s;
        s = {};
        for (k in storage) {
          fn = storage[k];
          s[k] = wrap(ns, fn);
        }
        return s;
      },
      get: function(key) {
        var str;
        str = localStorage.getItem(key);
        if (str && str.substr(0, 4) === "J$ON") {
          return JSON.parse(str.substr(4));
        }
        return str;
      },
      set: function(key, val) {
        if (typeof val === 'object') {
          val = "J$ON" + (JSON.stringify(val));
        }
        return localStorage.setItem(key, val);
      },
      del: function(key) {
        return localStorage.removeItem(key);
      }
    };
    return window.storage = storage;
  });

  App.factory('$exceptionHandler', function(console) {
    return function(exception, cause) {
      console.error('Exception caught\n', exception.stack || exception);
      if (cause) {
        return console.error('Exception cause', cause);
      }
    };
  });

  App.run(function($rootScope, console, $http) {
    var scope;
    scope = window.root = $rootScope;
    console.log('Init');
    scope.onHeroku = false;
    scope.uptime = null;
    scope.forwards = 0;
    $http.get("/stats").success(function(data) {
      scope.onHeroku = data.Heroku;
      scope.uptime = data.Uptime;
      return scope.forwards = data.Success;
    });
  });

}).call(this);
