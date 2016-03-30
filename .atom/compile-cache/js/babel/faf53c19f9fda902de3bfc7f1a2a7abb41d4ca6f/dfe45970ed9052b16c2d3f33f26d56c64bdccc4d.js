Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _querystring = require('querystring');

var _querystring2 = _interopRequireDefault(_querystring);

'use babel';

var GoogleAnalytics = (function () {
  function GoogleAnalytics() {
    _classCallCheck(this, GoogleAnalytics);
  }

  _createClass(GoogleAnalytics, null, [{
    key: 'getCid',
    value: function getCid(cb) {
      var _this = this;

      if (this.cid) {
        return cb(this.cid);
      }

      require('getmac').getMac(function (error, macAddress) {
        return error ? cb(_this.cid = require('node-uuid').v4()) : cb(_this.cid = require('crypto').createHash('sha1').update(macAddress, 'utf8').digest('hex'));
      });
    }
  }, {
    key: 'sendEvent',
    value: function sendEvent(category, action, label, value) {
      var params = {
        t: 'event',
        ec: category,
        ea: action
      };
      if (label) {
        params.el = label;
      }
      if (value) {
        params.ev = value;
      }

      this.send(params);
    }
  }, {
    key: 'send',
    value: function send(params) {
      var _this2 = this;

      if (!atom.packages.getActivePackage('metrics')) {
        // If the metrics package is disabled, then user has opted out.
        return;
      }

      GoogleAnalytics.getCid(function (cid) {
        _lodash2['default'].extend(params, { cid: cid }, GoogleAnalytics.defaultParams());
        _this2.request('https://www.google-analytics.com/collect?' + _querystring2['default'].stringify(params));
      });
    }
  }, {
    key: 'request',
    value: function request(url) {
      if (!navigator.onLine) {
        return;
      }
      this.post(url);
    }
  }, {
    key: 'post',
    value: function post(url) {
      var xhr = new XMLHttpRequest();
      xhr.open('POST', url);
      xhr.send(null);
    }
  }, {
    key: 'defaultParams',
    value: function defaultParams() {
      // https://developers.google.com/analytics/devguides/collection/protocol/v1/parameters
      return {
        v: 1,
        tid: 'UA-47615700-5'
      };
    }
  }]);

  return GoogleAnalytics;
})();

exports['default'] = GoogleAnalytics;

atom.packages.onDidActivatePackage(function (pkg) {
  if ('metrics' === pkg.name) {
    var buildPackage = atom.packages.getLoadedPackage('build');
    GoogleAnalytics.sendEvent('core', 'activated', buildPackage.metadata.version);
  }
});
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3NndWVudGhlci8uYXRvbS9wYWNrYWdlcy9idWlsZC9saWIvZ29vZ2xlLWFuYWx5dGljcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O3NCQUVjLFFBQVE7Ozs7MkJBQ0UsYUFBYTs7OztBQUhyQyxXQUFXLENBQUM7O0lBS1MsZUFBZTtXQUFmLGVBQWU7MEJBQWYsZUFBZTs7O2VBQWYsZUFBZTs7V0FDckIsZ0JBQUMsRUFBRSxFQUFFOzs7QUFDaEIsVUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFO0FBQ1osZUFBTyxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO09BQ3JCOztBQUVELGFBQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBQyxLQUFLLEVBQUUsVUFBVSxFQUFLO0FBQzlDLGVBQU8sS0FBSyxHQUNWLEVBQUUsQ0FBQyxNQUFLLEdBQUcsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsR0FDeEMsRUFBRSxDQUFDLE1BQUssR0FBRyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztPQUNoRyxDQUFDLENBQUM7S0FDSjs7O1dBRWUsbUJBQUMsUUFBUSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFO0FBQy9DLFVBQU0sTUFBTSxHQUFHO0FBQ2IsU0FBQyxFQUFFLE9BQU87QUFDVixVQUFFLEVBQUUsUUFBUTtBQUNaLFVBQUUsRUFBRSxNQUFNO09BQ1gsQ0FBQztBQUNGLFVBQUksS0FBSyxFQUFFO0FBQ1QsY0FBTSxDQUFDLEVBQUUsR0FBRyxLQUFLLENBQUM7T0FDbkI7QUFDRCxVQUFJLEtBQUssRUFBRTtBQUNULGNBQU0sQ0FBQyxFQUFFLEdBQUcsS0FBSyxDQUFDO09BQ25COztBQUVELFVBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDbkI7OztXQUVVLGNBQUMsTUFBTSxFQUFFOzs7QUFDbEIsVUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLEVBQUU7O0FBRTlDLGVBQU87T0FDUjs7QUFFRCxxQkFBZSxDQUFDLE1BQU0sQ0FBQyxVQUFDLEdBQUcsRUFBSztBQUM5Qiw0QkFBRSxNQUFNLENBQUMsTUFBTSxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFLGVBQWUsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDO0FBQ2hFLGVBQUssT0FBTyxDQUFDLDJDQUEyQyxHQUFHLHlCQUFZLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO09BQzNGLENBQUMsQ0FBQztLQUNKOzs7V0FFYSxpQkFBQyxHQUFHLEVBQUU7QUFDbEIsVUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUU7QUFDckIsZUFBTztPQUNSO0FBQ0QsVUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUNoQjs7O1dBRVUsY0FBQyxHQUFHLEVBQUU7QUFDZixVQUFNLEdBQUcsR0FBRyxJQUFJLGNBQWMsRUFBRSxDQUFDO0FBQ2pDLFNBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQ3RCLFNBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDaEI7OztXQUVtQix5QkFBRzs7QUFFckIsYUFBTztBQUNMLFNBQUMsRUFBRSxDQUFDO0FBQ0osV0FBRyxFQUFFLGVBQWU7T0FDckIsQ0FBQztLQUNIOzs7U0E1RGtCLGVBQWU7OztxQkFBZixlQUFlOztBQStEcEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxvQkFBb0IsQ0FBQyxVQUFDLEdBQUcsRUFBSztBQUMxQyxNQUFJLFNBQVMsS0FBSyxHQUFHLENBQUMsSUFBSSxFQUFFO0FBQzFCLFFBQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDN0QsbUJBQWUsQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLFdBQVcsRUFBRSxZQUFZLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0dBQy9FO0NBQ0YsQ0FBQyxDQUFDIiwiZmlsZSI6Ii9ob21lL3NndWVudGhlci8uYXRvbS9wYWNrYWdlcy9idWlsZC9saWIvZ29vZ2xlLWFuYWx5dGljcy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgXyBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IHF1ZXJ5c3RyaW5nIGZyb20gJ3F1ZXJ5c3RyaW5nJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR29vZ2xlQW5hbHl0aWNzIHtcbiAgc3RhdGljIGdldENpZChjYikge1xuICAgIGlmICh0aGlzLmNpZCkge1xuICAgICAgcmV0dXJuIGNiKHRoaXMuY2lkKTtcbiAgICB9XG5cbiAgICByZXF1aXJlKCdnZXRtYWMnKS5nZXRNYWMoKGVycm9yLCBtYWNBZGRyZXNzKSA9PiB7XG4gICAgICByZXR1cm4gZXJyb3IgP1xuICAgICAgICBjYih0aGlzLmNpZCA9IHJlcXVpcmUoJ25vZGUtdXVpZCcpLnY0KCkpIDpcbiAgICAgICAgY2IodGhpcy5jaWQgPSByZXF1aXJlKCdjcnlwdG8nKS5jcmVhdGVIYXNoKCdzaGExJykudXBkYXRlKG1hY0FkZHJlc3MsICd1dGY4JykuZGlnZXN0KCdoZXgnKSk7XG4gICAgfSk7XG4gIH1cblxuICBzdGF0aWMgc2VuZEV2ZW50KGNhdGVnb3J5LCBhY3Rpb24sIGxhYmVsLCB2YWx1ZSkge1xuICAgIGNvbnN0IHBhcmFtcyA9IHtcbiAgICAgIHQ6ICdldmVudCcsXG4gICAgICBlYzogY2F0ZWdvcnksXG4gICAgICBlYTogYWN0aW9uXG4gICAgfTtcbiAgICBpZiAobGFiZWwpIHtcbiAgICAgIHBhcmFtcy5lbCA9IGxhYmVsO1xuICAgIH1cbiAgICBpZiAodmFsdWUpIHtcbiAgICAgIHBhcmFtcy5ldiA9IHZhbHVlO1xuICAgIH1cblxuICAgIHRoaXMuc2VuZChwYXJhbXMpO1xuICB9XG5cbiAgc3RhdGljIHNlbmQocGFyYW1zKSB7XG4gICAgaWYgKCFhdG9tLnBhY2thZ2VzLmdldEFjdGl2ZVBhY2thZ2UoJ21ldHJpY3MnKSkge1xuICAgICAgLy8gSWYgdGhlIG1ldHJpY3MgcGFja2FnZSBpcyBkaXNhYmxlZCwgdGhlbiB1c2VyIGhhcyBvcHRlZCBvdXQuXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgR29vZ2xlQW5hbHl0aWNzLmdldENpZCgoY2lkKSA9PiB7XG4gICAgICBfLmV4dGVuZChwYXJhbXMsIHsgY2lkOiBjaWQgfSwgR29vZ2xlQW5hbHl0aWNzLmRlZmF1bHRQYXJhbXMoKSk7XG4gICAgICB0aGlzLnJlcXVlc3QoJ2h0dHBzOi8vd3d3Lmdvb2dsZS1hbmFseXRpY3MuY29tL2NvbGxlY3Q/JyArIHF1ZXJ5c3RyaW5nLnN0cmluZ2lmeShwYXJhbXMpKTtcbiAgICB9KTtcbiAgfVxuXG4gIHN0YXRpYyByZXF1ZXN0KHVybCkge1xuICAgIGlmICghbmF2aWdhdG9yLm9uTGluZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLnBvc3QodXJsKTtcbiAgfVxuXG4gIHN0YXRpYyBwb3N0KHVybCkge1xuICAgIGNvbnN0IHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgIHhoci5vcGVuKCdQT1NUJywgdXJsKTtcbiAgICB4aHIuc2VuZChudWxsKTtcbiAgfVxuXG4gIHN0YXRpYyBkZWZhdWx0UGFyYW1zKCkge1xuICAgIC8vIGh0dHBzOi8vZGV2ZWxvcGVycy5nb29nbGUuY29tL2FuYWx5dGljcy9kZXZndWlkZXMvY29sbGVjdGlvbi9wcm90b2NvbC92MS9wYXJhbWV0ZXJzXG4gICAgcmV0dXJuIHtcbiAgICAgIHY6IDEsXG4gICAgICB0aWQ6ICdVQS00NzYxNTcwMC01J1xuICAgIH07XG4gIH1cbn1cblxuYXRvbS5wYWNrYWdlcy5vbkRpZEFjdGl2YXRlUGFja2FnZSgocGtnKSA9PiB7XG4gIGlmICgnbWV0cmljcycgPT09IHBrZy5uYW1lKSB7XG4gICAgY29uc3QgYnVpbGRQYWNrYWdlID0gYXRvbS5wYWNrYWdlcy5nZXRMb2FkZWRQYWNrYWdlKCdidWlsZCcpO1xuICAgIEdvb2dsZUFuYWx5dGljcy5zZW5kRXZlbnQoJ2NvcmUnLCAnYWN0aXZhdGVkJywgYnVpbGRQYWNrYWdlLm1ldGFkYXRhLnZlcnNpb24pO1xuICB9XG59KTtcbiJdfQ==
//# sourceURL=/home/sguenther/.atom/packages/build/lib/google-analytics.js
