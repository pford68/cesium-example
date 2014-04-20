/**
 *
 */

'use strict';

module.exports = function(grunt){

    var server = require("./server.js");

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        server: {
            port: 9000
        },
        watch: {
            scripts: {
                files: ['**/*.js', '**/*.json', '!**/node_modules/**']
            },
            css: {
                files: ['**/*.scss'],
                task: ['sass']
            },
            html: {
                files: ['**/*.html']
            },
            options: {
                livereload: true
            }
        },
        sass: {
            dist: {
                files: {
                    'src/css/main.css' : 'src/sass/main.scss'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.registerTask('server', 'Starts the development server.', function() {
        server.start(grunt.config("server.port"));
    });
    grunt.registerTask('default', ['server', 'sass', 'watch'])
};