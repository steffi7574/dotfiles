(function() {
  var fs, parse_tex_directives, path;

  fs = require('fs');

  path = require('path');

  parse_tex_directives = require('../../lib/parsers/tex-directive-parser');

  describe('TeXCommentParser', function() {
    beforeEach(function() {
      return waitsForPromise((function(_this) {
        return function() {
          return atom.workspace.open().then(function(editor) {
            _this.editor = editor;
            return _this.editor = _this.editor;
          });
        };
      })(this));
    });
    describe('example directives', function() {
      it('should parse root directives', function() {
        var result;
        this.editor.insertText("%!TEX root = /root.tex\n");
        result = parse_tex_directives(this.editor);
        return expect(result.root).toBe('/root.tex');
      });
      it('should parse program directives', function() {
        var result;
        this.editor.insertText("%!TEX program = xelatex\n");
        result = parse_tex_directives(this.editor);
        return expect(result.program).toBe('xelatex');
      });
      it('should parse TS-program directives', function() {
        var result;
        this.editor.insertText("%!TEX TS-program = xelatex\n");
        result = parse_tex_directives(this.editor, {
          keyMaps: {
            'ts-program': 'program'
          }
        });
        return expect(result.program).toBe('xelatex');
      });
      return it('should parse option directives', function() {
        var result;
        this.editor.insertText("%!TEX options = --shell-escape\n%!TEX options = --draft-mode");
        result = parse_tex_directives(this.editor, {
          multiValues: ['options']
        });
        expect(result.options).toContain('--shell-escape');
        return expect(result.options).toContain('--draft-mode');
      });
    });
    return describe('features', function() {
      it('should ignore trailing spaces', function() {
        var result;
        this.editor.insertText("%!TEX program = xelatex           \n");
        result = parse_tex_directives(this.editor);
        return expect(result.program).toBe('xelatex');
      });
      it('should allow multiple comment markers', function() {
        var result;
        this.editor.insertText("%%%%%%%%%!TEX program = xelatex\n");
        result = parse_tex_directives(this.editor);
        return expect(result.program).toBe('xelatex');
      });
      it('should allow spaces before !TEX', function() {
        var result;
        this.editor.insertText("% !TEX program = xelatex\n");
        result = parse_tex_directives(this.editor);
        return expect(result.program).toBe('xelatex');
      });
      it('should work with no spaces around "="', function() {
        var result;
        this.editor.insertText("%!TEX program=xelatex\n");
        result = parse_tex_directives(this.editor);
        return expect(result.program).toBe('xelatex');
      });
      it('should accept mix-cased TeX', function() {
        var result;
        this.editor.insertText("%!TeX program = xelatex\n");
        result = parse_tex_directives(this.editor);
        return expect(result.program).toBe('xelatex');
      });
      it('should translate directive to lower case', function() {
        var result;
        this.editor.insertText("%!TEX PROGRAM = xelatex\n");
        result = parse_tex_directives(this.editor);
        return expect(result.program).toBe('xelatex');
      });
      it('should support multiple directives', function() {
        var result;
        this.editor.insertText("%!TEX program = xelatex\n%!TEX options = --shell-escape");
        result = parse_tex_directives(this.editor);
        expect(result.program).toBe('xelatex');
        return expect(result.options).toBe('--shell-escape');
      });
      it('should not find options after the first LaTeX command', function() {
        var result;
        this.editor.insertText("%!TEX program = xelatex\n\documentclass{article}\n%!TEX root = root.tex");
        result = parse_tex_directives(this.editor);
        expect(result.program).toBe('xelatex');
        return expect(result.root).toBeUndefined;
      });
      it('should allow Windows-style paths', function() {
        var result;
        this.editor.insertText("%!TEX root = C:\\Users\\user\\path\\to\\root.tex\n");
        result = parse_tex_directives(this.editor);
        return expect(result.root).toBe("C:\\Users\\user\\path\\to\\root.tex");
      });
      it('should override a previous directive with a latter directive', function() {
        var result;
        this.editor.insertText("%!TEX program = xelatex\n%!TEX program = lualatex");
        result = parse_tex_directives(this.editor);
        return expect(result.program).toBe('lualatex');
      });
      it('should allow multivalued directives which do not get overridden', function() {
        var result;
        this.editor.insertText("%!TEX options = --shell-escape\n%!TEX options = --draft-mode");
        result = parse_tex_directives(this.editor, {
          multiValues: ['options']
        });
        expect(result.options).toContain('--shell-escape');
        return expect(result.options).toContain('--draft-mode');
      });
      it('should allow directives to be renamed', function() {
        var result;
        this.editor.insertText("%!TEX TS-program=xelatex\n");
        result = parse_tex_directives(this.editor, {
          keyMaps: {
            'ts-program': 'program'
          }
        });
        expect(result.program).toBe('xelatex');
        return expect(result['ts-program']).toBeUndefined;
      });
      return it('should support reading from a file specified as a path', function() {
        var fixturesPath, result, testFile;
        fixturesPath = path.join(atom.project.getPaths()[0], 'parsers', 'tex-directive-parser');
        fixturesPath = fs.realpathSync(fixturesPath);
        testFile = path.join(fixturesPath, 'test.tex');
        result = parse_tex_directives(testFile);
        return expect(result.program).toBe('xelatex');
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL2xhdGV4dG9vbHMvc3BlYy9wYXJzZXJzL3RleC1kaXJlY3RpdmUtcGFyc2VyLXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDhCQUFBOztBQUFBLEVBQUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSLENBQUwsQ0FBQTs7QUFBQSxFQUNBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQURQLENBQUE7O0FBQUEsRUFFQSxvQkFBQSxHQUF1QixPQUFBLENBQVEsd0NBQVIsQ0FGdkIsQ0FBQTs7QUFBQSxFQUlBLFFBQUEsQ0FBUyxrQkFBVCxFQUE2QixTQUFBLEdBQUE7QUFDM0IsSUFBQSxVQUFBLENBQVcsU0FBQSxHQUFBO2FBQ1QsZUFBQSxDQUFnQixDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO2lCQUNkLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBZixDQUFBLENBQXFCLENBQUMsSUFBdEIsQ0FBMkIsU0FBRSxNQUFGLEdBQUE7QUFDekIsWUFEMEIsS0FBQyxDQUFBLFNBQUEsTUFDM0IsQ0FBQTttQkFBQSxLQUFDLENBQUEsTUFBRCxHQUFVLEtBQUMsQ0FBQSxPQURjO1VBQUEsQ0FBM0IsRUFEYztRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWhCLEVBRFM7SUFBQSxDQUFYLENBQUEsQ0FBQTtBQUFBLElBS0EsUUFBQSxDQUFTLG9CQUFULEVBQStCLFNBQUEsR0FBQTtBQUM3QixNQUFBLEVBQUEsQ0FBRyw4QkFBSCxFQUFtQyxTQUFBLEdBQUE7QUFDakMsWUFBQSxNQUFBO0FBQUEsUUFBQSxJQUFDLENBQUEsTUFBTSxDQUFDLFVBQVIsQ0FBbUIsMEJBQW5CLENBQUEsQ0FBQTtBQUFBLFFBQ0EsTUFBQSxHQUFTLG9C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

//# sourceURL=/home/sguenther/.atom/packages/latextools/spec/parsers/tex-directive-parser-spec.coffee
