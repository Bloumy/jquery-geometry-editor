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
                files: [
                    {
                        expand: true,
                        flatten: true,
                        src: ['bower_components/leaflet-draw/dist/images/*.png'],
                        dest: 'dist/images'
                    }
                ]
            }
        },

        concat: {
            options: {
                separator: ';',
            },
            dist: {
                src: ['src/**/*.js'],
                dest: 'dist/jquery-geometry-editor.js',
            },
            "bundle-js": {
                src: [
                    'bower_components/leaflet/dist/leaflet.js',
                    'bower_components/leaflet-draw/dist/leaflet.draw.js',
                    'bower_components/leaflet-omnivore/leaflet-omnivore.min.js',
                    'src/**/*.js'
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
        }
    });

    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.registerTask('default', ['jshint', 'copy', 'concat']);
};
