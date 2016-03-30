(function() {
  var ConfigImportExport;

  ConfigImportExport = require('../lib/config-import-export');

  describe("ConfigImportExport", function() {
    var activationPromise, workspaceElement, _ref;
    _ref = [], workspaceElement = _ref[0], activationPromise = _ref[1];
    beforeEach(function() {
      workspaceElement = atom.views.getView(atom.workspace);
      return activationPromise = atom.packages.activatePackage('config-import-export');
    });
    return describe("when the config-import-export:toggle event is triggered", function() {
      it("hides and shows the modal panel", function() {
        expect(workspaceElement.querySelector('.config-import-export')).not.toExist();
        atom.commands.dispatch(workspaceElement, 'config-import-export:toggle');
        waitsForPromise(function() {
          return activationPromise;
        });
        return runs(function() {
          var configImportExportElement, configImportExportPanel;
          expect(workspaceElement.querySelector('.config-import-export')).toExist();
          configImportExportElement = workspaceElement.querySelector('.config-import-export');
          expect(configImportExportElement).toExist();
          configImportExportPanel = atom.workspace.panelForItem(configImportExportElement);
          expect(configImportExportPanel.isVisible()).toBe(true);
          atom.commands.dispatch(workspaceElement, 'config-import-export:toggle');
          return expect(configImportExportPanel.isVisible()).toBe(false);
        });
      });
      return it("hides and shows the view", function() {
        jasmine.attachToDOM(workspaceElement);
        expect(workspaceElement.querySelector('.config-import-export')).not.toExist();
        atom.commands.dispatch(workspaceElement, 'config-import-export:toggle');
        waitsForPromise(function() {
          return activationPromise;
        });
        return runs(function() {
          var configImportExportElement;
          configImportExportElement = workspaceElement.querySelector('.config-import-export');
          expect(configImportExportElement).toBeVisible();
          atom.commands.dispatch(workspaceElement, 'config-import-export:toggle');
          return expect(configImportExportElement).not.toBeVisible();
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL2NvbmZpZy1pbXBvcnQtZXhwb3J0L3NwZWMvY29uZmlnLWltcG9ydC1leHBvcnQtc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsa0JBQUE7O0FBQUEsRUFBQSxrQkFBQSxHQUFxQixPQUFBLENBQVEsNkJBQVIsQ0FBckIsQ0FBQTs7QUFBQSxFQU9BLFFBQUEsQ0FBUyxvQkFBVCxFQUErQixTQUFBLEdBQUE7QUFDN0IsUUFBQSx5Q0FBQTtBQUFBLElBQUEsT0FBd0MsRUFBeEMsRUFBQywwQkFBRCxFQUFtQiwyQkFBbkIsQ0FBQTtBQUFBLElBRUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULE1BQUEsZ0JBQUEsR0FBbUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLElBQUksQ0FBQyxTQUF4QixDQUFuQixDQUFBO2FBQ0EsaUJBQUEsR0FBb0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFkLENBQThCLHNCQUE5QixFQUZYO0lBQUEsQ0FBWCxDQUZBLENBQUE7V0FNQSxRQUFBLENBQVMseURBQVQsRUFBb0UsU0FBQSxHQUFBO0FBQ2xFLE1BQUEsRUFBQSxDQUFHLGlDQUFILEVBQXNDLFNBQUEsR0FBQTtBQUdwQyxRQUFBLE1BQUEsQ0FBTyxnQkFBZ0IsQ0FBQyxhQUFqQixDQUErQix1QkFBL0IsQ0FBUCxDQUErRCxDQUFDLEdBQUcsQ0FBQyxPQUFwRSxDQUFBLENBQUEsQ0FBQTtBQUFBLFFBSUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFkLENBQXVCLGdCQUF2QixFQUF5Qyw2QkFBekMsQ0FKQSxDQUFBO0FBQUEsUUFNQSxlQUFBLENBQWdCLFNBQUEsR0FBQTtpQkFDZCxrQkFEYztRQUFBLENBQWhCLENBTkEsQ0FBQTtlQVNBLElBQUEsQ0FBSyxTQUFBLEdBQUE7QUFDSCxjQUFBLGtEQUFBO0FBQUEsVUFBQSxNQUFBLENBQU8sZ0JBQWdCLENBQUMsYUFBakIsQ0FBK0IsdUJBQS9CLENBQVAsQ0FBK0QsQ0FBQyxPQUFoRSxDQUFBLENBQUEsQ0FBQTtBQUFBLFVBRUEseUJBQUEsR0FBNEIsZ0JBQWdCLENBQUMsYUFBakIsQ0FBK0IsdUJBQS9CLENBRjVCLENBQUE7QUFBQSxVQUdBLE1BQUEsQ0FBTyx5QkFBUCxDQUFpQyxDQUFDLE9BQWxDLENBQUEsQ0FIQSxDQUFBO0FBQUEsVUFLQSx1QkFBQSxHQUEwQixJQUFJLENBQUMsU0FBUyxDQUFDLFlBQWYsQ0FBNEIseUJBQTVCLENBTDFCLENBQUE7QUFBQSxVQU1BLE1BQUEsQ0FBTyx1QkFBdUIsQ0FBQyxTQUF4QixDQUFBLENBQVAsQ0FBMkMsQ0FBQyxJQUE1QyxDQUFpRCxJQUFqRCxDQU5BLENBQUE7QUFBQSxVQU9BLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBZCxDQUF1QixnQkFBdkIsRUFBeUMsNkJBQXpDLENBUEEsQ0FBQTtpQkFRQSxNQUFBLENBQU8sdUJBQXVCLENBQUMsU0FBeEIsQ0FBQSxDQUFQLENBQTJDLENBQUMsSUFBNUMsQ0FBaUQsS0FBakQsRUFURztRQUFBLENBQUwsRUFab0M7TUFBQSxDQUF0QyxDQUFBLENBQUE7YUF1QkEsRUFBQSxDQUFHLDBCQUFILEVBQStCLFNBQUEsR0FBQTtBQU83QixRQUFBLE9BQU8sQ0FBQyxXQUFSLENBQW9CLGdCQUFwQixDQUFBLENBQUE7QUFBQSxRQUVBLE1BQUEsQ0FBTyxnQkFBZ0IsQ0FBQyxhQUFqQixDQUErQix1QkFBL0IsQ0FBUCxDQUErRCxDQUFDLEdBQUcsQ0FBQyxPQUFwRSxDQUFBLENBRkEsQ0FBQTtBQUFBLFFBTUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFkLENBQXVCLGdCQUF2QixFQUF5Qyw2QkFBekMsQ0FOQSxDQUFBO0FBQUEsUUFRQSxlQUFBLENBQWdCLFNBQUEsR0FBQTtpQkFDZCxrQkFEYztRQUFBLENBQWhCLENBUkEsQ0FBQTtlQVdBLElBQUEsQ0FBSyxTQUFBLEdBQUE7QUFFSCxjQUFBLHlCQUFBO0FBQUEsVUFBQSx5QkFBQSxHQUE0QixnQkFBZ0IsQ0FBQyxhQUFqQixDQUErQix1QkFBL0IsQ0FBNUIsQ0FBQTtBQUFBLFVBQ0EsTUFBQSxDQUFPLHlCQUFQLENBQWlDLENBQUMsV0FBbEMsQ0FBQSxDQURBLENBQUE7QUFBQSxVQUVBLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBZCxDQUF1QixnQkFBdkIsRUFBeUMsNkJBQXpDLENBRkEsQ0FBQTtpQkFHQSxNQUFBLENBQU8seUJBQVAsQ0FBaUMsQ0FBQyxHQUFHLENBQUMsV0FBdEMsQ0FBQSxFQUxHO1FBQUEsQ0FBTCxFQWxCNkI7TUFBQSxDQUEvQixFQXhCa0U7SUFBQSxDQUFwRSxFQVA2QjtFQUFBLENBQS9CLENBUEEsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/sguenther/.atom/packages/config-import-export/spec/config-import-export-spec.coffee
