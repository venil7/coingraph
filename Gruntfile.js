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
          browserify: { /*only uglifies browserify output*/
            files: {
              'dist/scripts/app.min.js':
                [ 'dist/scripts/app.js' ]
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

        replace: {
          'prod-html': {
            options: {
              patterns: [
                {
                  match: /(src=["']{1}(.*)["']{1}\s+production-src=["']{1}(.*)["']{1})/ig,
                  replacement: "src=\"$3\"",
                  expression: true
                },
                {
                  match: /(href=["']{1}(.*)["']{1}\s+production-href=["']{1}(.*)["']{1})/ig,
                  replacement: "href=\"$3\"",
                  expression: true
                }
              ]
            },
            files: [
              { src: ['web/index.html'], dest: 'dist/index.html' }
            ]
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
              { expand: true, cwd: 'bower_components/angular/', src: ['angular.min.js'], dest: 'dist/scripts/', filter: 'isFile' },
              { expand: true, cwd: 'bower_components/d3/', src: ['d3.min.js'], dest: 'dist/scripts/', filter: 'isFile' },
              { expand: true, cwd: 'bower_components/n3-charts-line-chart/dist/', src: ['line-chart.min.js'], dest: 'dist/scripts/', filter: 'isFile' },
              { expand: true, cwd: 'bower_components/momentjs/min/', src: ['moment.min.js'], dest: 'dist/scripts/', filter: 'isFile' },
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
      'replace:prod-html',
      'copy:bower',
      'copy:ico',
      'browserify',
      'uglify:browserify',
      'clean:browserify',
      'less']);

    grunt.registerTask('dev', [
      'build',
      'shell:webserver',
      'open:dev',
      'watch']);

    grunt.registerTask('default', ['build']);
};