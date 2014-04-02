module.exports = function(grunt) {
    'use strict';
    function readOptionalJSON( filepath ) {
        var data = {};
        try {
            data = grunt.file.readJSON( filepath );
        } catch ( e ) {}
        return data;
    }
    var srcHintOptions = readOptionalJSON( 'src/.jshintrc');
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
                    'src/libs/zepto.js': 'zepto/zepto.js',
                    'src/libs/underscore.js': 'underscore/underscore.js'
                }
            },
            tests: {
                options: {
                    destPrefix: 'test/libs'
                },
                files: {
                    'qunit': 'qunit/qunit',
                    'zepto.js': 'zepto/zepto.js',
                    'underscore.js': 'underscore/underscore.js',
                    'require.js': 'requirejs/require.js'
                }
            }
        },
        watch: {
            scripts: {
                files: ['src/**/*.js'],
                tasks: ['build']
            },
            lib: {
                files: ['dist/com.js'],
                tasks: ['commander:cp2Demo']
            }
        },
        commander: {
            cp2Demo: {
                command: 'cp dist/com.js demos/applist/js/lib/'
            }
        },
        build: {
            all: {
                dest: 'dist/com.js'
            }
        },
        jshint: {
            all: {
                src: [
                    'src/**/*.js',
                    '!src/libs/**/*.js',
                    '!src/base/class.js',
                    '!src/intro.js',
                    '!src/outro.js'
                    //'Gruntfile.js',
                    //'test/**/*.js',
                    //'build/tasks/*'
                ],
                options: {
                    jshintrc: true
                }
            },
            //由于源码已经经过jshint，所以合并之后的文件则不进行检查
            //目前暂时取消
            // dist: {
            //     src: 'dist/com.js',
            //     options: srcHintOptions
            // }
        }
    });
    grunt.loadTasks('build/tasks');


    grunt.loadNpmTasks('grunt-bowercopy');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.registerTask('bower', 'bowercopy');
    grunt.registerTask('dev', ['build', 'jshint', 'watch']);
    grunt.registerTask('default', ['bower', 'build']);
};
