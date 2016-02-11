module.exports = function(grunt) {
    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            files: ['Gruntfile.js', 'src/**/*.js'],
            options: {
                globals: {
                    jQuery: true
                }
            }
        },

        copy: {
            main: {
                files: [{
                    expand: true,
                    flatten: true,
                    src: ['bower_components/leaflet/dist/images/*.png'],
                    dest: 'dist/images'
                }, {
                    expand: true,
                    flatten: true,
                    src: ['bower_components/leaflet-draw/dist/images/*.png'],
                    dest: 'dist/images'
                }]
            }
        },

        browserify: {
            dist: {
                files: {
                    'dist/jquery-geometry-editor.js': ['src/**/*.js']
                }
            }
        },

        concat: {
            options: {
                //separator: ';',
            },
            "bundle-js": {
                src: [
                    'bower_components/leaflet/dist/leaflet.js',
                    'bower_components/leaflet-draw/dist/leaflet.draw.js',
                    'bower_components/leaflet-omnivore/leaflet-omnivore.min.js',
                    'dist/jquery-geometry-editor.js'
                ],
                dest: 'dist/bundle.js',
            },
            "bundle-css": {
                src: [
                    'bower_components/leaflet/dist/leaflet.css',
                    'bower_components/leaflet-draw/dist/leaflet.draw.css'
                ],
                dest: 'dist/bundle.css',
            }
        },

        uglify: {
            editor: {
                files: {
                    'dist/jquery-geometry-editor.min.js': ['dist/jquery-geometry-editor.js']
                }
            },
            bundle: {
                files: {
                    'dist/bundle.min.js': ['dist/bundle.js']
                }
            }
        },

        watch: {
            scripts: {
                files: ['src/**/*.js'],
                tasks: ['build']
            },
        }
    });

    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('build', ['jshint', 'browserify', 'concat', 'uglify', 'copy']);

    grunt.registerTask('default', ['build']);
};
