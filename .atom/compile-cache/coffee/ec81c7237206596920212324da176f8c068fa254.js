(function() {
  var ConfigPlus;

  ConfigPlus = require('atom-config-plus');

  module.exports = new ConfigPlus('isearch', {
    useWildChar: {
      order: 0,
      type: 'boolean',
      "default": true
    },
    wildChar: {
      order: 1,
      type: 'string',
      "default": '',
      description: "Use this char as wild card char"
    },
    useSmartCase: {
      order: 2,
      type: 'boolean',
      "default": true,
      description: "Case sensitive search if search text include capital letters"
    },
    historySize: {
      order: 3,
      type: 'integer',
      "default": 30,
      minimum: 1,
      max: 100
    },
    vimModeSyncSearchHistoy: {
      order: 4,
      type: 'boolean',
      "default": true,
      description: "Sync search history to vim-mode's search history if available"
    },
    showHoverIndicator: {
      order: 5,
      type: 'boolean',
      "default": true
    }
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL2lzZWFyY2gvbGliL3NldHRpbmdzLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxVQUFBOztBQUFBLEVBQUEsVUFBQSxHQUFhLE9BQUEsQ0FBUSxrQkFBUixDQUFiLENBQUE7O0FBQUEsRUFFQSxNQUFNLENBQUMsT0FBUCxHQUFxQixJQUFBLFVBQUEsQ0FBVyxTQUFYLEVBQ25CO0FBQUEsSUFBQSxXQUFBLEVBQ0U7QUFBQSxNQUFBLEtBQUEsRUFBUyxDQUFUO0FBQUEsTUFDQSxJQUFBLEVBQVMsU0FEVDtBQUFBLE1BRUEsU0FBQSxFQUFTLElBRlQ7S0FERjtBQUFBLElBSUEsUUFBQSxFQUNFO0FBQUEsTUFBQSxLQUFBLEVBQVMsQ0FBVDtBQUFBLE1BQ0EsSUFBQSxFQUFTLFFBRFQ7QUFBQSxNQUVBLFNBQUEsRUFBUyxFQUZUO0FBQUEsTUFHQSxXQUFBLEVBQWEsaUNBSGI7S0FMRjtBQUFBLElBU0EsWUFBQSxFQUNFO0FBQUEsTUFBQSxLQUFBLEVBQVMsQ0FBVDtBQUFBLE1BQ0EsSUFBQSxFQUFTLFNBRFQ7QUFBQSxNQUVBLFNBQUEsRUFBUyxJQUZUO0FBQUEsTUFHQSxXQUFBLEVBQWEsOERBSGI7S0FWRjtBQUFBLElBY0EsV0FBQSxFQUNFO0FBQUEsTUFBQSxLQUFBLEVBQVMsQ0FBVDtBQUFBLE1BQ0EsSUFBQSxFQUFTLFNBRFQ7QUFBQSxNQUVBLFNBQUEsRUFBUyxFQUZUO0FBQUEsTUFHQSxPQUFBLEVBQVMsQ0FIVDtBQUFBLE1BSUEsR0FBQSxFQUFTLEdBSlQ7S0FmRjtBQUFBLElBb0JBLHVCQUFBLEVBQ0U7QUFBQSxNQUFBLEtBQUEsRUFBUyxDQUFUO0FBQUEsTUFDQSxJQUFBLEVBQVMsU0FEVDtBQUFBLE1BRUEsU0FBQSxFQUFTLElBRlQ7QUFBQSxNQUdBLFdBQUEsRUFBYSwrREFIYjtLQXJCRjtBQUFBLElBeUJBLGtCQUFBLEVBQ0U7QUFBQSxNQUFBLEtBQUEsRUFBUyxDQUFUO0FBQUEsTUFDQSxJQUFBLEVBQVMsU0FEVDtBQUFBLE1BRUEsU0FBQSxFQUFTLElBRlQ7S0ExQkY7R0FEbUIsQ0FGckIsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/sguenther/.atom/packages/isearch/lib/settings.coffee
