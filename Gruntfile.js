module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                separator: ';'
            },
            dist: {
                src: 'src/*/*.js',
                dest: '<%= pkg.tempfolder %>/js/atomic-ui.js'
            }
        },
        uglify: {
            dist: {
                files: {
                    '<%= pkg.buildfolder %>/js/atomic-ui.min.js': ['<%= pkg.tempfolder %>/js/atomic-ui.js']
                }
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
