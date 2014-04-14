/**
 *
 */

'use strict';

module.exports = function(grunt){

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        war: {
            target: {
                options: {
                    war_dist_folder: 'target',
                    war_verbose: true,
                    war_name: 'cesium-test',
                    webxml_welcome: 'index.html',
                    webxml_display_name: 'Cesium Test'
                },
                files: [
                    {
                        expand: true,
                        src: ['src/**']
                    }
                ]
            }
        }
    });

    grunt.loadNpmTasks('grunt-war');
    grunt.registerTask('default', ['war']);
};
