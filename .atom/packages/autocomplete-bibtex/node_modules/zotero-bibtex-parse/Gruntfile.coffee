module.exports = (grunt) ->
  grunt.initConfig {
    coffee: {
      compile: {
        files: {
          'zotero-bibtex-parse.js': 'zotero-bibtex-parse.litcoffee'
        }
      }
    }
  }

  grunt.loadNpmTasks 'grunt-contrib-coffee'

  grunt.registerTask 'default', ['coffee:compile']
