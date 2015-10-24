'use strict';

var _ = require('lodash');

module.exports = function(grunt) {

  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  var jstests = [
    'test/unit/*.spec.js',
    'test/func/*.spec.js',
    'test/unit/**/*.spec.js',
    'test/func/**/*.spec.js'
  ];

  var jscode = [
    '*.js',
    'lib/*.js',
    '!test.js',
    '!test?.js',
    '!dumbClient.js',
    '!dumbServer.js',
    '!Gruntfile.js'
  ];

  var jsfiles = jscode.concat(jstests);

  grunt.initConfig({
    jshint: {
      files: jsfiles,
      options: {
        reporter: require('jshint-stylish'),
        jshintrc: './.jshintrc'
      }
    },

    jscs: {
      src: jsfiles
    },

    mochaTest: {
      test: {
        options: {
          reporter: 'spec',
          timeout: 20000
        },
        src: jstests
      }
    },

    shell: {
      test: {
        command: 'NODE_ENV=test istanbul cover --report lcov --dir test/reports/unit _mocha test/unit/ test/func -- --reporter xunit-file',
        options: {
          stdout: true,
          failOnError: true
        }
      }
    }
  });

  grunt.registerTask('test', ['lint', 'mochaTest', 'shell:test']);
  grunt.registerTask('coverage', ['shell:test']);
  grunt.registerTask('lint', ['jshint', 'jscs']);
  grunt.registerTask('default', ['test']);
};
