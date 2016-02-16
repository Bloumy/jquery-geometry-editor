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
      "images": {
        files: [{
          expand: true,
          flatten: true,
          src: ['node_modules/leaflet/dist/images/*.png'],
          dest: 'dist/images'
        }, {
          expand: true,
          flatten: true,
          src: ['node_modules/leaflet-draw/dist/images/*.png'],
          dest: 'dist/images'
        }]
      }
    },

    browserify: {
      dist: {
        files: {
          'dist/jquery-geometry-editor.js': ['src/index.js']
        }
      }
    },

    concat: {
      options: {
        //separator: ';',
      },
      "bundle-js": {
        src: [
          'node_modules/leaflet/dist/leaflet.js',
          'node_modules/leaflet-draw/dist/leaflet.draw.js',
          'node_modules/leaflet-omnivore/leaflet-omnivore.min.js',
          'dist/jquery-geometry-editor.js'
        ],
        dest: 'dist/bundle.js',
      },
      "bundle-css": {
        src: [
          'node_modules/leaflet/dist/leaflet.css',
          'node_modules/leaflet-draw/dist/leaflet.draw.css'
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
        files: ['Gruntfile.js', 'src/**/*.js'],
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
