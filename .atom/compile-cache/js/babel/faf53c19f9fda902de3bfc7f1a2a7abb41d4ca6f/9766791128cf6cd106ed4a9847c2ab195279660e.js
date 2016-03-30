Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _mixto = require('mixto');

var _mixto2 = _interopRequireDefault(_mixto);

var _atom = require('atom');

/**
 * Provides methods to manage minimap plugins.
 * Minimap plugins are Atom packages that will augment the minimap.
 * They have a secondary activation cycle going on constrained by the minimap
 * package activation. A minimap plugin life cycle will generally look
 * like this:
 *
 * 1. The plugin module is activated by Atom through the `activate` method
 * 2. The plugin then register itself as a minimap plugin using `registerPlugin`
 * 3. The plugin is activated/deactivated according to the minimap settings.
 * 4. On the plugin module deactivation, the plugin must unregisters itself
 *    from the minimap using the `unregisterPlugin`.
 *
 * @access public
 */
'use babel';

var PluginManagement = (function (_Mixin) {
  _inherits(PluginManagement, _Mixin);

  function PluginManagement() {
    _classCallCheck(this, PluginManagement);

    _get(Object.getPrototypeOf(PluginManagement.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(PluginManagement, [{
    key: 'provideMinimapServiceV1',

    /**
     * Returns the Minimap main module instance.
     *
     * @return {Main} The Minimap main module instance.
     */
    value: function provideMinimapServiceV1() {
      return this;
    }

    /**
     * Initializes the properties for plugins' management.
     *
     * @access private
     */
  }, {
    key: 'initializePlugins',
    value: function initializePlugins() {
      /**
       * The registered Minimap plugins stored using their name as key.
       *
       * @type {Object}
       * @access private
       */
      this.plugins = {};
      /**
       * The plugins' subscriptions stored using the plugin names as keys.
       *
       * @type {Object}
       * @access private
       */
      this.pluginsSubscriptions = {};
    }

    /**
     * Registers a minimap `plugin` with the given `name`.
     *
     * @param {string} name The identifying name of the plugin.
     *                      It will be used as activation settings name
     *                      as well as the key to unregister the module.
     * @param {MinimapPlugin} plugin The plugin to register.
     * @emits {did-add-plugin} with the name and a reference to the added plugin.
     * @emits {did-activate-plugin} if the plugin was activated during
     *                              the registration.
     */
  }, {
    key: 'registerPlugin',
    value: function registerPlugin(name, plugin) {
      this.plugins[name] = plugin;
      this.pluginsSubscriptions[name] = new _atom.CompositeDisposable();

      var event = { name: name, plugin: plugin };
      this.emitter.emit('did-add-plugin', event);

      if (atom.config.get('minimap.displayPluginsControls')) {
        this.registerPluginControls(name, plugin);
      }

      this.updatesPluginActivationState(name);
    }

    /**
     * Unregisters a plugin from the minimap.
     *
     * @param {string} name The identifying name of the plugin to unregister.
     * @emits {did-remove-plugin} with the name and a reference
     *        to the added plugin.
     */
  }, {
    key: 'unregisterPlugin',
    value: function unregisterPlugin(name) {
      var plugin = this.plugins[name];

      if (atom.config.get('minimap.displayPluginsControls')) {
        this.unregisterPluginControls(name);
      }

      delete this.plugins[name];

      var event = { name: name, plugin: plugin };
      this.emitter.emit('did-remove-plugin', event);
    }

    /**
     * Toggles the specified plugin activation state.
     *
     * @param  {string} name     The name of the plugin.
     * @param  {boolean} boolean An optional boolean to set the activation
     *                           state of the plugin. If ommitted the new plugin
     *                           state will be the the inverse of its current
     *                           state.
     * @emits {did-activate-plugin} if the plugin was activated by the call.
     * @emits {did-deactivate-plugin} if the plugin was deactivated by the call.
     */
  }, {
    key: 'togglePluginActivation',
    value: function togglePluginActivation(name, boolean) {
      var settingsKey = 'minimap.plugins.' + name;

      if (boolean !== undefined && boolean !== null) {
        atom.config.set(settingsKey, boolean);
      } else {
        atom.config.set(settingsKey, !atom.config.get(settingsKey));
      }

      this.updatesPluginActivationState(name);
    }

    /**
     * Deactivates all the plugins registered in the minimap package so far.
     *
     * @emits {did-deactivate-plugin} for each plugin deactivated by the call.
     */
  }, {
    key: 'deactivateAllPlugins',
    value: function deactivateAllPlugins() {
      for (var _ref3 of this.eachPlugin()) {
        var _ref2 = _slicedToArray(_ref3, 2);

        var _name = _ref2[0];
        var plugin = _ref2[1];

        plugin.deactivatePlugin();
        this.emitter.emit('did-deactivate-plugin', { name: _name, plugin: plugin });
      }
    }

    /**
     * A generator function to iterate over registered plugins.
     *
     * @return An iterable that yield the name and reference to every plugin
     *         as an array in each iteration.
     */
  }, {
    key: 'eachPlugin',
    value: function* eachPlugin() {
      for (var _name2 in this.plugins) {
        yield [_name2, this.plugins[_name2]];
      }
    }

    /**
     * Updates the plugin activation state according to the current config.
     *
     * @param {string} name The identifying name of the plugin to update.
     * @emits {did-activate-plugin} if the plugin was activated by the call.
     * @emits {did-deactivate-plugin} if the plugin was deactivated by the call.
     * @access private
     */
  }, {
    key: 'updatesPluginActivationState',
    value: function updatesPluginActivationState(name) {
      var plugin = this.plugins[name];
      var pluginActive = plugin.isActive();
      var settingActive = atom.config.get('minimap.plugins.' + name);
      var event = { name: name, plugin: plugin };

      if (settingActive && !pluginActive) {
        plugin.activatePlugin();
        this.emitter.emit('did-activate-plugin', event);
      } else if (pluginActive && !settingActive) {
        plugin.deactivatePlugin();
        this.emitter.emit('did-deactivate-plugin', event);
      }
    }

    /**
     * When the `minimap.displayPluginsControls` setting is toggled,
     * this function will register the commands and setting to manage the plugin
     * activation from the minimap settings.
     *
     * @param {string} name The identifying name of the plugin.
     * @param {MinimapPlugin} plugin The plugin instance to register
     *        controls for.
     * @listens {minimap.plugins.${name}} listen to the setting to update
     *          the plugin state accordingly.
     * @listens {minimap:toggle-${name}} listen to the command on `atom-workspace`
     *          to toggle the plugin state.
     * @access private
     */
  }, {
    key: 'registerPluginControls',
    value: function registerPluginControls(name, plugin) {
      var _this = this;

      var settingsKey = 'minimap.plugins.' + name;

      this.config.plugins.properties[name] = {
        type: 'boolean',
        'default': true
      };

      if (atom.config.get(settingsKey) === undefined) {
        atom.config.set(settingsKey, true);
      }

      this.pluginsSubscriptions[name].add(atom.config.observe(settingsKey, function () {
        _this.updatesPluginActivationState(name);
      }));

      this.pluginsSubscriptions[name].add(atom.commands.add('atom-workspace', _defineProperty({}, 'minimap:toggle-' + name, function () {
        _this.togglePluginActivation(name);
      })));
    }

    /**
     * When the `minimap.displayPluginsControls` setting is toggled,
     * this function will unregister the commands and setting that
     * was created previously.
     *
     * @param {string} name The identifying name of the plugin.
     * @access private
     */
  }, {
    key: 'unregisterPluginControls',
    value: function unregisterPluginControls(name) {
      this.pluginsSubscriptions[name].dispose();
      delete this.pluginsSubscriptions[name];
      delete this.config.plugins.properties[name];
    }
  }]);

  return PluginManagement;
})(_mixto2['default']);

exports['default'] = PluginManagement;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3NndWVudGhlci8uYXRvbS9wYWNrYWdlcy9taW5pbWFwL2xpYi9taXhpbnMvcGx1Z2luLW1hbmFnZW1lbnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O3FCQUVrQixPQUFPOzs7O29CQUNXLE1BQU07Ozs7Ozs7Ozs7Ozs7Ozs7O0FBSDFDLFdBQVcsQ0FBQTs7SUFvQlUsZ0JBQWdCO1lBQWhCLGdCQUFnQjs7V0FBaEIsZ0JBQWdCOzBCQUFoQixnQkFBZ0I7OytCQUFoQixnQkFBZ0I7OztlQUFoQixnQkFBZ0I7Ozs7Ozs7O1dBTVgsbUNBQUc7QUFBRSxhQUFPLElBQUksQ0FBQTtLQUFFOzs7Ozs7Ozs7V0FPeEIsNkJBQUc7Ozs7Ozs7QUFPbkIsVUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUE7Ozs7Ozs7QUFPakIsVUFBSSxDQUFDLG9CQUFvQixHQUFHLEVBQUUsQ0FBQTtLQUMvQjs7Ozs7Ozs7Ozs7Ozs7O1dBYWMsd0JBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRTtBQUM1QixVQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLE1BQU0sQ0FBQTtBQUMzQixVQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLEdBQUcsK0JBQXlCLENBQUE7O0FBRTNELFVBQUksS0FBSyxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLENBQUE7QUFDMUMsVUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsS0FBSyxDQUFDLENBQUE7O0FBRTFDLFVBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsZ0NBQWdDLENBQUMsRUFBRTtBQUNyRCxZQUFJLENBQUMsc0JBQXNCLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFBO09BQzFDOztBQUVELFVBQUksQ0FBQyw0QkFBNEIsQ0FBQyxJQUFJLENBQUMsQ0FBQTtLQUN4Qzs7Ozs7Ozs7Ozs7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SSxDQUFDLEdBQUc7QUFDckMsWUFBSSxFQUFFLFNBQVM7QUFDZixtQkFBUyxJQUFJO09BQ2QsQ0FBQTs7QUFFRCxVQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxLQUFLLFNBQVMsRUFBRTtBQUM5QyxZQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUE7T0FDbkM7O0FBRUQsVUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsWUFBTTtBQUN6RSxjQUFLLDRCQUE0QixDQUFDLElBQUksQ0FBQyxDQUFBO09BQ3hDLENBQUMsQ0FBQyxDQUFBOztBQUVILFVBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLDBDQUNqRCxJQUFJLEVBQUssWUFBTTtBQUNoQyxjQUFLLHNCQUFzQixDQUFDLElBQUksQ0FBQyxDQUFBO09BQ2xDLEVBQ0QsQ0FBQyxDQUFBO0tBQ0o7Ozs7Ozs7Ozs7OztXQVV3QixrQ0FBQyxJQUFJLEVBQUU7QUFDOUIsVUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFBO0FBQ3pDLGFBQU8sSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxDQUFBO0FBQ3RDLGFBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFBO0tBQzVDOzs7U0FsTWtCLGdCQUFnQjs7O3FCQUFoQixnQkFBZ0IiLCJmaWxlIjoiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL21pbmltYXAvbGliL21peGlucy9wbHVnaW4tbWFuYWdlbWVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbmltcG9ydCBNaXhpbiBmcm9tICdtaXh0bydcbmltcG9ydCB7IENvbXBvc2l0ZURpc3Bvc2FibGUgfSBmcm9tICdhdG9tJ1xuXG4vKipcbiAqIFByb3ZpZGVzIG1ldGhvZHMgdG8gbWFuYWdlIG1pbmltYXAgcGx1Z2lucy5cbiAqIE1pbmltYXAgcGx1Z2lucyBhcmUgQXRvbSBwYWNrYWdlcyB0aGF0IHdpbGwgYXVnbWVudCB0aGUgbWluaW1hcC5cbiAqIFRoZXkgaGF2ZSBhIHNlY29uZGFyeSBhY3RpdmF0aW9uIGN5Y2xlIGdvaW5nIG9uIGNvbnN0cmFpbmVkIGJ5IHRoZSBtaW5pbWFwXG4gKiBwYWNrYWdlIGFjdGl2YXRpb24uIEEgbWluaW1hcCBwbHVnaW4gbGlmZSBjeWNsZSB3aWxsIGdlbmVyYWxseSBsb29rXG4gKiBsaWtlIHRoaXM6XG4gKlxuICogMS4gVGhlIHBsdWdpbiBtb2R1bGUgaXMgYWN0aXZhdGVkIGJ5IEF0b20gdGhyb3VnaCB0aGUgYGFjdGl2YXRlYCBtZXRob2RcbiAqIDIuIFRoZSBwbHVnaW4gdGhlbiByZWdpc3RlciBpdHNlbGYgYXMgYSBtaW5pbWFwIHBsdWdpbiB1c2luZyBgcmVnaXN0ZXJQbHVnaW5gXG4gKiAzLiBUaGUgcGx1Z2luIGlzIGFjdGl2YXRlZC9kZWFjdGl2YXRlZCBhY2NvcmRpbmcgdG8gdGhlIG1pbmltYXAgc2V0dGluZ3MuXG4gKiA0LiBPbiB0aGUgcGx1Z2luIG1vZHVsZSBkZWFjdGl2YXRpb24sIHRoZSBwbHVnaW4gbXVzdCB1bnJlZ2lzdGVycyBpdHNlbGZcbiAqICAgIGZyb20gdGhlIG1pbmltYXAgdXNpbmcgdGhlIGB1bnJlZ2lzdGVyUGx1Z2luYC5cbiAqXG4gKiBAYWNjZXNzIHB1YmxpY1xuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQbHVnaW5NYW5hZ2VtZW50IGV4dGVuZHMgTWl4aW4ge1xuICAvKipcbiAgICogUmV0dXJucyB0aGUgTWluaW1hcCBtYWluIG1vZHVsZSBpbnN0YW5jZS5cbiAgICpcbiAgICogQHJldHVybiB7TWFpbn0gVGhlIE1pbmltYXAgbWFpbiBtb2R1bGUgaW5zdGFuY2UuXG4gICAqL1xuICBwcm92aWRlTWluaW1hcFNlcnZpY2VWMSAoKSB7IHJldHVybiB0aGlzIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgdGhlIHByb3BlcnRpZXMgZm9yIHBsdWdpbnMnIG1hbmFnZW1lbnQuXG4gICAqXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgaW5pdGlhbGl6ZVBsdWdpbnMgKCkge1xuICAgIC8qKlxuICAgICAqIFRoZSByZWdpc3RlcmVkIE1pbmltYXAgcGx1Z2lucyBzdG9yZWQgdXNpbmcgdGhlaXIgbmFtZSBhcyBrZXkuXG4gICAgICpcbiAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMucGx1Z2lucyA9IHt9XG4gICAgLyoqXG4gICAgICogVGhlIHBsdWdpbnMnIHN1YnNjcmlwdGlvbnMgc3RvcmVkIHVzaW5nIHRoZSBwbHVnaW4gbmFtZXMgYXMga2V5cy5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5wbHVnaW5zU3Vic2NyaXB0aW9ucyA9IHt9XG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXJzIGEgbWluaW1hcCBgcGx1Z2luYCB3aXRoIHRoZSBnaXZlbiBgbmFtZWAuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIFRoZSBpZGVudGlmeWluZyBuYW1lIG9mIHRoZSBwbHVnaW4uXG4gICAqICAgICAgICAgICAgICAgICAgICAgIEl0IHdpbGwgYmUgdXNlZCBhcyBhY3RpdmF0aW9uIHNldHRpbmdzIG5hbWVcbiAgICogICAgICAgICAgICAgICAgICAgICAgYXMgd2VsbCBhcyB0aGUga2V5IHRvIHVucmVnaXN0ZXIgdGhlIG1vZHVsZS5cbiAgICogQHBhcmFtIHtNaW5pbWFwUGx1Z2lufSBwbHVnaW4gVGhlIHBsdWdpbiB0byByZWdpc3Rlci5cbiAgICogQGVtaXRzIHtkaWQtYWRkLXBsdWdpbn0gd2l0aCB0aGUgbmFtZSBhbmQgYSByZWZlcmVuY2UgdG8gdGhlIGFkZGVkIHBsdWdpbi5cbiAgICogQGVtaXRzIHtkaWQtYWN0aXZhdGUtcGx1Z2lufSBpZiB0aGUgcGx1Z2luIHdhcyBhY3RpdmF0ZWQgZHVyaW5nXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhlIHJlZ2lzdHJhdGlvbi5cbiAgICovXG4gIHJlZ2lzdGVyUGx1Z2luIChuYW1lLCBwbHVnaW4pIHtcbiAgICB0aGlzLnBsdWdpbnNbbmFtZV0gPSBwbHVnaW5cbiAgICB0aGlzLnBsdWdpbnNTdWJzY3JpcHRpb25zW25hbWVdID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuXG4gICAgbGV0IGV2ZW50ID0geyBuYW1lOiBuYW1lLCBwbHVnaW46IHBsdWdpbiB9XG4gICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1hZGQtcGx1Z2luJywgZXZlbnQpXG5cbiAgICBpZiAoYXRvbS5jb25maWcuZ2V0KCdtaW5pbWFwLmRpc3BsYXlQbHVnaW5zQ29udHJvbHMnKSkge1xuICAgICAgdGhpcy5yZWdpc3RlclBsdWdpbkNvbnRyb2xzKG5hbWUsIHBsdWdpbilcbiAgICB9XG5cbiAgICB0aGlzLnVwZGF0ZXNQbHVnaW5BY3RpdmF0aW9uU3RhdGUobmFtZSlcbiAgfVxuXG4gIC8qKlxuICAgKiBVbnJlZ2lzdGVycyBhIHBsdWdpbiBmcm9tIHRoZSBtaW5pbWFwLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBUaGUgaWRlbnRpZnlpbmcgbmFtZSBvZiB0aGUgcGx1Z2luIHRvIHVucmVnaXN0ZXIuXG4gICAqIEBlbWl0cyB7ZGlkLXJlbW92ZS1wbHVnaW59IHdpdGggdGhlIG5hbWUgYW5kIGEgcmVmZXJlbmNlXG4gICAqICAgICAgICB0byB0aGUgYWRkZWQgcGx1Z2luLlxuICAgKi9cbiAgdW5yZWdpc3RlclBsdWdpbiAobmFtZSkge1xuICAgIGxldCBwbHVnaW4gPSB0aGlzLnBsdWdpbnNbbmFtZV1cblxuICAgIGlmIChhdG9tLmNvbmZpZy5nZXQoJ21pbmltYXAuZGlzcGxheVBsdWdpbnNDb250cm9scycpKSB7XG4gICAgICB0aGlzLnVucmVnaXN0ZXJQbHVnaW5Db250cm9scyhuYW1lKVxuICAgIH1cblxuICAgIGRlbGV0ZSB0aGlzLnBsdWdpbnNbbmFtZV1cblxuICAgIGxldCBldmVudCA9IHsgbmFtZTogbmFtZSwgcGx1Z2luOiBwbHVnaW4gfVxuICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtcmVtb3ZlLXBsdWdpbicsIGV2ZW50KVxuICB9XG5cbiAgLyoqXG4gICAqIFRvZ2dsZXMgdGhlIHNwZWNpZmllZCBwbHVnaW4gYWN0aXZhdGlvbiBzdGF0ZS5cbiAgICpcbiAgICogQHBhcmFtICB7c3RyaW5nfSBuYW1lICAgICBUaGUgbmFtZSBvZiB0aGUgcGx1Z2luLlxuICAgKiBAcGFyYW0gIHtib29sZWFufSBib29sZWFuIEFuIG9wdGlvbmFsIGJvb2xlYW4gdG8gc2V0IHRoZSBhY3RpdmF0aW9uXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUgb2YgdGhlIHBsdWdpbi4gSWYgb21taXR0ZWQgdGhlIG5ldyBwbHVnaW5cbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZSB3aWxsIGJlIHRoZSB0aGUgaW52ZXJzZSBvZiBpdHMgY3VycmVudFxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlLlxuICAgKiBAZW1pdHMge2RpZC1hY3RpdmF0ZS1wbHVnaW59IGlmIHRoZSBwbHVnaW4gd2FzIGFjdGl2YXRlZCBieSB0aGUgY2FsbC5cbiAgICogQGVtaXRzIHtkaWQtZGVhY3RpdmF0ZS1wbHVnaW59IGlmIHRoZSBwbHVnaW4gd2FzIGRlYWN0aXZhdGVkIGJ5IHRoZSBjYWxsLlxuICAgKi9cbiAgdG9nZ2xlUGx1Z2luQWN0aXZhdGlvbiAobmFtZSwgYm9vbGVhbikge1xuICAgIGxldCBzZXR0aW5nc0tleSA9IGBtaW5pbWFwLnBsdWdpbnMuJHtuYW1lfWBcblxuICAgIGlmIChib29sZWFuICE9PSB1bmRlZmluZWQgJiYgYm9vbGVhbiAhPT0gbnVsbCkge1xuICAgICAgYXRvbS5jb25maWcuc2V0KHNldHRpbmdzS2V5LCBib29sZWFuKVxuICAgIH0gZWxzZSB7XG4gICAgICBhdG9tLmNvbmZpZy5zZXQoc2V0dGluZ3NLZXksICFhdG9tLmNvbmZpZy5nZXQoc2V0dGluZ3NLZXkpKVxuICAgIH1cblxuICAgIHRoaXMudXBkYXRlc1BsdWdpbkFjdGl2YXRpb25TdGF0ZShuYW1lKVxuICB9XG5cbiAgLyoqXG4gICAqIERlYWN0aXZhdGVzIGFsbCB0aGUgcGx1Z2lucyByZWdpc3RlcmVkIGluIHRoZSBtaW5pbWFwIHBhY2thZ2Ugc28gZmFyLlxuICAgKlxuICAgKiBAZW1pdHMge2RpZC1kZWFjdGl2YXRlLXBsdWdpbn0gZm9yIGVhY2ggcGx1Z2luIGRlYWN0aXZhdGVkIGJ5IHRoZSBjYWxsLlxuICAgKi9cbiAgZGVhY3RpdmF0ZUFsbFBsdWdpbnMgKCkge1xuICAgIGZvciAobGV0IFtuYW1lLCBwbHVnaW5dIG9mIHRoaXMuZWFjaFBsdWdpbigpKSB7XG4gICAgICBwbHVnaW4uZGVhY3RpdmF0ZVBsdWdpbigpXG4gICAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLWRlYWN0aXZhdGUtcGx1Z2luJywgeyBuYW1lOiBuYW1lLCBwbHVnaW46IHBsdWdpbiB9KVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBIGdlbmVyYXRvciBmdW5jdGlvbiB0byBpdGVyYXRlIG92ZXIgcmVnaXN0ZXJlZCBwbHVnaW5zLlxuICAgKlxuICAgKiBAcmV0dXJuIEFuIGl0ZXJhYmxlIHRoYXQgeWllbGQgdGhlIG5hbWUgYW5kIHJlZmVyZW5jZSB0byBldmVyeSBwbHVnaW5cbiAgICogICAgICAgICBhcyBhbiBhcnJheSBpbiBlYWNoIGl0ZXJhdGlvbi5cbiAgICovXG4gICogZWFjaFBsdWdpbiAoKSB7XG4gICAgZm9yIChsZXQgbmFtZSBpbiB0aGlzLnBsdWdpbnMpIHtcbiAgICAgIHlpZWxkIFtuYW1lLCB0aGlzLnBsdWdpbnNbbmFtZV1dXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZXMgdGhlIHBsdWdpbiBhY3RpdmF0aW9uIHN0YXRlIGFjY29yZGluZyB0byB0aGUgY3VycmVudCBjb25maWcuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIFRoZSBpZGVudGlmeWluZyBuYW1lIG9mIHRoZSBwbHVnaW4gdG8gdXBkYXRlLlxuICAgKiBAZW1pdHMge2RpZC1hY3RpdmF0ZS1wbHVnaW59IGlmIHRoZSBwbHVnaW4gd2FzIGFjdGl2YXRlZCBieSB0aGUgY2FsbC5cbiAgICogQGVtaXRzIHtkaWQtZGVhY3RpdmF0ZS1wbHVnaW59IGlmIHRoZSBwbHVnaW4gd2FzIGRlYWN0aXZhdGVkIGJ5IHRoZSBjYWxsLlxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIHVwZGF0ZXNQbHVnaW5BY3RpdmF0aW9uU3RhdGUgKG5hbWUpIHtcbiAgICBsZXQgcGx1Z2luID0gdGhpcy5wbHVnaW5zW25hbWVdXG4gICAgbGV0IHBsdWdpbkFjdGl2ZSA9IHBsdWdpbi5pc0FjdGl2ZSgpXG4gICAgbGV0IHNldHRpbmdBY3RpdmUgPSBhdG9tLmNvbmZpZy5nZXQoYG1pbmltYXAucGx1Z2lucy4ke25hbWV9YClcbiAgICBsZXQgZXZlbnQgPSB7IG5hbWU6IG5hbWUsIHBsdWdpbjogcGx1Z2luIH1cblxuICAgIGlmIChzZXR0aW5nQWN0aXZlICYmICFwbHVnaW5BY3RpdmUpIHtcbiAgICAgIHBsdWdpbi5hY3RpdmF0ZVBsdWdpbigpXG4gICAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLWFjdGl2YXRlLXBsdWdpbicsIGV2ZW50KVxuICAgIH0gZWxzZSBpZiAocGx1Z2luQWN0aXZlICYmICFzZXR0aW5nQWN0aXZlKSB7XG4gICAgICBwbHVnaW4uZGVhY3RpdmF0ZVBsdWdpbigpXG4gICAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLWRlYWN0aXZhdGUtcGx1Z2luJywgZXZlbnQpXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFdoZW4gdGhlIGBtaW5pbWFwLmRpc3BsYXlQbHVnaW5zQ29udHJvbHNgIHNldHRpbmcgaXMgdG9nZ2xlZCxcbiAgICogdGhpcyBmdW5jdGlvbiB3aWxsIHJlZ2lzdGVyIHRoZSBjb21tYW5kcyBhbmQgc2V0dGluZyB0byBtYW5hZ2UgdGhlIHBsdWdpblxuICAgKiBhY3RpdmF0aW9uIGZyb20gdGhlIG1pbmltYXAgc2V0dGluZ3MuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIFRoZSBpZGVudGlmeWluZyBuYW1lIG9mIHRoZSBwbHVnaW4uXG4gICAqIEBwYXJhbSB7TWluaW1hcFBsdWdpbn0gcGx1Z2luIFRoZSBwbHVnaW4gaW5zdGFuY2UgdG8gcmVnaXN0ZXJcbiAgICogICAgICAgIGNvbnRyb2xzIGZvci5cbiAgICogQGxpc3RlbnMge21pbmltYXAucGx1Z2lucy4ke25hbWV9fSBsaXN0ZW4gdG8gdGhlIHNldHRpbmcgdG8gdXBkYXRlXG4gICAqICAgICAgICAgIHRoZSBwbHVnaW4gc3RhdGUgYWNjb3JkaW5nbHkuXG4gICAqIEBsaXN0ZW5zIHttaW5pbWFwOnRvZ2dsZS0ke25hbWV9fSBsaXN0ZW4gdG8gdGhlIGNvbW1hbmQgb24gYGF0b20td29ya3NwYWNlYFxuICAgKiAgICAgICAgICB0byB0b2dnbGUgdGhlIHBsdWdpbiBzdGF0ZS5cbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICByZWdpc3RlclBsdWdpbkNvbnRyb2xzIChuYW1lLCBwbHVnaW4pIHtcbiAgICBsZXQgc2V0dGluZ3NLZXkgPSBgbWluaW1hcC5wbHVnaW5zLiR7bmFtZX1gXG5cbiAgICB0aGlzLmNvbmZpZy5wbHVnaW5zLnByb3BlcnRpZXNbbmFtZV0gPSB7XG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgfVxuXG4gICAgaWYgKGF0b20uY29uZmlnLmdldChzZXR0aW5nc0tleSkgPT09IHVuZGVmaW5lZCkge1xuICAgICAgYXRvbS5jb25maWcuc2V0KHNldHRpbmdzS2V5LCB0cnVlKVxuICAgIH1cblxuICAgIHRoaXMucGx1Z2luc1N1YnNjcmlwdGlvbnNbbmFtZV0uYWRkKGF0b20uY29uZmlnLm9ic2VydmUoc2V0dGluZ3NLZXksICgpID0+IHtcbiAgICAgIHRoaXMudXBkYXRlc1BsdWdpbkFjdGl2YXRpb25TdGF0ZShuYW1lKVxuICAgIH0pKVxuXG4gICAgdGhpcy5wbHVnaW5zU3Vic2NyaXB0aW9uc1tuYW1lXS5hZGQoYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywge1xuICAgICAgW2BtaW5pbWFwOnRvZ2dsZS0ke25hbWV9YF06ICgpID0+IHtcbiAgICAgICAgdGhpcy50b2dnbGVQbHVnaW5BY3RpdmF0aW9uKG5hbWUpXG4gICAgICB9XG4gICAgfSkpXG4gIH1cblxuICAvKipcbiAgICogV2hlbiB0aGUgYG1pbmltYXAuZGlzcGxheVBsdWdpbnNDb250cm9sc2Agc2V0dGluZyBpcyB0b2dnbGVkLFxuICAgKiB0aGlzIGZ1bmN0aW9uIHdpbGwgdW5yZWdpc3RlciB0aGUgY29tbWFuZHMgYW5kIHNldHRpbmcgdGhhdFxuICAgKiB3YXMgY3JlYXRlZCBwcmV2aW91c2x5LlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBUaGUgaWRlbnRpZnlpbmcgbmFtZSBvZiB0aGUgcGx1Z2luLlxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIHVucmVnaXN0ZXJQbHVnaW5Db250cm9scyAobmFtZSkge1xuICAgIHRoaXMucGx1Z2luc1N1YnNjcmlwdGlvbnNbbmFtZV0uZGlzcG9zZSgpXG4gICAgZGVsZXRlIHRoaXMucGx1Z2luc1N1YnNjcmlwdGlvbnNbbmFtZV1cbiAgICBkZWxldGUgdGhpcy5jb25maWcucGx1Z2lucy5wcm9wZXJ0aWVzW25hbWVdXG4gIH1cbn1cbiJdfQ==
//# sourceURL=/home/sguenther/.atom/packages/minimap/lib/mixins/plugin-management.js
