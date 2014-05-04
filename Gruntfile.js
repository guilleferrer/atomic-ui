var markdown = require('node-markdown').Markdown;

module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        modules: [],
        filename: 'ui-atomic',
        filenamecustom: '<%= filename %>',
        version: '0.0.1',
        ngversion: '1.2.4',
        dist: 'dist',
        meta: {
            modules: 'angular.module("ui.atomic", [<%= srcModules %>]);',
            tplmodules: 'angular.module("ui.atomic.tpls", [<%= tplModules %>]);',
            all: 'angular.module("ui.atomic", ["ui.atomic.tpls" , <%= srcModules %>]);',
            banner: ['/*',
                ' * <%= pkg.name %>',
                ' * Version: <%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>',
                ' * License: <%= pkg.license %>',
                ' */\n'].join('\n')
        },
        concat: {
            dist: {
                options: {
                    banner: '<%= meta.banner %><%= meta.modules %>\n'
                },
                src: [], //src filled in by build task
                dest: '<%= dist %>/<%= filename %>-<%= pkg.version %>.js'
            },
            dist_tpls: {
                options: {
                    banner: '<%= meta.banner %><%= meta.all %>\n<%= meta.tplmodules %>\n'
                },
                src: [], //src filled in by build task
                dest: '<%= dist %>/<%= filename %>-tpls-<%= pkg.version %>.js'
            }
        },
        uglify: {
            dist: {
                src: ['<%= concat.dist.dest %>'],
                dest: '<%= dist %>/<%= filename %>-<%= pkg.version %>.min.js'
            },
            dist_tpls: {
                src: ['<%= concat.dist_tpls.dest %>'],
                dest: '<%= dist %>/<%= filename %>-tpls-<%= pkg.version %>.min.js'
            }
        },
        html2js: {
            dist: {
                options: {
                    module: null, // no bundle module for all the html2js templates
                    base: '.'
                },
                files: [
                    {
                        expand: true,
                        src: ['template/**/*.html'],
                        ext: '.html.js'
                    }
                ]
            }
        },
        copy: {
            demohtml: {
                options: {
                    //process html files with gruntfile config
                    processContent: grunt.template.process
                },
                files: [
                    {
                        expand: true,
                        src: ['**/*.html'],
                        cwd: 'misc/demo/',
                        dest: 'dist/'
                    }
                ]
            },
            demoassets: {
                files: [
                    {
                        expand: true,
                        //Don't re-copy html files, we process those
                        src: ['**/**/*', '!**/*.html'],
                        cwd: 'misc/demo',
                        dest: 'dist/'
                    }
                ]
            }
        },
        delta: {
            docs: {
                files: ['misc/demo/index.html'],
                tasks: ['after-test']
            },
            html: {
                files: ['template/**/*.html'],
                tasks: ['html2js', 'after-test']
            },
            js: {
                files: ['src/**/*.js'],
                //we don't need to jshint here, it slows down everything else
                tasks: [ 'after-test']
            }
        },
//        cssmin: {
//            dist: {
//                cleancss: true,
//                files: {
//                    '<%= pkg.buildfolder %>/css/theme.min.css': '<%= dom_munger.data.cssRefs %>'
//                }
//            }
//        },
//        copy: {
//            assets: {
//                files: [
//                    {
//                        expand: true,
//                        src: ['web/bundles/undfatomictheme/webfonts/*'],
//                        dest: '<%= pkg.buildfolder %>/webfonts/',
//                        flatten: true
//                    },
//                    {
//                        expand: true,
//                        src: ['web/bundles/undfatomictheme/iconfonts/*'],
//                        dest: '<%= pkg.buildfolder %>/iconfonts/',
//                        flatten: true
//                    },
//                    {
//                        expand: true,
//                        src: ['web/bundles/undfatomictheme/tb-font/*'],
//                        dest: '<%= pkg.buildfolder %>/tb-font/',
//                        flatten: true
//                    },
//                    {
//                        expand: true,
//                        src: ['web/images/*'],
//                        dest: '<%= pkg.buildfolder %>/images/',
//                        flatten: true
//                    },
//                    {
//                        expand: true,
//                        cwd: 'web/',
//                        src: ['images/**'],
//                        dest: '<%= pkg.buildfolder %>/'
//                    }
//                ]
//            }
//        },
        clean: {
            pre_clean: {
                force: true,
                src: ['template/**/*.html.js']
            },
            post_clean: {
                force: true,
                src: ['template/**/*.html.js']
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-html2js');
    grunt.loadNpmTasks('grunt-contrib-watch');

    //Common ui.atomic module containing all modules for src and templates
    //findModule: Adds a given module to config
    var foundModules = {};

    function findModule(name) {
        if (foundModules[name]) {
            return;
        }
        foundModules[name] = true;

        function breakup(text, separator) {
            return text.replace(/[A-Z]/g, function (match) {
                return separator + match;
            });
        }

        function ucwords(text) {
            return text.replace(/^([a-z])|\s+([a-z])/g, function ($1) {
                return $1.toUpperCase();
            });
        }

        function enquote(str) {
            return '"' + str + '"';
        }

        var module = {
            name: name,
            moduleName: enquote('ui.atomic.' + name),
            displayName: ucwords(breakup(name, ' ')),
            srcFiles: grunt.file.expand('src/' + name + '/*.js'),
            tplFiles: grunt.file.expand('template/' + name + '/*.html'),
            tpljsFiles: grunt.file.expand('template/' + name + '/*.html.js'),
            tplModules: grunt.file.expand('template/' + name + '/*.html').map(enquote),
            dependencies: dependenciesForModule(name),
            docs: {
                md: grunt.file.expand('src/' + name + '/docs/*.md')
                    .map(grunt.file.read).map(markdown).join('\n'),
                js: grunt.file.expand('src/' + name + '/docs/*.js')
                    .map(grunt.file.read).join('\n'),
                html: grunt.file.expand('src/' + name + '/docs/*.html')
                    .map(grunt.file.read).join('\n')
            }
        };

        module.dependencies.forEach(findModule);
        grunt.config('modules', grunt.config('modules').concat(module));
    }

    function dependenciesForModule(name) {
        var deps = [];
        grunt.file.expand('src/' + name + '/*.js')
            .map(grunt.file.read)
            .forEach(function (contents) {
                //Strategy: find where module is declared,
                //and from there get everything inside the [] and split them by comma
                var moduleDeclIndex = contents.indexOf('angular.module(');
                var depArrayStart = contents.indexOf('[', moduleDeclIndex);
                var depArrayEnd = contents.indexOf(']', depArrayStart);
                var dependencies = contents.substring(depArrayStart + 1, depArrayEnd);
                dependencies.split(',').forEach(function (dep) {
                    if (dep.indexOf('ui.atomic.') > -1) {
                        var depName = dep.trim().replace('ui.atomic.', '').replace(/['"]/g, '');
                        if (deps.indexOf(depName) < 0) {
                            deps.push(depName);
                            //Get dependencies for this new dependency
                            deps = deps.concat(dependenciesForModule(depName));
                        }
                    }
                });
            });

        return deps;
    }

    grunt.registerTask('build', 'Create atomic.ui build files', function () {

        var _ = grunt.util._;

        //If arguments define what modules to build, build those. Else, everything
        if (this.args.length) {
            this.args.forEach(findModule);
            grunt.config('filename', grunt.config('filenamecustom'));
        } else {
            grunt.file.expand({
                filter: 'isDirectory', cwd: '.'
            }, 'src/*').forEach(function (dir) {
                findModule(dir.split('/')[1]);
            });
        }

        var modules = grunt.config('modules');
        grunt.config('srcModules', _.pluck(modules, 'moduleName'));
        grunt.config('tplModules', _.pluck(modules, 'tplModules').filter(function (tpls) {
            return tpls.length > 0;
        }));
        grunt.config('demoModules', modules
            .filter(function (module) {
                return module.docs.md && module.docs.js && module.docs.html;
            })
            .sort(function (a, b) {
                if (a.name < b.name) {
                    return -1;
                }
                if (a.name > b.name) {
                    return 1;
                }
                return 0;
            })
        );

        var srcFiles = _.pluck(modules, 'srcFiles');
        var tpljsFiles = _.pluck(modules, 'tpljsFiles');
        //Set the concat task to concatenate the given src modules
        grunt.config('concat.dist.src', grunt.config('concat.dist.src')
            .concat(srcFiles));
        //Set the concat-with-templates task to concat the given src & tpl modules
        grunt.config('concat.dist_tpls.src', grunt.config('concat.dist_tpls.src')
            .concat(srcFiles).concat(tpljsFiles));

        grunt.task.run(['concat', 'uglify']);
    });


    //register before and after test tasks so we've don't have to change cli
    //options on the goole's CI server
    grunt.registerTask('before-test', ['html2js']);
    grunt.registerTask('after-test', ['build:tools:full-screen', 'copy']);

    //Rename our watch task to 'delta', then make actual 'watch'
    //task build things, then start test server
    grunt.renameTask('watch', 'delta');
    grunt.registerTask('watch', ['before-test', 'after-test', 'delta']);

    // Default task.
    grunt.registerTask('default', ['before-test', 'after-test']);
};
