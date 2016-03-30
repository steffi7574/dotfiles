Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

require('./spec-bootstrap');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _fsPlus = require('fs-plus');

var _fsPlus2 = _interopRequireDefault(_fsPlus);

var _temp = require('temp');

var _temp2 = _interopRequireDefault(_temp);

var _wrench = require('wrench');

var _wrench2 = _interopRequireDefault(_wrench);

'use babel';

exports['default'] = {
  cloneFixtures: function cloneFixtures() {
    var tempPath = _fsPlus2['default'].realpathSync(_temp2['default'].mkdirSync('latex'));
    var fixturesPath = atom.project.getPaths()[0];
    _wrench2['default'].copyDirSyncRecursive(fixturesPath, tempPath, { forceDelete: true });
    atom.project.setPaths([tempPath]);
    fixturesPath = tempPath;

    return fixturesPath;
  },

  overridePlatform: function overridePlatform(name) {
    Object.defineProperty(process, 'platform', { __proto__: null, value: name });
  },

  spyOnConfig: function spyOnConfig(key, value) {
    var get = atom.config.get;
    if (!jasmine.isSpy(get)) {
      spyOn(atom.config, 'get').andCallFake(function (requestedKey) {
        var fakeValue = _lodash2['default'].get(atom.config.get.values, requestedKey, null);
        if (fakeValue !== null) {
          return fakeValue;
        }
        return get.call(atom.config, requestedKey);
      });

      atom.config.get.values = {};
    }

    atom.config.get.values[key] = value;
  },

  setTimeoutInterval: function setTimeoutInterval(interval) {
    var env = jasmine.getEnv();
    var originalInterval = env.defaultTimeoutInterval;
    env.defaultTimeoutInterval = interval;

    return originalInterval;
  }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3NndWVudGhlci8uYXRvbS9wYWNrYWdlcy9sYXRleC9zcGVjL3NwZWMtaGVscGVycy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7UUFFTyxrQkFBa0I7O3NCQUVYLFFBQVE7Ozs7c0JBQ1AsU0FBUzs7OztvQkFDUCxNQUFNOzs7O3NCQUNKLFFBQVE7Ozs7QUFQM0IsV0FBVyxDQUFBOztxQkFTSTtBQUNiLGVBQWEsRUFBQyx5QkFBRztBQUNmLFFBQU0sUUFBUSxHQUFHLG9CQUFHLFlBQVksQ0FBQyxrQkFBSyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQTtBQUN6RCxRQUFJLFlBQVksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQzdDLHdCQUFPLG9CQUFvQixDQUFDLFlBQVksRUFBRSxRQUFRLEVBQUUsRUFBQyxXQUFXLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQTtBQUN4RSxRQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUE7QUFDakMsZ0JBQVksR0FBRyxRQUFRLENBQUE7O0FBRXZCLFdBQU8sWUFBWSxDQUFBO0dBQ3BCOztBQUVELGtCQUFnQixFQUFDLDBCQUFDLElBQUksRUFBRTtBQUN0QixVQUFNLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxVQUFVLEVBQUUsRUFBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFBO0dBQzNFOztBQUVELGFBQVcsRUFBQyxxQkFBQyxHQUFHLEVBQUUsS0FBSyxFQUFFO0FBQ3ZCLFFBQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFBO0FBQzNCLFFBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFO0FBQ3ZCLFdBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDLFdBQVcsQ0FBQyxVQUFBLFlBQVksRUFBSTtBQUNwRCxZQUFNLFNBQVMsR0FBRyxvQkFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLFlBQVksRUFBRSxJQUFJLENBQUMsQ0FBQTtBQUNuRSxZQUFJLFNBQVMsS0FBSyxJQUFJLEVBQUU7QUFBRSxpQkFBTyxTQUFTLENBQUE7U0FBRTtBQUM1QyxlQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxZQUFZLENBQUMsQ0FBQTtPQUMzQyxDQUFDLENBQUE7O0FBRUYsVUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQTtLQUM1Qjs7QUFFRCxRQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFBO0dBQ3BDOztBQUVELG9CQUFrQixFQUFDLDRCQUFDLFFBQVEsRUFBRTtBQUM1QixRQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUE7QUFDNUIsUUFBTSxnQkFBZ0IsR0FBRyxHQUFHLENBQUMsc0JBQXNCLENBQUE7QUFDbkQsT0FBRyxDQUFDLHNCQUFzQixHQUFHLFFBQVEsQ0FBQTs7QUFFckMsV0FBTyxnQkFBZ0IsQ0FBQTtHQUN4QjtDQUNGIiwiZmlsZSI6Ii9ob21lL3NndWVudGhlci8uYXRvbS9wYWNrYWdlcy9sYXRleC9zcGVjL3NwZWMtaGVscGVycy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbmltcG9ydCAnLi9zcGVjLWJvb3RzdHJhcCdcblxuaW1wb3J0IF8gZnJvbSAnbG9kYXNoJ1xuaW1wb3J0IGZzIGZyb20gJ2ZzLXBsdXMnXG5pbXBvcnQgdGVtcCBmcm9tICd0ZW1wJ1xuaW1wb3J0IHdyZW5jaCBmcm9tICd3cmVuY2gnXG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgY2xvbmVGaXh0dXJlcyAoKSB7XG4gICAgY29uc3QgdGVtcFBhdGggPSBmcy5yZWFscGF0aFN5bmModGVtcC5ta2RpclN5bmMoJ2xhdGV4JykpXG4gICAgbGV0IGZpeHR1cmVzUGF0aCA9IGF0b20ucHJvamVjdC5nZXRQYXRocygpWzBdXG4gICAgd3JlbmNoLmNvcHlEaXJTeW5jUmVjdXJzaXZlKGZpeHR1cmVzUGF0aCwgdGVtcFBhdGgsIHtmb3JjZURlbGV0ZTogdHJ1ZX0pXG4gICAgYXRvbS5wcm9qZWN0LnNldFBhdGhzKFt0ZW1wUGF0aF0pXG4gICAgZml4dHVyZXNQYXRoID0gdGVtcFBhdGhcblxuICAgIHJldHVybiBmaXh0dXJlc1BhdGhcbiAgfSxcblxuICBvdmVycmlkZVBsYXRmb3JtIChuYW1lKSB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHByb2Nlc3MsICdwbGF0Zm9ybScsIHtfX3Byb3RvX186IG51bGwsIHZhbHVlOiBuYW1lfSlcbiAgfSxcblxuICBzcHlPbkNvbmZpZyAoa2V5LCB2YWx1ZSkge1xuICAgIGNvbnN0IGdldCA9IGF0b20uY29uZmlnLmdldFxuICAgIGlmICghamFzbWluZS5pc1NweShnZXQpKSB7XG4gICAgICBzcHlPbihhdG9tLmNvbmZpZywgJ2dldCcpLmFuZENhbGxGYWtlKHJlcXVlc3RlZEtleSA9PiB7XG4gICAgICAgIGNvbnN0IGZha2VWYWx1ZSA9IF8uZ2V0KGF0b20uY29uZmlnLmdldC52YWx1ZXMsIHJlcXVlc3RlZEtleSwgbnVsbClcbiAgICAgICAgaWYgKGZha2VWYWx1ZSAhPT0gbnVsbCkgeyByZXR1cm4gZmFrZVZhbHVlIH1cbiAgICAgICAgcmV0dXJuIGdldC5jYWxsKGF0b20uY29uZmlnLCByZXF1ZXN0ZWRLZXkpXG4gICAgICB9KVxuXG4gICAgICBhdG9tLmNvbmZpZy5nZXQudmFsdWVzID0ge31cbiAgICB9XG5cbiAgICBhdG9tLmNvbmZpZy5nZXQudmFsdWVzW2tleV0gPSB2YWx1ZVxuICB9LFxuXG4gIHNldFRpbWVvdXRJbnRlcnZhbCAoaW50ZXJ2YWwpIHtcbiAgICBjb25zdCBlbnYgPSBqYXNtaW5lLmdldEVudigpXG4gICAgY29uc3Qgb3JpZ2luYWxJbnRlcnZhbCA9IGVudi5kZWZhdWx0VGltZW91dEludGVydmFsXG4gICAgZW52LmRlZmF1bHRUaW1lb3V0SW50ZXJ2YWwgPSBpbnRlcnZhbFxuXG4gICAgcmV0dXJuIG9yaWdpbmFsSW50ZXJ2YWxcbiAgfVxufVxuIl19
//# sourceURL=/home/sguenther/.atom/packages/latex/spec/spec-helpers.js
