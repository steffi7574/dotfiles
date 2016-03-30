(function() {
  module.exports = {
    title: 'Config-Import-Export',
    addInfo: function(message, _arg) {
      var dismissable;
      dismissable = (_arg != null ? _arg : {}).dismissable;
      return atom.notifications.addInfo(this.title, {
        detail: message,
        dismissable: dismissable
      });
    },
    addSuccess: function(message, _arg) {
      var dismissable;
      dismissable = (_arg != null ? _arg : {}).dismissable;
      return atom.notifications.addSuccess(this.title, {
        detail: message,
        dismissable: dismissable
      });
    },
    addError: function(message, _arg) {
      var dismissable;
      dismissable = (_arg != null ? _arg : {}).dismissable;
      return atom.notifications.addError(this.title, {
        detail: message,
        dismissable: dismissable
      });
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL2NvbmZpZy1pbXBvcnQtZXhwb3J0L2xpYi9ub3RpZmllci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLEVBQUEsTUFBTSxDQUFDLE9BQVAsR0FDRTtBQUFBLElBQUEsS0FBQSxFQUFPLHNCQUFQO0FBQUEsSUFDQSxPQUFBLEVBQVMsU0FBQyxPQUFELEVBQVUsSUFBVixHQUFBO0FBQ1AsVUFBQSxXQUFBO0FBQUEsTUFEa0IsOEJBQUQsT0FBYyxJQUFiLFdBQ2xCLENBQUE7YUFBQSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQW5CLENBQTJCLElBQUMsQ0FBQSxLQUE1QixFQUFtQztBQUFBLFFBQUEsTUFBQSxFQUFRLE9BQVI7QUFBQSxRQUFpQixXQUFBLEVBQWEsV0FBOUI7T0FBbkMsRUFETztJQUFBLENBRFQ7QUFBQSxJQUdBLFVBQUEsRUFBWSxTQUFDLE9BQUQsRUFBVSxJQUFWLEdBQUE7QUFDVixVQUFBLFdBQUE7QUFBQSxNQURxQiw4QkFBRCxPQUFjLElBQWIsV0FDckIsQ0FBQTthQUFBLElBQUksQ0FBQyxhQUFhLENBQUMsVUFBbkIsQ0FBOEIsSUFBQyxDQUFBLEtBQS9CLEVBQXNDO0FBQUEsUUFBQSxNQUFBLEVBQVEsT0FBUjtBQUFBLFFBQWlCLFdBQUEsRUFBYSxXQUE5QjtPQUF0QyxFQURVO0lBQUEsQ0FIWjtBQUFBLElBS0EsUUFBQSxFQUFVLFNBQUMsT0FBRCxFQUFVLElBQVYsR0FBQTtBQUNSLFVBQUEsV0FBQTtBQUFBLE1BRG1CLDhCQUFELE9BQWMsSUFBYixXQUNuQixDQUFBO2FBQUEsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFuQixDQUE0QixJQUFDLENBQUEsS0FBN0IsRUFBb0M7QUFBQSxRQUFBLE1BQUEsRUFBUSxPQUFSO0FBQUEsUUFBaUIsV0FBQSxFQUFhLFdBQTlCO09BQXBDLEVBRFE7SUFBQSxDQUxWO0dBREYsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/sguenther/.atom/packages/config-import-export/lib/notifier.coffee
