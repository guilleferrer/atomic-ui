module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        meta: {
            all: ' angular.module("ui.atomic", ["ui.atomic.tpls" , , [<%= srcModules %>]);',
            banner: ['/*',
                ' * <%= pkg.name %>',
                ' * Version: <%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>',
                ' * License: <%= pkg.license %>',
                ' */\n'].join('\n')
        },
        concat: {
            dist: {
                src: 'src/*/*.js',
                dest: '<%= pkg.buildfolder %>/js/atomic-ui.js',
                options: {
                    banner: '<%= meta.banner %><%= meta.modules %>\n',
                    separator: ';'
                }
            },
            dist_tpls: {
                src: 'template/**/*.js',
                dest: '<%= pkg.buildfolder %>/js/atomic-ui.tpls.js',
                options: {
                    banner: '<%= meta.banner %><%= meta.modules %>\n',
                    separator: ';'
                }
            }
        },
        uglify: {
            dist: {
                files: {
                    '<%= pkg.buildfolder %>/js/atomic-ui.min.js': ['<%= pkg.buildfolder %>/js/atomic-ui.js']
                }
            }
        },
//        html2js :{
//
//        }
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
                src: ['<%= pkg.tempfolder %>']
            },
            post_clean: {
                force: true,
                src: ['<%= pkg.tempfolder %>']
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.registerTask('default', '', function () {
        return grunt.log.writeln("a task must be provided. Available tasks are: dist");
    });

    grunt.registerTask('dist', ['clean:pre_clean', 'concat:dist' , 'uglify:dist', 'clean:post_clean']);

};
