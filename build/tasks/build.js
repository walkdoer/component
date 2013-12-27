/**
 * 对源码文件进行特殊的处理
 * 连接AMD模块，取出AMD defined
 */

module.exports = function (grunt) {
    'use strict';
    var version = grunt.config('pkg.version'),
        requirejs = require('requirejs'),
        log = grunt.log,
        config = {
            baseUrl: 'src',
            name: 'com',
            out: 'dist/com.js',
            //不需要优化, 需要执行几个优化步骤
            optimize: 'none',
            //通过require加载的依赖
            findNestedDependencies: true,
            skipSemiColonInsertion: true,
            //包装代码
            wrap: {
                startFile: 'src/intro.js',
                endFile: 'src/outro.js'
            },
            rawText: {},
            //对每一个AMD模块的内容进行处理
            onBuildWrite: convert
        };
    /**
     * 去除AMD 模块的定义 define
     */
    function convert(moduleName, path, contents) {
        console.log(moduleName.green, path.red);
        return contents;
    }


    grunt.registerMultiTask(
        //Task name
        'build',
        //Task Description
        'Concatenate source, remove sub AMD definitions',
    function () {
        var name = this.data.dest,
            done = this.async();
        log.writeln('concat file to file:' + name);
        //处理编译好的文件
        config.out = function (compiled) {
            compiled = compiled
                // 打上Version
                .replace(/@VERSION/g, version)
                // 打上Date [yyyy-mm-ddThh:mmZ]
                .replace(/@DATE/g, (new Date()).toISOString().replace(/:\d+\.\d+Z$/, "Z"));
            console.log(compiled.green);
            log.writeln('file name:' + name);
            grunt.file.write(name, compiled);
        };

        requirejs.optimize(config, function (response) {
            grunt.log.ok( "File '" + name + "' created." );
            done();
        }, function (err) {
            console.log('something wrong happen');
            log.error(err);
            done(err);
        });
    });
};