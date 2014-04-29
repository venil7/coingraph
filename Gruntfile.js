module.exports = function(grunt) {

    require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        appConfig: grunt.file.readJSON('config.json'),

        uglify: {
          options: {
            banner: '\n/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
                    '<%= grunt.template.today("yyyy-mm-dd") %> */\n'/*,
            sourceMap: 'dist/scripts/app.js.map',
            sourceMappingURL: '/scripts/app.js.map'*/
          },
          prod: {
            files: {
              'dist/scripts/app.min.js':
                [ 
                 'bower_components/angular/angular.js',
                 'bower_components/d3/d3.js',
                 'bower_components/n3-charts-line-chart/dist/line-chart.js',
                 'bower_components/momentjs/moment.js',
                 'dist/scripts/app.js' 
                ]
            }
          }
        },

        browserify: {
          options: {
            debug: true
          },
          compile: {
            files: {
              'dist/scripts/app.js': ['web/scripts/*.js']
            }
          }
        },

        htmlrefs: {
          prod: {
            src: 'web/index.html',
            dest: 'dist/index.html',
            options: {
              buildNumber: '<%= pkg.version %>'
            }
          }
        },

        less: {
          prod: {
            files: {
              'dist/styles/style.css':
                [ 'web/styles/*.less' ]
            }
          },
          options: {
            compress: true
          }
        },

        copy: {
          'web-images': {
            files: [ {  expand: true, cwd: 'web/', src: ['images/*'], dest: 'dist/', filter: 'isFile' } ]
          },
          html: {
            files: [ { expand: true, cwd: 'web/', src: ['*.html'], dest: 'dist/', filter: 'isFile' } ]
          },
          ico: {
            files: [ { expand: true, cwd: 'web/', src: ['favicon.ico'], dest: 'dist/', filter: 'isFile' } ]
          },
          bower: {
            files: [
              { expand: true, cwd: 'bower_components/bootstrap/dist/css/', src: ['bootstrap.min.css'], dest: 'dist/styles/', filter: 'isFile' },
            ]
          }

        },

        clean: {
          dist: {
            src: ["dist/"]
          },
          browserify: ['dist/scripts/app.js']
        },

        watch: {
          js: {
            files: ['web/scripts/*.js'],
            tasks: ['browserify']
          },

          less: {
            files: ['web/styles/*.less'],
            tasks: ['less']
          },

          html: {
            files: ['web/*.html'],
            tasks: ['copy:html']
          },

          images: {
            files: ['web/images/*.*'],
            tasks: ['copy:web-images']
          }
        },

        shell: {
          webserver: {
            command: 'nodemon ./index.js',
            options: {
              async: true
            }
          },
          options: {
              stdout: true,
              stderr: true,
              failOnError: true
          }
        },

        open : {
          dev : {
            path: 'http://localhost:3030/'
          }
        }
    });


    grunt.registerTask('build', [
      'clean:dist',
      'copy',
      'browserify',
      'less']);

    grunt.registerTask('build-prod', [
      'clean:dist',
      'copy:web-images',
      'copy:ico',
      'copy:bower',
      'browserify',
      'uglify:prod',
      'htmlrefs',
      'clean:browserify',
      'less']);

    grunt.registerTask('dev', [
      'build',
      'shell:webserver',
      'open:dev',
      'watch']);

    grunt.registerTask('default', ['build']);
};