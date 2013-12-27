module.exports = function(grunt) {
    'use strict';
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                // define a string to put between each file in the concatenated output
                separator: ';'
            },
            dist: {
                // the files to concatenate
                src: ['src/base/*.js'],
                // the location of the resulting JS file
                dest: 'dist/<%= pkg.name %>.js'
            }
        },
        bowercopy: {
            options: {
                clean: true
            },
            src: {
                // Keys are destinations (prefixed with `options.destPrefix`)
                // Values are sources (prefixed with `options.srcPrefix`); One source per destination
                // e.g. 'bower_components/chai/lib/chai.js' will be copied to 'test/js/libs/chai.js'
                files: {
                    "src/libs/zepto.js": "zepto/zepto.js",
                    "src/libs/underscore.js": "underscore/underscore.js"
                }
            },
            tests: {
                options: {
                    destPrefix: "test/libs"
                },
                files: {
                    "qunit": "qunit/qunit"
                }
            }
        },
        build: {
            all: {
                dest: 'dist/com.js'
            }
        }
    });
    grunt.loadTasks('build/tasks');


    grunt.loadNpmTasks('grunt-bowercopy');
    grunt.registerTask('bower', 'bowercopy');

    grunt.registerTask('default', ['bower', 'build']);
};