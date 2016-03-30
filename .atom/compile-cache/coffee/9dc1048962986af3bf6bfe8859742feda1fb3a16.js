(function() {
  var Projects;

  Projects = require('../lib/projects');

  describe("Projects", function() {
    var data, projects;
    projects = null;
    data = {
      testproject1: {
        title: "Test project 1",
        paths: ["/Users/project-1"]
      },
      testproject2: {
        title: "Test project 2",
        paths: ["/Users/project-2"]
      }
    };
    beforeEach(function() {
      projects = new Projects();
      spyOn(projects.db, 'readFile').andCallFake(function(callback) {
        return callback(data);
      });
      return spyOn(projects.db, 'writeFile').andCallFake(function(projects, callback) {
        data = projects;
        return callback();
      });
    });
    return it("returns all projects", function() {
      return projects.getAll(function(projects) {
        return expect(projects.length).toBe(2);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL3Byb2plY3QtbWFuYWdlci9zcGVjL3Byb2plY3RzLXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLFFBQUE7O0FBQUEsRUFBQSxRQUFBLEdBQVcsT0FBQSxDQUFRLGlCQUFSLENBQVgsQ0FBQTs7QUFBQSxFQUVBLFFBQUEsQ0FBUyxVQUFULEVBQXFCLFNBQUEsR0FBQTtBQUNuQixRQUFBLGNBQUE7QUFBQSxJQUFBLFFBQUEsR0FBVyxJQUFYLENBQUE7QUFBQSxJQUVBLElBQUEsR0FDRTtBQUFBLE1BQUEsWUFBQSxFQUNFO0FBQUEsUUFBQSxLQUFBLEVBQU8sZ0JBQVA7QUFBQSxRQUNBLEtBQUEsRUFBTyxDQUNMLGtCQURLLENBRFA7T0FERjtBQUFBLE1BS0EsWUFBQSxFQUNFO0FBQUEsUUFBQSxLQUFBLEVBQU8sZ0JBQVA7QUFBQSxRQUNBLEtBQUEsRUFBTyxDQUNMLGtCQURLLENBRFA7T0FORjtLQUhGLENBQUE7QUFBQSxJQWNBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxNQUFBLFFBQUEsR0FBZSxJQUFBLFFBQUEsQ0FBQSxDQUFmLENBQUE7QUFBQSxNQUNBLEtBQUEsQ0FBTSxRQUFRLENBQUMsRUFBZixFQUFtQixVQUFuQixDQUE4QixDQUFDLFdBQS9CLENBQTJDLFNBQUMsUUFBRCxHQUFBO2VBQ3pDLFFBQUEsQ0FBUyxJQUFULEVBRHlDO01BQUEsQ0FBM0MsQ0FEQSxDQUFBO2FBR0EsS0FBQSxDQUFNLFFBQVEsQ0FBQyxFQUFmLEVBQW1CLFdBQW5CLENBQStCLENBQUMsV0FBaEMsQ0FBNEMsU0FBQyxRQUFELEVBQVcsUUFBWCxHQUFBO0FBQzFDLFFBQUEsSUFBQSxHQUFPLFFBQVAsQ0FBQTtlQUNBLFFBQUEsQ0FBQSxFQUYwQztNQUFBLENBQTVDLEVBSlM7SUFBQSxDQUFYLENBZEEsQ0FBQTtXQXNCQSxFQUFBLENBQUcsc0JBQUgsRUFBMkIsU0FBQSxHQUFBO2FBQ3pCLFFBQVEsQ0FBQyxNQUFULENBQWdCLFNBQUMsUUFBRCxHQUFBO2VBQ2QsTUFBQSxDQUFPLFFBQVEsQ0FBQyxNQUFoQixDQUF1QixDQUFDLElBQXhCLENBQTZCLENBQTdCLEVBRGM7TUFBQSxDQUFoQixFQUR5QjtJQUFBLENBQTNCLEVBdkJtQjtFQUFBLENBQXJCLENBRkEsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/sguenther/.atom/packages/project-manager/spec/projects-spec.coffee
