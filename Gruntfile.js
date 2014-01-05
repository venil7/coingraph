module.exports = function(grunt){

    require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        uglify: {
          options: {
            banner: '\n/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
                    '<%= grunt.template.today("yyyy-mm-dd") %> */\n'
          },
          prod: {
            files: {
              'dist/scripts/app.min.js':
                [ 'web/scripts/*.js' ]
            }
          },
        },

        replace: {
          'prod-html': {
            options: {
              patterns: [
                {
                  match: /(src=["']{1}(.*)["']{1}\s+production-src=["']{1}(.*)["']{1})/,
                  replacement: "src=\"$3\"",
                  expression: true
                },
                {
                  match: /(href=["']{1}(.*)["']{1}\s+production-href=["']{1}(.*)["']{1})/,
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
          }
        },

        copy: {
          'web-images': {
            files: [ {  expand: true, cwd: 'web/', src: ['images/*'], dest: 'dist/', filter: 'isFile' } ]
          },
          html: {
            files: [ { expand: true, cwd: 'web/', src: ['*.html'], dest: 'dist/', filter: 'isFile' } ]
          },
          bower: {
            files: [
              { expand: true, cwd: 'bower_components/bootstrap/dist/css/', src: ['bootstrap.min.css'], dest: 'dist/styles/', filter: 'isFile' },
              { expand: true, cwd: 'bower_components/angular/', src: ['angular.min.js'], dest: 'dist/scripts/', filter: 'isFile' },
              { expand: true, cwd: 'bower_components/angles/libs/', src: ['angles.js'], dest: 'dist/scripts/', filter: 'isFile' },
              { src: 'bower_components/Chart.js/Chart.min.js', dest: 'dist/scripts/chart.min.js' },
            ]
          }

        },

        clean: {
          dist: {
            src: ["dist/"]
          }
        },

        watch: {
          js: {
            files: ['web/scripts/*.js'],
            tasks: ['prod-js']
          },

          less: {
            files: ['web/style/*.less'],
            tasks: ['prod-css']
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
        }
    });

    grunt.registerTask('prod-js', ['uglify:prod']);
    grunt.registerTask('prod-css', ['less:prod']);
    grunt.registerTask('build', [
      'clean:dist',
      'copy:web-images',
      'copy:html',
      'copy:bower',
      'prod-js',
      'prod-css']);
    grunt.registerTask('build-prod', [
      'clean:dist',
      'copy:web-images',
      'replace:prod-html',
      'copy:bower',
      'prod-js',
      'prod-css']);

    grunt.registerTask('dev', [
      'build',
      'shell:webserver',
      'watch']);

    grunt.registerTask('default', ['build']);
};