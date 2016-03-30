Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
  The following hack clears the require cache of all the paths to the minimap when this file is laoded. It should prevents errors of partial reloading after an update.
 */

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _atom = require('atom');

var _decoratorsInclude = require('./decorators/include');

var _decoratorsInclude2 = _interopRequireDefault(_decoratorsInclude);

var _mixinsPluginManagement = require('./mixins/plugin-management');

var _mixinsPluginManagement2 = _interopRequireDefault(_mixinsPluginManagement);

'use babel';
if (!atom.inSpecMode()) {
  Object.keys(require.cache).filter(function (p) {
    return p !== __filename && p.indexOf(_path2['default'].resolve(__dirname, '..') + _path2['default'].sep) > -1;
  }).forEach(function (p) {
    delete require.cache[p];
  });
}

var Minimap = undefined,
    MinimapElement = undefined,
    MinimapPluginGeneratorElement = undefined;

/**
 * The `Minimap` package provides an eagle-eye view of text buffers.
 *
 * It also provides API for plugin packages that want to interact with the
 * minimap and be available to the user through the minimap settings.
 */

var Main = (function () {
  /**
   * Used only at export time.
   *
   * @access private
   */

  function Main() {
    _classCallCheck(this, _Main);

    /**
     * The activation state of the package.
     *
     * @type {boolean}
     * @access private
     */
    this.active = false;
    /**
     * The toggle state of the package.
     *
     * @type {boolean}
     * @access private
     */
    this.toggled = false;
    /**
     * The `Map` where Minimap instances are stored with the text editor they
     * target as key.
     *
     * @type {Map}
     * @access private
     */
    this.editorsMinimaps = null;
    /**
     * The composite disposable that stores the package's subscriptions.
     *
     * @type {CompositeDisposable}
     * @access private
     */
    this.subscriptions = null;
    /**
     * The disposable that stores the package's commands subscription.
     *
     * @type {Disposable}
     * @access private
     */
    this.subscriptionsOfCommands = null;
    /**
     * The package's config object.
     *
     * @type {Object}
     * @access private
     */
    this.config = require('./config-schema.json');
    /**
     * The package's events emitter.
     *
     * @type {Emitter}
     * @access private
     */
    this.emitter = new _atom.Emitter();

    this.initializePlugins();
  }

  /**
   * The exposed instance of the `Main` class.
   *
   * @access private
   */

  /**
   * Activates the minimap package.
   */

  _createClass(Main, [{
    key: 'activate',
    value: function activate() {
      var _this = this;

      if (this.active) {
        return;
      }

      if (!Minimap) {
        Minimap = require('./minimap');
      }
      if (!MinimapElement) {
        MinimapElement = require('./minimap-element');
      }

      MinimapElement.registerViewProvider(Minimap);

      this.subscriptionsOfCommands = atom.commands.add('atom-workspace', {
        'minimap:toggle': function minimapToggle() {
          _this.toggle();
        },
        'minimap:generate-coffee-plugin': function minimapGenerateCoffeePlugin() {
          _this.generatePlugin('coffee');
        },
        'minimap:generate-javascript-plugin': function minimapGenerateJavascriptPlugin() {
          _this.generatePlugin('javascript');
        },
        'minimap:generate-babel-plugin': function minimapGenerateBabelPlugin() {
          _this.generatePlugin('babel');
        }
      });

      this.editorsMinimaps = new Map();
      this.subscriptions = new _atom.CompositeDisposable();
      this.active = true;

      if (atom.config.get('minimap.autoToggle')) {
        this.toggle();
      }
    }

    /**
     * Deactivates the minimap package.
     */
  }, {
    key: 'deactivate',
    value: function deactivate() {
      var _this2 = this;

      if (!this.active) {
        return;
      }

      this.deactivateAllPlugins();

      if (this.editorsMinimaps) {
        this.editorsMinimaps.forEach(function (value, key) {
          value.destroy();
          _this2.editorsMinimaps['delete'](key);
        });
      }

      this.subscriptions.dispose();
      this.subscriptions = null;
      this.subscriptionsOfCommands.dispose();
      this.subscriptionsOfCommands = null;
      this.editorsMinimaps = undefined;
      this.toggled = false;
      this.active = false;
    }

    /**
     * Toggles the minimap display.
     */
  }, {
    key: 'toggle',
    value: function toggle() {
      var _this3 = this;

      if (!this.active) {
        return;
      }

      if (this.toggled) {
        this.toggled = false;

        if (this.editorsMinimaps) {
          this.editorsMinimaps.forEach(function (value, key) {
            value.destroy();
            _this3.editorsMinimaps['delete'](key);
          });
        }
        this.subscriptions.dispose();
      } else {
        this.toggled = true;
        this.initSubscriptions();
      }
    }

    /**
     * Opens the plugin generation view.
     *
     * @param  {string} template the name of the template to use
     */
  }, {
    key: 'generatePlugin',
    value: function generatePlugin(template) {
      if (!MinimapPluginGeneratorElement) {
        MinimapPluginGeneratorElement = require('./minimap-plugin-generator-element');
      }
      var view = new MinimapPluginGeneratorElement();
      view.template = template;
      view.attach();
    }

    /**
     * Registers a callback to listen to the `did-activate` event of the package.
     *
     * @param  {function(event:Object):void} callback the callback function
     * @return {Disposable} a disposable to stop listening to the event
     */
  }, {
    key: 'onDidActivate',
    value: function onDidActivate(callback) {
      return this.emitter.on('did-activate', callback);
    }

    /**
     * Registers a callback to listen to the `did-deactivate` event of the
     * package.
     *
     * @param  {function(event:Object):void} callback the callback function
     * @return {Disposable} a disposable to stop listening to the event
     */
  }, {
    key: 'onDidDeactivate',
    value: function onDidDeactivate(callback) {
      return this.emitter.on('did-deactivate', callback);
    }

    /**
     * Registers a callback to listen to the `did-create-minimap` event of the
     * package.
     *
     * @param  {function(event:Object):void} callback the callback function
     * @return {Disposable} a disposable to stop listening to the event
     */
  }, {
    key: 'onDidCreateMinimap',
    value: function onDidCreateMinimap(callback) {
      return this.emitter.on('did-create-minimap', callback);
    }

    /**
     * Registers a callback to listen to the `did-add-plugin` event of the
     * package.
     *
     * @param  {function(event:Object):void} callback the callback function
     * @return {Disposable} a disposable to stop listening to the event
     */
  }, {
    key: 'onDidAddPlugin',
    value: function onDidAddPlugin(callback) {
      return this.emitter.on('did-add-plugin', callback);
    }

    /**
     * Registers a callback to listen to the `did-remove-plugin` event of the
     * package.
     *
     * @param  {function(event:Object):void} callback the callback function
     * @return {Disposable} a disposable to stop listening to the event
     */
  }, {
    key: 'onDidRemovePlugin',
    value: function onDidRemovePlugin(callback) {
      return this.emitter.on('did-remove-plugin', callback);
    }

    /**
     * Registers a callback to listen to the `did-activate-plugin` event of the
     * package.
     *
     * @param  {function(event:Object):void} callback the callback function
     * @return {Disposable} a disposable to stop listening to the event
     */
  }, {
    key: 'onDidActivatePlugin',
    value: function onDidActivatePlugin(callback) {
      return this.emitter.on('did-activate-plugin', callback);
    }

    /**
     * Registers a callback to listen to the `did-deactivate-plugin` event of the
     * package.
     *
     * @param  {function(event:Object):void} callback the callback function
     * @return {Disposable} a disposable to stop listening to the event
     */
  }, {
    key: 'onDidDeactivatePlugin',
    value: function onDidDeactivatePlugin(callback) {
      return this.emitter.on('did-deactivate-plugin', callback);
    }

    /**
     * Returns the `Minimap` class
     *
     * @return {Function} the `Minimap` class constructor
     */
  }, {
    key: 'minimapClass',
    value: function minimapClass() {
      return Minimap;
    }

    /**
     * Returns the `Minimap` object associated to the passed-in
     * `TextEditorElement`.
     *
     * @param  {TextEditorElement} editorElement a text editor element
     * @return {Minimap} the associated minimap
     */
  }, {
    key: 'minimapForEditorElement',
    value: function minimapForEditorElement(editorElement) {
      if (!editorElement) {
        return;
      }
      return this.minimapForEditor(editorElement.getModel());
    }

    /**
     * Returns the `Minimap` object associated to the passed-in
     * `TextEditor`.
     *
     * @param  {TextEditor} textEditor a text editor
     * @return {Minimap} the associated minimap
     */
  }, {
    key: 'minimapForEditor',
    value: function minimapForEditor(textEditor) {
      var _this4 = this;

      if (!textEditor) {
        return;
      }

      var minimap = this.editorsMinimaps.get(textEditor);

      if (!minimap) {
        minimap = new Minimap({ textEditor: textEditor });
        this.editorsMinimaps.set(textEditor, minimap);

        var editorSubscription = textEditor.onDidDestroy(function () {
          var minimaps = _this4.editorsMinimaps;
          if (minimaps) {
            minimaps['delete'](textEditor);
          }
          editorSubscription.dispose();
        });
      }

      return minimap;
    }

    /**
     * Returns a new stand-alone {Minimap} for the passed-in `TextEditor`.
     *
     * @param  {TextEditor} textEditor a text editor instance to create
     *                                 a minimap for
     * @return {Minimap} a new stand-alone Minimap for the passed-in editor
     */
  }, {
    key: 'standAloneMinimapForEditor',
    value: function standAloneMinimapForEditor(textEditor) {
      if (!textEditor) {
        return;
      }

      return new Minimap({
        textEditor: textEditor,
        standAlone: true
      });
    }

    /**
     * Returns the `Minimap` associated to the active `TextEditor`.
     *
     * @return {Minimap} the active Minimap
     */
  }, {
    key: 'getActiveMinimap',
    value: function getActiveMinimap() {
      return this.minimapForEditor(atom.workspace.getActiveTextEditor());
    }

    /**
     * Calls a function for each present and future minimaps.
     *
     * @param  {function(minimap:Minimap):void} iterator a function to call with
     *                                                   the existing and future
     *                                                   minimaps
     * @return {Disposable} a disposable to unregister the observer
     */
  }, {
    key: 'observeMinimaps',
    value: function observeMinimaps(iterator) {
      if (!iterator) {
        return;
      }

      if (this.editorsMinimaps) {
        this.editorsMinimaps.forEach(function (minimap) {
          iterator(minimap);
        });
      }
      return this.onDidCreateMinimap(function (minimap) {
        iterator(minimap);
      });
    }

    /**
     * Registers to the `observeTextEditors` method.
     *
     * @access private
     */
  }, {
    key: 'initSubscriptions',
    value: function initSubscriptions() {
      var _this5 = this;

      this.subscriptions.add(atom.workspace.observeTextEditors(function (textEditor) {
        var minimap = _this5.minimapForEditor(textEditor);
        var minimapElement = atom.views.getView(minimap);

        _this5.emitter.emit('did-create-minimap', minimap);

        minimapElement.attach();
      }));
    }
  }]);

  var _Main = Main;
  Main = (0, _decoratorsInclude2['default'])(_mixinsPluginManagement2['default'])(Main) || Main;
  return Main;
})();

exports['default'] = new Main();
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3NndWVudGhlci8uYXRvbS9wYWNrYWdlcy9taW5pbWFwL2xpYi9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O29CQUtpQixNQUFNOzs7O29CQVNvQixNQUFNOztpQ0FDN0Isc0JBQXNCOzs7O3NDQUNiLDRCQUE0Qjs7OztBQWhCekQsV0FBVyxDQUFBO0FBTVgsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsRUFBRTtBQUN0QixRQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBQyxDQUFDLEVBQUs7QUFDdkMsV0FBTyxDQUFDLEtBQUssVUFBVSxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsa0JBQUssT0FBTyxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsR0FBRyxrQkFBSyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQTtHQUNwRixDQUFDLENBQUMsT0FBTyxDQUFDLFVBQUMsQ0FBQyxFQUFLO0FBQ2hCLFdBQU8sT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQTtHQUN4QixDQUFDLENBQUE7Q0FDSDs7QUFNRCxJQUFJLE9BQU8sWUFBQTtJQUFFLGNBQWMsWUFBQTtJQUFFLDZCQUE2QixZQUFBLENBQUE7Ozs7Ozs7OztJQVNwRCxJQUFJOzs7Ozs7O0FBTUksV0FOUixJQUFJLEdBTU87Ozs7Ozs7OztBQU9iLFFBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFBOzs7Ozs7O0FBT25CLFFBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFBOzs7Ozs7OztBQVFwQixRQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQTs7Ozs7OztBQU8zQixRQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQTs7Ozs7OztBQU96QixRQUFJLENBQUMsdUJBQXVCLEdBQUcsSUFBSSxDQUFBOzs7Ozs7O0FBT25DLFFBQUksQ0FBQyxNQUFNLEdBQUcsT0FBTyxD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LENBQUE7T0FDeEIsQ0FBQyxDQUFDLENBQUE7S0FDSjs7O2NBM1VHLElBQUk7QUFBSixNQUFJLEdBRFQsd0VBQXlCLENBQ3BCLElBQUksS0FBSixJQUFJO1NBQUosSUFBSTs7O3FCQW1WSyxJQUFJLElBQUksRUFBRSIsImZpbGUiOiIvaG9tZS9zZ3VlbnRoZXIvLmF0b20vcGFja2FnZXMvbWluaW1hcC9saWIvbWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbi8qXG4gIFRoZSBmb2xsb3dpbmcgaGFjayBjbGVhcnMgdGhlIHJlcXVpcmUgY2FjaGUgb2YgYWxsIHRoZSBwYXRocyB0byB0aGUgbWluaW1hcCB3aGVuIHRoaXMgZmlsZSBpcyBsYW9kZWQuIEl0IHNob3VsZCBwcmV2ZW50cyBlcnJvcnMgb2YgcGFydGlhbCByZWxvYWRpbmcgYWZ0ZXIgYW4gdXBkYXRlLlxuICovXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaWYgKCFhdG9tLmluU3BlY01vZGUoKSnCoHtcbiAgT2JqZWN0LmtleXMocmVxdWlyZS5jYWNoZSkuZmlsdGVyKChwKSA9PiB7XG4gICAgcmV0dXJuIHAgIT09IF9fZmlsZW5hbWUgJiYgcC5pbmRleE9mKHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLicpICsgcGF0aC5zZXApID4gLTFcbiAgfSkuZm9yRWFjaCgocCkgPT4ge1xuICAgIGRlbGV0ZSByZXF1aXJlLmNhY2hlW3BdXG4gIH0pXG59XG5cbmltcG9ydCB7RW1pdHRlciwgQ29tcG9zaXRlRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSdcbmltcG9ydCBpbmNsdWRlIGZyb20gJy4vZGVjb3JhdG9ycy9pbmNsdWRlJ1xuaW1wb3J0IFBsdWdpbk1hbmFnZW1lbnQgZnJvbSAnLi9taXhpbnMvcGx1Z2luLW1hbmFnZW1lbnQnXG5cbmxldCBNaW5pbWFwLCBNaW5pbWFwRWxlbWVudCwgTWluaW1hcFBsdWdpbkdlbmVyYXRvckVsZW1lbnRcblxuLyoqXG4gKiBUaGUgYE1pbmltYXBgIHBhY2thZ2UgcHJvdmlkZXMgYW4gZWFnbGUtZXllIHZpZXcgb2YgdGV4dCBidWZmZXJzLlxuICpcbiAqIEl0IGFsc28gcHJvdmlkZXMgQVBJIGZvciBwbHVnaW4gcGFja2FnZXMgdGhhdCB3YW50IHRvIGludGVyYWN0IHdpdGggdGhlXG4gKiBtaW5pbWFwIGFuZCBiZSBhdmFpbGFibGUgdG8gdGhlIHVzZXIgdGhyb3VnaCB0aGUgbWluaW1hcCBzZXR0aW5ncy5cbiAqL1xuQGluY2x1ZGUoUGx1Z2luTWFuYWdlbWVudClcbmNsYXNzIE1haW4ge1xuICAvKipcbiAgICogVXNlZCBvbmx5IGF0IGV4cG9ydCB0aW1lLlxuICAgKlxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIGNvbnN0cnVjdG9yICgpIHtcbiAgICAvKipcbiAgICAgKiBUaGUgYWN0aXZhdGlvbiBzdGF0ZSBvZiB0aGUgcGFja2FnZS5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtib29sZWFufVxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMuYWN0aXZlID0gZmFsc2VcbiAgICAvKipcbiAgICAgKiBUaGUgdG9nZ2xlIHN0YXRlIG9mIHRoZSBwYWNrYWdlLlxuICAgICAqXG4gICAgICogQHR5cGUge2Jvb2xlYW59XG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy50b2dnbGVkID0gZmFsc2VcbiAgICAvKipcbiAgICAgKiBUaGUgYE1hcGAgd2hlcmUgTWluaW1hcCBpbnN0YW5jZXMgYXJlIHN0b3JlZCB3aXRoIHRoZSB0ZXh0IGVkaXRvciB0aGV5XG4gICAgICogdGFyZ2V0IGFzIGtleS5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtNYXB9XG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5lZGl0b3JzTWluaW1hcHMgPSBudWxsXG4gICAgLyoqXG4gICAgICogVGhlIGNvbXBvc2l0ZSBkaXNwb3NhYmxlIHRoYXQgc3RvcmVzIHRoZSBwYWNrYWdlJ3Mgc3Vic2NyaXB0aW9ucy5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtDb21wb3NpdGVEaXNwb3NhYmxlfVxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG51bGxcbiAgICAvKipcbiAgICAgKiBUaGUgZGlzcG9zYWJsZSB0aGF0IHN0b3JlcyB0aGUgcGFja2FnZSdzIGNvbW1hbmRzIHN1YnNjcmlwdGlvbi5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtEaXNwb3NhYmxlfVxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMuc3Vic2NyaXB0aW9uc09mQ29tbWFuZHMgPSBudWxsXG4gICAgLyoqXG4gICAgICogVGhlIHBhY2thZ2UncyBjb25maWcgb2JqZWN0LlxuICAgICAqXG4gICAgICogQHR5cGUge09iamVjdH1cbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLmNvbmZpZyA9IHJlcXVpcmUoJy4vY29uZmlnLXNjaGVtYS5qc29uJylcbiAgICAvKipcbiAgICAgKiBUaGUgcGFja2FnZSdzIGV2ZW50cyBlbWl0dGVyLlxuICAgICAqXG4gICAgICogQHR5cGUge0VtaXR0ZXJ9XG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5lbWl0dGVyID0gbmV3IEVtaXR0ZXIoKVxuXG4gICAgdGhpcy5pbml0aWFsaXplUGx1Z2lucygpXG4gIH1cblxuICAvKipcbiAgICogQWN0aXZhdGVzIHRoZSBtaW5pbWFwIHBhY2thZ2UuXG4gICAqL1xuICBhY3RpdmF0ZSAoKSB7XG4gICAgaWYgKHRoaXMuYWN0aXZlKSB7IHJldHVybiB9XG5cbiAgICBpZiAoIU1pbmltYXApIHsgTWluaW1hcCA9IHJlcXVpcmUoJy4vbWluaW1hcCcpIH1cbiAgICBpZiAoIU1pbmltYXBFbGVtZW50KSB7IE1pbmltYXBFbGVtZW50ID0gcmVxdWlyZSgnLi9taW5pbWFwLWVsZW1lbnQnKSB9XG5cbiAgICBNaW5pbWFwRWxlbWVudC5yZWdpc3RlclZpZXdQcm92aWRlcihNaW5pbWFwKVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zT2ZDb21tYW5kcyA9IGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsIHtcbiAgICAgICdtaW5pbWFwOnRvZ2dsZSc6ICgpID0+IHtcbiAgICAgICAgdGhpcy50b2dnbGUoKVxuICAgICAgfSxcbiAgICAgICdtaW5pbWFwOmdlbmVyYXRlLWNvZmZlZS1wbHVnaW4nOiAoKSA9PiB7XG4gICAgICAgIHRoaXMuZ2VuZXJhdGVQbHVnaW4oJ2NvZmZlZScpXG4gICAgICB9LFxuICAgICAgJ21pbmltYXA6Z2VuZXJhdGUtamF2YXNjcmlwdC1wbHVnaW4nOiAoKSA9PiB7XG4gICAgICAgIHRoaXMuZ2VuZXJhdGVQbHVnaW4oJ2phdmFzY3JpcHQnKVxuICAgICAgfSxcbiAgICAgICdtaW5pbWFwOmdlbmVyYXRlLWJhYmVsLXBsdWdpbic6ICgpID0+IHtcbiAgICAgICAgdGhpcy5nZW5lcmF0ZVBsdWdpbignYmFiZWwnKVxuICAgICAgfVxuICAgIH0pXG5cbiAgICB0aGlzLmVkaXRvcnNNaW5pbWFwcyA9IG5ldyBNYXAoKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcbiAgICB0aGlzLmFjdGl2ZSA9IHRydWVcblxuICAgIGlmIChhdG9tLmNvbmZpZy5nZXQoJ21pbmltYXAuYXV0b1RvZ2dsZScpKSB7IHRoaXMudG9nZ2xlKCkgfVxuICB9XG5cbiAgLyoqXG4gICAqIERlYWN0aXZhdGVzIHRoZSBtaW5pbWFwIHBhY2thZ2UuXG4gICAqL1xuICBkZWFjdGl2YXRlICgpIHtcbiAgICBpZiAoIXRoaXMuYWN0aXZlKSB7IHJldHVybiB9XG5cbiAgICB0aGlzLmRlYWN0aXZhdGVBbGxQbHVnaW5zKClcblxuICAgIGlmICh0aGlzLmVkaXRvcnNNaW5pbWFwcykge1xuICAgICAgdGhpcy5lZGl0b3JzTWluaW1hcHMuZm9yRWFjaCgodmFsdWUsIGtleSkgPT4ge1xuICAgICAgICB2YWx1ZS5kZXN0cm95KClcbiAgICAgICAgdGhpcy5lZGl0b3JzTWluaW1hcHMuZGVsZXRlKGtleSlcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG51bGxcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnNPZkNvbW1hbmRzLmRpc3Bvc2UoKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9uc09mQ29tbWFuZHMgPSBudWxsXG4gICAgdGhpcy5lZGl0b3JzTWluaW1hcHMgPSB1bmRlZmluZWRcbiAgICB0aGlzLnRvZ2dsZWQgPSBmYWxzZVxuICAgIHRoaXMuYWN0aXZlID0gZmFsc2VcbiAgfVxuXG4gIC8qKlxuICAgKiBUb2dnbGVzIHRoZSBtaW5pbWFwIGRpc3BsYXkuXG4gICAqL1xuICB0b2dnbGUgKCkge1xuICAgIGlmICghdGhpcy5hY3RpdmUpIHsgcmV0dXJuIH1cblxuICAgIGlmICh0aGlzLnRvZ2dsZWQpIHtcbiAgICAgIHRoaXMudG9nZ2xlZCA9IGZhbHNlXG5cbiAgICAgIGlmICh0aGlzLmVkaXRvcnNNaW5pbWFwcykge1xuICAgICAgICB0aGlzLmVkaXRvcnNNaW5pbWFwcy5mb3JFYWNoKCh2YWx1ZSwga2V5KSA9PiB7XG4gICAgICAgICAgdmFsdWUuZGVzdHJveSgpXG4gICAgICAgICAgdGhpcy5lZGl0b3JzTWluaW1hcHMuZGVsZXRlKGtleSlcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy50b2dnbGVkID0gdHJ1ZVxuICAgICAgdGhpcy5pbml0U3Vic2NyaXB0aW9ucygpXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIE9wZW5zIHRoZSBwbHVnaW4gZ2VuZXJhdGlvbiB2aWV3LlxuICAgKlxuICAgKiBAcGFyYW0gIHtzdHJpbmd9IHRlbXBsYXRlIHRoZSBuYW1lIG9mIHRoZSB0ZW1wbGF0ZSB0byB1c2VcbiAgICovXG4gIGdlbmVyYXRlUGx1Z2luICh0ZW1wbGF0ZSkge1xuICAgIGlmICghTWluaW1hcFBsdWdpbkdlbmVyYXRvckVsZW1lbnQpIHtcbiAgICAgIE1pbmltYXBQbHVnaW5HZW5lcmF0b3JFbGVtZW50ID0gcmVxdWlyZSgnLi9taW5pbWFwLXBsdWdpbi1nZW5lcmF0b3ItZWxlbWVudCcpXG4gICAgfVxuICAgIHZhciB2aWV3ID0gbmV3IE1pbmltYXBQbHVnaW5HZW5lcmF0b3JFbGVtZW50KClcbiAgICB2aWV3LnRlbXBsYXRlID0gdGVtcGxhdGVcbiAgICB2aWV3LmF0dGFjaCgpXG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXJzIGEgY2FsbGJhY2sgdG8gbGlzdGVuIHRvIHRoZSBgZGlkLWFjdGl2YXRlYCBldmVudCBvZiB0aGUgcGFja2FnZS5cbiAgICpcbiAgICogQHBhcmFtICB7ZnVuY3Rpb24oZXZlbnQ6T2JqZWN0KTp2b2lkfSBjYWxsYmFjayB0aGUgY2FsbGJhY2sgZnVuY3Rpb25cbiAgICogQHJldHVybiB7RGlzcG9zYWJsZX0gYSBkaXNwb3NhYmxlIHRvIHN0b3AgbGlzdGVuaW5nIHRvIHRoZSBldmVudFxuICAgKi9cbiAgb25EaWRBY3RpdmF0ZSAoY2FsbGJhY2spIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdkaWQtYWN0aXZhdGUnLCBjYWxsYmFjaylcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlcnMgYSBjYWxsYmFjayB0byBsaXN0ZW4gdG8gdGhlIGBkaWQtZGVhY3RpdmF0ZWAgZXZlbnQgb2YgdGhlXG4gICAqIHBhY2thZ2UuXG4gICAqXG4gICAqIEBwYXJhbSAge2Z1bmN0aW9uKGV2ZW50Ok9iamVjdCk6dm9pZH0gY2FsbGJhY2sgdGhlIGNhbGxiYWNrIGZ1bmN0aW9uXG4gICAqIEByZXR1cm4ge0Rpc3Bvc2FibGV9IGEgZGlzcG9zYWJsZSB0byBzdG9wIGxpc3RlbmluZyB0byB0aGUgZXZlbnRcbiAgICovXG4gIG9uRGlkRGVhY3RpdmF0ZSAoY2FsbGJhY2spIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdkaWQtZGVhY3RpdmF0ZScsIGNhbGxiYWNrKVxuICB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVycyBhIGNhbGxiYWNrIHRvIGxpc3RlbiB0byB0aGUgYGRpZC1jcmVhdGUtbWluaW1hcGAgZXZlbnQgb2YgdGhlXG4gICAqIHBhY2thZ2UuXG4gICAqXG4gICAqIEBwYXJhbSAge2Z1bmN0aW9uKGV2ZW50Ok9iamVjdCk6dm9pZH0gY2FsbGJhY2sgdGhlIGNhbGxiYWNrIGZ1bmN0aW9uXG4gICAqIEByZXR1cm4ge0Rpc3Bvc2FibGV9IGEgZGlzcG9zYWJsZSB0byBzdG9wIGxpc3RlbmluZyB0byB0aGUgZXZlbnRcbiAgICovXG4gIG9uRGlkQ3JlYXRlTWluaW1hcCAoY2FsbGJhY2spIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdkaWQtY3JlYXRlLW1pbmltYXAnLCBjYWxsYmFjaylcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlcnMgYSBjYWxsYmFjayB0byBsaXN0ZW4gdG8gdGhlIGBkaWQtYWRkLXBsdWdpbmAgZXZlbnQgb2YgdGhlXG4gICAqIHBhY2thZ2UuXG4gICAqXG4gICAqIEBwYXJhbSAge2Z1bmN0aW9uKGV2ZW50Ok9iamVjdCk6dm9pZH0gY2FsbGJhY2sgdGhlIGNhbGxiYWNrIGZ1bmN0aW9uXG4gICAqIEByZXR1cm4ge0Rpc3Bvc2FibGV9IGEgZGlzcG9zYWJsZSB0byBzdG9wIGxpc3RlbmluZyB0byB0aGUgZXZlbnRcbiAgICovXG4gIG9uRGlkQWRkUGx1Z2luIChjYWxsYmFjaykge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ2RpZC1hZGQtcGx1Z2luJywgY2FsbGJhY2spXG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXJzIGEgY2FsbGJhY2sgdG8gbGlzdGVuIHRvIHRoZSBgZGlkLXJlbW92ZS1wbHVnaW5gIGV2ZW50IG9mIHRoZVxuICAgKiBwYWNrYWdlLlxuICAgKlxuICAgKiBAcGFyYW0gIHtmdW5jdGlvbihldmVudDpPYmplY3QpOnZvaWR9IGNhbGxiYWNrIHRoZSBjYWxsYmFjayBmdW5jdGlvblxuICAgKiBAcmV0dXJuIHtEaXNwb3NhYmxlfSBhIGRpc3Bvc2FibGUgdG8gc3RvcCBsaXN0ZW5pbmcgdG8gdGhlIGV2ZW50XG4gICAqL1xuICBvbkRpZFJlbW92ZVBsdWdpbiAoY2FsbGJhY2spIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdkaWQtcmVtb3ZlLXBsdWdpbicsIGNhbGxiYWNrKVxuICB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVycyBhIGNhbGxiYWNrIHRvIGxpc3RlbiB0byB0aGUgYGRpZC1hY3RpdmF0ZS1wbHVnaW5gIGV2ZW50IG9mIHRoZVxuICAgKiBwYWNrYWdlLlxuICAgKlxuICAgKiBAcGFyYW0gIHtmdW5jdGlvbihldmVudDpPYmplY3QpOnZvaWR9IGNhbGxiYWNrIHRoZSBjYWxsYmFjayBmdW5jdGlvblxuICAgKiBAcmV0dXJuIHtEaXNwb3NhYmxlfSBhIGRpc3Bvc2FibGUgdG8gc3RvcCBsaXN0ZW5pbmcgdG8gdGhlIGV2ZW50XG4gICAqL1xuICBvbkRpZEFjdGl2YXRlUGx1Z2luIChjYWxsYmFjaykge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ2RpZC1hY3RpdmF0ZS1wbHVnaW4nLCBjYWxsYmFjaylcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlcnMgYSBjYWxsYmFjayB0byBsaXN0ZW4gdG8gdGhlIGBkaWQtZGVhY3RpdmF0ZS1wbHVnaW5gIGV2ZW50IG9mIHRoZVxuICAgKiBwYWNrYWdlLlxuICAgKlxuICAgKiBAcGFyYW0gIHtmdW5jdGlvbihldmVudDpPYmplY3QpOnZvaWR9IGNhbGxiYWNrIHRoZSBjYWxsYmFjayBmdW5jdGlvblxuICAgKiBAcmV0dXJuIHtEaXNwb3NhYmxlfSBhIGRpc3Bvc2FibGUgdG8gc3RvcCBsaXN0ZW5pbmcgdG8gdGhlIGV2ZW50XG4gICAqL1xuICBvbkRpZERlYWN0aXZhdGVQbHVnaW4gKGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignZGlkLWRlYWN0aXZhdGUtcGx1Z2luJywgY2FsbGJhY2spXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgYE1pbmltYXBgIGNsYXNzXG4gICAqXG4gICAqIEByZXR1cm4ge0Z1bmN0aW9ufSB0aGUgYE1pbmltYXBgIGNsYXNzIGNvbnN0cnVjdG9yXG4gICAqL1xuICBtaW5pbWFwQ2xhc3MgKCkgeyByZXR1cm4gTWluaW1hcCB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGBNaW5pbWFwYCBvYmplY3QgYXNzb2NpYXRlZCB0byB0aGUgcGFzc2VkLWluXG4gICAqIGBUZXh0RWRpdG9yRWxlbWVudGAuXG4gICAqXG4gICAqIEBwYXJhbSAge1RleHRFZGl0b3JFbGVtZW50fSBlZGl0b3JFbGVtZW50IGEgdGV4dCBlZGl0b3IgZWxlbWVudFxuICAgKiBAcmV0dXJuIHtNaW5pbWFwfSB0aGUgYXNzb2NpYXRlZCBtaW5pbWFwXG4gICAqL1xuICBtaW5pbWFwRm9yRWRpdG9yRWxlbWVudCAoZWRpdG9yRWxlbWVudCkge1xuICAgIGlmICghZWRpdG9yRWxlbWVudCkgeyByZXR1cm4gfVxuICAgIHJldHVybiB0aGlzLm1pbmltYXBGb3JFZGl0b3IoZWRpdG9yRWxlbWVudC5nZXRNb2RlbCgpKVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGBNaW5pbWFwYCBvYmplY3QgYXNzb2NpYXRlZCB0byB0aGUgcGFzc2VkLWluXG4gICAqIGBUZXh0RWRpdG9yYC5cbiAgICpcbiAgICogQHBhcmFtICB7VGV4dEVkaXRvcn0gdGV4dEVkaXRvciBhIHRleHQgZWRpdG9yXG4gICAqIEByZXR1cm4ge01pbmltYXB9IHRoZSBhc3NvY2lhdGVkIG1pbmltYXBcbiAgICovXG4gIG1pbmltYXBGb3JFZGl0b3IgKHRleHRFZGl0b3IpIHtcbiAgICBpZiAoIXRleHRFZGl0b3IpIHsgcmV0dXJuIH1cblxuICAgIGxldCBtaW5pbWFwID0gdGhpcy5lZGl0b3JzTWluaW1hcHMuZ2V0KHRleHRFZGl0b3IpXG5cbiAgICBpZiAoIW1pbmltYXApIHtcbiAgICAgIG1pbmltYXAgPSBuZXcgTWluaW1hcCh7dGV4dEVkaXRvcn0pXG4gICAgICB0aGlzLmVkaXRvcnNNaW5pbWFwcy5zZXQodGV4dEVkaXRvciwgbWluaW1hcClcblxuICAgICAgdmFyIGVkaXRvclN1YnNjcmlwdGlvbiA9IHRleHRFZGl0b3Iub25EaWREZXN0cm95KCgpID0+IHtcbiAgICAgICAgbGV0IG1pbmltYXBzID0gdGhpcy5lZGl0b3JzTWluaW1hcHNcbiAgICAgICAgaWYgKG1pbmltYXBzKSB7IG1pbmltYXBzLmRlbGV0ZSh0ZXh0RWRpdG9yKSB9XG4gICAgICAgIGVkaXRvclN1YnNjcmlwdGlvbi5kaXNwb3NlKClcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgcmV0dXJuIG1pbmltYXBcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgbmV3IHN0YW5kLWFsb25lIHtNaW5pbWFwfSBmb3IgdGhlIHBhc3NlZC1pbiBgVGV4dEVkaXRvcmAuXG4gICAqXG4gICAqIEBwYXJhbSAge1RleHRFZGl0b3J9IHRleHRFZGl0b3IgYSB0ZXh0IGVkaXRvciBpbnN0YW5jZSB0byBjcmVhdGVcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhIG1pbmltYXAgZm9yXG4gICAqIEByZXR1cm4ge01pbmltYXB9IGEgbmV3IHN0YW5kLWFsb25lIE1pbmltYXAgZm9yIHRoZSBwYXNzZWQtaW4gZWRpdG9yXG4gICAqL1xuICBzdGFuZEFsb25lTWluaW1hcEZvckVkaXRvciAodGV4dEVkaXRvcikge1xuICAgIGlmICghdGV4dEVkaXRvcikgeyByZXR1cm4gfVxuXG4gICAgcmV0dXJuIG5ldyBNaW5pbWFwKHtcbiAgICAgIHRleHRFZGl0b3I6IHRleHRFZGl0b3IsXG4gICAgICBzdGFuZEFsb25lOiB0cnVlXG4gICAgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBgTWluaW1hcGAgYXNzb2NpYXRlZCB0byB0aGUgYWN0aXZlIGBUZXh0RWRpdG9yYC5cbiAgICpcbiAgICogQHJldHVybiB7TWluaW1hcH0gdGhlIGFjdGl2ZSBNaW5pbWFwXG4gICAqL1xuICBnZXRBY3RpdmVNaW5pbWFwICgpIHtcbiAgICByZXR1cm4gdGhpcy5taW5pbWFwRm9yRWRpdG9yKGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKSlcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxscyBhIGZ1bmN0aW9uIGZvciBlYWNoIHByZXNlbnQgYW5kIGZ1dHVyZSBtaW5pbWFwcy5cbiAgICpcbiAgICogQHBhcmFtICB7ZnVuY3Rpb24obWluaW1hcDpNaW5pbWFwKTp2b2lkfSBpdGVyYXRvciBhIGZ1bmN0aW9uIHRvIGNhbGwgd2l0aFxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoZSBleGlzdGluZyBhbmQgZnV0dXJlXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWluaW1hcHNcbiAgICogQHJldHVybiB7RGlzcG9zYWJsZX0gYSBkaXNwb3NhYmxlIHRvIHVucmVnaXN0ZXIgdGhlIG9ic2VydmVyXG4gICAqL1xuICBvYnNlcnZlTWluaW1hcHMgKGl0ZXJhdG9yKSB7XG4gICAgaWYgKCFpdGVyYXRvcikgeyByZXR1cm4gfVxuXG4gICAgaWYgKHRoaXMuZWRpdG9yc01pbmltYXBzKSB7XG4gICAgICB0aGlzLmVkaXRvcnNNaW5pbWFwcy5mb3JFYWNoKChtaW5pbWFwKSA9PiB7IGl0ZXJhdG9yKG1pbmltYXApIH0pXG4gICAgfVxuICAgIHJldHVybiB0aGlzLm9uRGlkQ3JlYXRlTWluaW1hcCgobWluaW1hcCkgPT4geyBpdGVyYXRvcihtaW5pbWFwKSB9KVxuICB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVycyB0byB0aGUgYG9ic2VydmVUZXh0RWRpdG9yc2AgbWV0aG9kLlxuICAgKlxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIGluaXRTdWJzY3JpcHRpb25zICgpIHtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20ud29ya3NwYWNlLm9ic2VydmVUZXh0RWRpdG9ycygodGV4dEVkaXRvcikgPT4ge1xuICAgICAgbGV0IG1pbmltYXAgPSB0aGlzLm1pbmltYXBGb3JFZGl0b3IodGV4dEVkaXRvcilcbiAgICAgIGxldCBtaW5pbWFwRWxlbWVudCA9IGF0b20udmlld3MuZ2V0VmlldyhtaW5pbWFwKVxuXG4gICAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLWNyZWF0ZS1taW5pbWFwJywgbWluaW1hcClcblxuICAgICAgbWluaW1hcEVsZW1lbnQuYXR0YWNoKClcbiAgICB9KSlcbiAgfVxufVxuXG4vKipcbiAqIFRoZSBleHBvc2VkIGluc3RhbmNlIG9mIHRoZSBgTWFpbmAgY2xhc3MuXG4gKlxuICogQGFjY2VzcyBwcml2YXRlXG4gKi9cbmV4cG9ydCBkZWZhdWx0IG5ldyBNYWluKClcbiJdfQ==
//# sourceURL=/home/sguenther/.atom/packages/minimap/lib/main.js
