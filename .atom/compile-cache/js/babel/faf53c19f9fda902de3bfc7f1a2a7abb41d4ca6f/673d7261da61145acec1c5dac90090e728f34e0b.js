'use babel';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

exports['default'] = function (legacyObject) {
  return (function () {
    function LegacyProvider(path) {
      _classCallCheck(this, LegacyProvider);

      this.path = path;
      this.ctx = {};
    }

    _createClass(LegacyProvider, [{
      key: 'getNiceName',
      value: function getNiceName() {
        return legacyObject.niceName;
      }
    }, {
      key: 'isEligible',
      value: function isEligible() {
        return legacyObject.isEligable.apply(this.ctx, [this.path]);
      }
    }, {
      key: 'settings',
      value: function settings() {
        return legacyObject.settings.apply(this.ctx, [this.path]);
      }
    }, {
      key: 'on',
      value: function on(event, cb) {
        if (!legacyObject.on) return null;
        return legacyObject.on.apply(this.ctx, [event, cb]);
      }
    }, {
      key: 'removeAllListeners',
      value: function removeAllListeners(event) {
        if (!legacyObject.off) return null;
        return legacyObject.off.apply(this.ctx, [event]);
      }
    }]);

    return LegacyProvider;
  })();
};

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3NndWVudGhlci8uYXRvbS9wYWNrYWdlcy9idWlsZC9saWIvcHJvdmlkZXItbGVnYWN5LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFdBQVcsQ0FBQzs7Ozs7Ozs7OztxQkFFRyxVQUFVLFlBQVksRUFBRTtBQUNyQztBQUNhLGFBREEsY0FBYyxDQUNiLElBQUksRUFBRTs0QkFEUCxjQUFjOztBQUV2QixVQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztBQUNqQixVQUFJLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQztLQUNmOztpQkFKVSxjQUFjOzthQU1kLHVCQUFHO0FBQ1osZUFBTyxZQUFZLENBQUMsUUFBUSxDQUFDO09BQzlCOzs7YUFFUyxzQkFBRztBQUNYLGVBQU8sWUFBWSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFFLElBQUksQ0FBQyxJQUFJLENBQUUsQ0FBQyxDQUFDO09BQy9EOzs7YUFFTyxvQkFBRztBQUNULGVBQU8sWUFBWSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFFLElBQUksQ0FBQyxJQUFJLENBQUUsQ0FBQyxDQUFDO09BQzdEOzs7YUFFQyxZQUFDLEtBQUssRUFBRSxFQUFFLEVBQUU7QUFDWixZQUFJLENBQUMsWUFBWSxDQUFDLEVBQUUsRUFBRSxPQUFPLElBQUksQ0FBQztBQUNsQyxlQUFPLFlBQVksQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBRSxLQUFLLEVBQUUsRUFBRSxDQUFFLENBQUMsQ0FBQztPQUN2RDs7O2FBRWlCLDRCQUFDLEtBQUssRUFBRTtBQUN4QixZQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsRUFBRSxPQUFPLElBQUksQ0FBQztBQUNuQyxlQUFPLFlBQVksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBRSxLQUFLLENBQUUsQ0FBQyxDQUFDO09BQ3BEOzs7V0ExQlUsY0FBYztPQTJCekI7Q0FDSCIsImZpbGUiOiIvaG9tZS9zZ3VlbnRoZXIvLmF0b20vcGFja2FnZXMvYnVpbGQvbGliL3Byb3ZpZGVyLWxlZ2FjeS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiAobGVnYWN5T2JqZWN0KSB7XG4gIHJldHVybiBjbGFzcyBMZWdhY3lQcm92aWRlciB7XG4gICAgY29uc3RydWN0b3IocGF0aCkge1xuICAgICAgdGhpcy5wYXRoID0gcGF0aDtcbiAgICAgIHRoaXMuY3R4ID0ge307XG4gICAgfVxuXG4gICAgZ2V0TmljZU5hbWUoKSB7XG4gICAgICByZXR1cm4gbGVnYWN5T2JqZWN0Lm5pY2VOYW1lO1xuICAgIH1cblxuICAgIGlzRWxpZ2libGUoKSB7XG4gICAgICByZXR1cm4gbGVnYWN5T2JqZWN0LmlzRWxpZ2FibGUuYXBwbHkodGhpcy5jdHgsIFsgdGhpcy5wYXRoIF0pO1xuICAgIH1cblxuICAgIHNldHRpbmdzKCkge1xuICAgICAgcmV0dXJuIGxlZ2FjeU9iamVjdC5zZXR0aW5ncy5hcHBseSh0aGlzLmN0eCwgWyB0aGlzLnBhdGggXSk7XG4gICAgfVxuXG4gICAgb24oZXZlbnQsIGNiKSB7XG4gICAgICBpZiAoIWxlZ2FjeU9iamVjdC5vbikgcmV0dXJuIG51bGw7XG4gICAgICByZXR1cm4gbGVnYWN5T2JqZWN0Lm9uLmFwcGx5KHRoaXMuY3R4LCBbIGV2ZW50LCBjYiBdKTtcbiAgICB9XG5cbiAgICByZW1vdmVBbGxMaXN0ZW5lcnMoZXZlbnQpIHtcbiAgICAgIGlmICghbGVnYWN5T2JqZWN0Lm9mZikgcmV0dXJuIG51bGw7XG4gICAgICByZXR1cm4gbGVnYWN5T2JqZWN0Lm9mZi5hcHBseSh0aGlzLmN0eCwgWyBldmVudCBdKTtcbiAgICB9XG4gIH07XG59XG4iXX0=
//# sourceURL=/home/sguenther/.atom/packages/build/lib/provider-legacy.js
