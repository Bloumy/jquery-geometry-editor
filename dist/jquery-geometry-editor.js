(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var polygon = require('turf-polygon');

/**
 * Takes a bbox and returns an equivalent {@link Polygon|polygon}.
 *
 * @module turf/bbox-polygon
 * @category measurement
 * @param {Array<number>} bbox an Array of bounding box coordinates in the form: ```[xLow, yLow, xHigh, yHigh]```
 * @return {Feature<Polygon>} a Polygon representation of the bounding box
 * @example
 * var bbox = [0, 0, 10, 10];
 *
 * var poly = turf.bboxPolygon(bbox);
 *
 * //=poly
 */

module.exports = function(bbox) {
  var lowLeft = [bbox[0], bbox[1]];
  var topLeft = [bbox[0], bbox[3]];
  var topRight = [bbox[2], bbox[3]];
  var lowRight = [bbox[2], bbox[1]];

  var poly = polygon([[
    lowLeft,
    lowRight,
    topRight,
    topLeft,
    lowLeft
  ]]);
  return poly;
};

},{"turf-polygon":4}],2:[function(require,module,exports){
var each = require('turf-meta').coordEach;

/**
 * Takes any {@link GeoJSON} object, calculates the extent of all input features, and returns a bounding box.
 *
 * @module turf/extent
 * @category measurement
 * @param {GeoJSON} input any valid GeoJSON Object
 * @return {Array<number>} the bounding box of `input` given
 * as an array in WSEN order (west, south, east, north)
 * @example
 * var input = {
 *   "type": "FeatureCollection",
 *   "features": [
 *     {
 *       "type": "Feature",
 *       "properties": {},
 *       "geometry": {
 *         "type": "Point",
 *         "coordinates": [114.175329, 22.2524]
 *       }
 *     }, {
 *       "type": "Feature",
 *       "properties": {},
 *       "geometry": {
 *         "type": "Point",
 *         "coordinates": [114.170007, 22.267969]
 *       }
 *     }, {
 *       "type": "Feature",
 *       "properties": {},
 *       "geometry": {
 *         "type": "Point",
 *         "coordinates": [114.200649, 22.274641]
 *       }
 *     }, {
 *       "type": "Feature",
 *       "properties": {},
 *       "geometry": {
 *         "type": "Point",
 *         "coordinates": [114.186744, 22.265745]
 *       }
 *     }
 *   ]
 * };
 *
 * var bbox = turf.extent(input);
 *
 * var bboxPolygon = turf.bboxPolygon(bbox);
 *
 * var resultFeatures = input.features.concat(bboxPolygon);
 * var result = {
 *   "type": "FeatureCollection",
 *   "features": resultFeatures
 * };
 *
 * //=result
 */
module.exports = function(layer) {
    var extent = [Infinity, Infinity, -Infinity, -Infinity];
    each(layer, function(coord) {
      if (extent[0] > coord[0]) extent[0] = coord[0];
      if (extent[1] > coord[1]) extent[1] = coord[1];
      if (extent[2] < coord[0]) extent[2] = coord[0];
      if (extent[3] < coord[1]) extent[3] = coord[1];
    });
    return extent;
};

},{"turf-meta":3}],3:[function(require,module,exports){
/**
 * Lazily iterate over coordinates in any GeoJSON object, similar to
 * Array.forEach.
 *
 * @param {Object} layer any GeoJSON object
 * @param {Function} callback a method that takes (value)
 * @param {boolean=} excludeWrapCoord whether or not to include
 * the final coordinate of LinearRings that wraps the ring in its iteration.
 * @example
 * var point = { type: 'Point', coordinates: [0, 0] };
 * coordEach(point, function(coords) {
 *   // coords is equal to [0, 0]
 * });
 */
function coordEach(layer, callback, excludeWrapCoord) {
  var i, j, k, g, geometry, stopG, coords,
    geometryMaybeCollection,
    wrapShrink = 0,
    isGeometryCollection,
    isFeatureCollection = layer.type === 'FeatureCollection',
    isFeature = layer.type === 'Feature',
    stop = isFeatureCollection ? layer.features.length : 1;

  // This logic may look a little weird. The reason why it is that way
  // is because it's trying to be fast. GeoJSON supports multiple kinds
  // of objects at its root: FeatureCollection, Features, Geometries.
  // This function has the responsibility of handling all of them, and that
  // means that some of the `for` loops you see below actually just don't apply
  // to certain inputs. For instance, if you give this just a
  // Point geometry, then both loops are short-circuited and all we do
  // is gradually rename the input until it's called 'geometry'.
  //
  // This also aims to allocate as few resources as possible: just a
  // few numbers and booleans, rather than any temporary arrays as would
  // be required with the normalization approach.
  for (i = 0; i < stop; i++) {

    geometryMaybeCollection = (isFeatureCollection ? layer.features[i].geometry :
        (isFeature ? layer.geometry : layer));
    isGeometryCollection = geometryMaybeCollection.type === 'GeometryCollection';
    stopG = isGeometryCollection ? geometryMaybeCollection.geometries.length : 1;

    for (g = 0; g < stopG; g++) {

      geometry = isGeometryCollection ?
          geometryMaybeCollection.geometries[g] : geometryMaybeCollection;
      coords = geometry.coordinates;

      wrapShrink = (excludeWrapCoord &&
        (geometry.type === 'Polygon' || geometry.type === 'MultiPolygon')) ?
        1 : 0;

      if (geometry.type === 'Point') {
        callback(coords);
      } else if (geometry.type === 'LineString' || geometry.type === 'MultiPoint') {
        for (j = 0; j < coords.length; j++) callback(coords[j]);
      } else if (geometry.type === 'Polygon' || geometry.type === 'MultiLineString') {
        for (j = 0; j < coords.length; j++)
          for (k = 0; k < coords[j].length - wrapShrink; k++)
            callback(coords[j][k]);
      } else if (geometry.type === 'MultiPolygon') {
        for (j = 0; j < coords.length; j++)
          for (k = 0; k < coords[j].length; k++)
            for (l = 0; l < coords[j][k].length - wrapShrink; l++)
              callback(coords[j][k][l]);
      } else {
        throw new Error('Unknown Geometry Type');
      }
    }
  }
}
module.exports.coordEach = coordEach;

/**
 * Lazily reduce coordinates in any GeoJSON object into a single value,
 * similar to how Array.reduce works. However, in this case we lazily run
 * the reduction, so an array of all coordinates is unnecessary.
 *
 * @param {Object} layer any GeoJSON object
 * @param {Function} callback a method that takes (memo, value) and returns
 * a new memo
 * @param {boolean=} excludeWrapCoord whether or not to include
 * the final coordinate of LinearRings that wraps the ring in its iteration.
 * @param {*} memo the starting value of memo: can be any type.
 */
function coordReduce(layer, callback, memo, excludeWrapCoord) {
  coordEach(layer, function(coord) {
    memo = callback(memo, coord);
  }, excludeWrapCoord);
  return memo;
}
module.exports.coordReduce = coordReduce;

/**
 * Lazily iterate over property objects in any GeoJSON object, similar to
 * Array.forEach.
 *
 * @param {Object} layer any GeoJSON object
 * @param {Function} callback a method that takes (value)
 * @example
 * var point = { type: 'Feature', geometry: null, properties: { foo: 1 } };
 * propEach(point, function(props) {
 *   // props is equal to { foo: 1}
 * });
 */
function propEach(layer, callback) {
  var i;
  switch (layer.type) {
      case 'FeatureCollection':
        features = layer.features;
        for (i = 0; i < layer.features.length; i++) {
            callback(layer.features[i].properties);
        }
        break;
      case 'Feature':
        callback(layer.properties);
        break;
  }
}
module.exports.propEach = propEach;

/**
 * Lazily reduce properties in any GeoJSON object into a single value,
 * similar to how Array.reduce works. However, in this case we lazily run
 * the reduction, so an array of all properties is unnecessary.
 *
 * @param {Object} layer any GeoJSON object
 * @param {Function} callback a method that takes (memo, coord) and returns
 * a new memo
 * @param {*} memo the starting value of memo: can be any type.
 */
function propReduce(layer, callback, memo) {
  propEach(layer, function(prop) {
    memo = callback(memo, prop);
  });
  return memo;
}
module.exports.propReduce = propReduce;

},{}],4:[function(require,module,exports){
/**
 * Takes an array of LinearRings and optionally an {@link Object} with properties and returns a GeoJSON {@link Polygon} feature.
 *
 * @module turf/polygon
 * @category helper
 * @param {Array<Array<Number>>} rings an array of LinearRings
 * @param {Object} properties an optional properties object
 * @return {Polygon} a Polygon feature
 * @throws {Error} throw an error if a LinearRing of the polygon has too few positions
 * or if a LinearRing of the Polygon does not have matching Positions at the
 * beginning & end.
 * @example
 * var polygon = turf.polygon([[
 *  [-2.275543, 53.464547],
 *  [-2.275543, 53.489271],
 *  [-2.215118, 53.489271],
 *  [-2.215118, 53.464547],
 *  [-2.275543, 53.464547]
 * ]], { name: 'poly1', population: 400});
 *
 * //=polygon
 */
module.exports = function(coordinates, properties){

  if (coordinates === null) throw new Error('No coordinates passed');

  for (var i = 0; i < coordinates.length; i++) {
    var ring = coordinates[i];
    for (var j = 0; j < ring[ring.length - 1].length; j++) {
      if (ring.length < 4) {
        throw new Error('Each LinearRing of a Polygon must have 4 or more Positions.');
      }
      if (ring[ring.length - 1][j] !== ring[0][j]) {
        throw new Error('First and last Position are not equivalent.');
      }
    }
  }

  var polygon = {
    "type": "Feature",
    "geometry": {
      "type": "Polygon",
      "coordinates": coordinates
    },
    "properties": properties
  };

  if (!polygon.properties) {
    polygon.properties = {};
  }

  return polygon;
};

},{}],5:[function(require,module,exports){
var bboxPolygon = require('turf-bbox-polygon');


var defaultParams = require('./defaultParams.js');
var geometryToSimpleGeometries = require('./util/geometryToSimpleGeometries');
var isSingleGeometryType = require('./util/isSingleGeometryType.js');

var Backend = require('./backend/Backend');

/**
 * GeometryEditor constructor from a dataElement containing a serialized geometry
 * @param {Object} dataElement
 * @param {Object} options
 */
var GeometryEditor = function (dataElement, options) {

    this.dataElement = dataElement;
    this.settings = {};
    $.extend(true, this.settings, defaultParams, options); // deep copy

    this.backend = new Backend({techno: this.settings.techno});

    // init map
    this.map = this.initMap();
    this.settings.varMapExport = this.map;
    

    // init features
    this.initDrawLayer();

    // draw controls
    if (this.settings.editable) {
        this.initDrawControls();
    }

    // hide data
    if (this.settings.hide) {
        this.dataElement.hide();
    }

    // update data when element change
    this.dataElement.on('change', function () {
        this.updateDrawLayer();
    }.bind(this));
};


/**
 * Init leaflet map
 *
 * @return L.Map
 */
GeometryEditor.prototype.initMap = function () {
    return this.backend.initMap({
        width: this.settings.width,
        height: this.settings.height,
        dataElement: this.dataElement,
        layers: this.settings.tileLayers,
        lon: this.settings.lon,
        lat: this.settings.lat,
        zoom: this.settings.zoom,
        maxZoom: this.settings.maxZoom,
        minZoom: this.settings.minZoom,
    });
};

/**
 * Indicates if data element is an input field (<input>, <textarea>, etc.)
 * @private
 */
GeometryEditor.prototype.isDataElementAnInput = function () {
    return typeof this.dataElement.val !== 'undefined';
};

/**
 * Get raw data from the dataElement
 * @returns {String}
 */
GeometryEditor.prototype.getRawData = function () {
    if (this.isDataElementAnInput()) {
        return $.trim(this.dataElement.val());
    } else {
        return $.trim(this.dataElement.html());
    }
};

/**
 * Set raw data to the dataElement
 * @param {String} value
 */
GeometryEditor.prototype.setRawData = function (value) {
    var currentData = this.getRawData();
    if (currentData === value) {
        return;
    }
    if (this.isDataElementAnInput()) {
        this.dataElement.val(value);
    } else {
        this.dataElement.html(value);
    }
    this.dataElement.trigger('change');
};

/**
 * Set the geometry
 * @param {Array|Object} geometry either a GeoJSON geometry or a bounding box
 */
GeometryEditor.prototype.setGeometry = function (geometry) {

    // hack to accept bbox
    if (geometry instanceof Array && geometry.length === 4) {
        geometry = bboxPolygon(geometry).geometry;
    }

    this.backend.removeFeatures(this.featuresCollection);

    var geometries = geometryToSimpleGeometries(geometry);

    this.backend.setGeometries(this.featuresCollection, geometries);

    if (geometries.length !== 0) {
        this.backend.fitBoundsToMap(this.map, this.featuresCollection);
    }

    this.serializeGeometry();
};



/**
 * Init map from dataElement data
 */
GeometryEditor.prototype.initDrawLayer = function () {
    this.featuresCollection = this.backend.createFeaturesCollection(this.map);
    this.updateDrawLayer();
    this.dataElement.on('change', this.updateDrawLayer.bind(this));
};

/**
 * Update draw layer from data
 */
GeometryEditor.prototype.updateDrawLayer = function () {
    var data = this.getRawData();
    var geometry;
    if (data !== '') {
        try {
            geometry = JSON.parse(data);
        } catch (err) {
            this.backend.removeFeatures(this.featuresCollection);
            return;
        }
        this.setGeometry(geometry);
    }
};

/**
 * Get output geometry type
 * @returns {String}
 */
GeometryEditor.prototype.getGeometryType = function () {
    return this.settings.geometryType;
};

/**
 * Indicates if geometryType is allowed by restriction
 * @param {type} geometryType
 * @returns {Boolean}
 */
GeometryEditor.prototype.canEdit = function (geometryType) {
    if (geometryType === "Rectangle") {
        if (this.getGeometryType().indexOf("Polygon") !== -1) {
            return true;
        }
    }

    if (this.getGeometryType() === "Geometry") {
        return true;
    }
    if (this.getGeometryType() === "GeometryCollection") {
        return true;
    }
    if (this.getGeometryType().indexOf(geometryType) !== -1) {
        return true;
    }
    return false;
};



/**
 * Init draw controls
 * @see https://github.com/Leaflet/Leaflet.draw#disabling-a-toolbar-item
 * 
 * @private
 */
GeometryEditor.prototype.initDrawControls = function () {

    var drawOptions = {
        geometryType: this.getGeometryType(),
        features: this.featuresCollection
    };

    this.backend.addDrawControlToMap(this.map, drawOptions);


    var events = {
        onDrawCreated: function (e) {
            if (isSingleGeometryType(this.getGeometryType())) {
                this.backend.removeFeatures(this.featuresCollection);
            }
            this.backend.addFeaturesToLayer(this.featuresCollection, e.layer);
            this.serializeGeometry();
        }.bind(this),
        onDrawModified: function (e) {
            this.serializeGeometry();
        }.bind(this),
        onDrawDeleted: function (e) {
            this.serializeGeometry();
        }.bind(this)
    };

    this.backend.addDrawEventsToMap(this.map, events);
};


/**
 * Serialize geometry to dataElement
 * 
 * @private
 */
GeometryEditor.prototype.serializeGeometry = function () {
    var geometryGeoJson = this.backend.getGeoJsonGeometry(this.featuresCollection, this.getGeometryType());
    
    this.setRawData(geometryGeoJson);
};


module.exports = GeometryEditor;

},{"./backend/Backend":6,"./defaultParams.js":9,"./util/geometryToSimpleGeometries":12,"./util/isSingleGeometryType.js":14,"turf-bbox-polygon":1}],6:[function(require,module,exports){
var guid = require('../util/guid');

var Leaflet = require('./Leaflet');
var Openlayers = require('./OpenLayers');


/**
 * Geometry editor backend 
 * Class doing link between GeometryEditor and
 * map technology to use for (default : Leaflet)
 * 
 * Technologies possible : 
 * - Leaflet
 * - Openlayers
 * 
 * @param {Object} options
 */
var Backend = function (options) {

    options = options || {
        techno: 'Leaflet'
    };

    switch (options.techno) {
        case 'Leaflet':
            this.techno = new Leaflet();
            break;
        case 'Openlayers':
            this.techno = new Openlayers();
            break;
    }
};


/**
 * Initialise a map
 * @param {Object} options - options are :
 * 
 * @param {string|int} options.height - map height
 * @param {string|int} options.width - map width
 * @param {float} options.lat - latitude at start for map center
 * @param {float} options.lon - longitude at start for map center
 * @param {float} options.zoom - map zoom
 * 
 * @param {Object[]} options.layers - array of layer configurations 
 * @param {string} options.layers[].url - url
 * @param {string} options.layers[].attribution - attribution
 *
 * @return {L.Map|ol.Map} - map
 */
Backend.prototype.initMap = function (options) {
    // create map div
    var mapId = 'map-' + guid();
    var $mapDiv = $('<div id="' + mapId + '"></div>');
    $mapDiv.addClass('map');
    $mapDiv.css('width', options.width);
    $mapDiv.css('height', options.height);
    $mapDiv.insertAfter(options.dataElement);

    // create leaflet map
    var map = this.techno.createMap(mapId, options);

    this.techno.addLayersToMap(map, options.layers);

    return map;
};

/**
 * Add controls to map
 * @param {L.Map|ol.Map} map
 * @param {L.control|ol.Control} control
 */
Backend.prototype.addControlToMap = function (map, control) {
    this.techno.addControlToMap(map, control);
};

/**
 * Set geometries
 * @param {L.featureGroup|ol.featureCollection???} featuresCollection
 * @param {Geometry[]} geometries - simple geometries
 */
Backend.prototype.setGeometries = function (featuresCollection, geometries) {
    this.techno.setGeometries(featuresCollection, geometries);
};

/**
 * Fit bounds to map
 * @param {L.Map|ol.Map}  map
 * @param {L.featureGroup|ol.featureCollection} featuresCollection
 */
Backend.prototype.fitBoundsToMap = function (map, featuresCollection) {
    this.techno.fitBoundsToMap(map, featuresCollection);
};

/**
 * Create a collection of features
 * @param {L.map|ol.Map} map
 * 
 * @return {L.featureGroup|ol.featureCollection} 
 */
Backend.prototype.createFeaturesCollection = function (map) {
    return this.techno.createFeaturesCollection(map);
};

Backend.prototype.addFeaturesToLayer = function (features, layer) {
    this.techno.addFeaturesToLayer(features, layer);
};

Backend.prototype.removeFeatures = function (features) {
    this.techno.removeFeatures(features);
};


Backend.prototype.addDrawControlToMap = function (map, drawOptions) {
    this.techno.addDrawControlToMap(map, drawOptions);
};

/**
 * addDrawEventsToMap
 * @param {L.map|ol.Map} map
 * @param {Object} events
 */
Backend.prototype.addDrawEventsToMap = function (map, events) {
    this.techno.addDrawEventsToMap(map, events);
};

Backend.prototype.getGeoJsonGeometry = function (featuresCollection, geometryType) {
    return this.techno.getGeoJsonGeometry(featuresCollection, geometryType);
};


module.exports = Backend;

},{"../util/guid":13,"./Leaflet":7,"./OpenLayers":8}],7:[function(require,module,exports){
(function (global){
var L = (typeof window !== "undefined" ? window['L'] : typeof global !== "undefined" ? global['L'] : null);
var DrawControl = (typeof window !== "undefined" ? window['L']['Control']['Draw'] : typeof global !== "undefined" ? global['L']['Control']['Draw'] : null);
var featureCollectionToGeometry = require('./../util/featureCollectionToGeometry.js');
var extent = require('turf-extent');


/**
 * Leaflet constructor from a dataElement containing a serialized geometry
 * @param {Object} options
 */
var Leaflet = function (options) {
    this.settings = {};
    $.extend(this.settings, options); // deep copy
};


/**
 * Create leaflet map
 * @param {string} mapId - div map identifier
 * 
 * @return L.Map
 */
Leaflet.prototype.createMap = function (mapId, options) {
    options = options || {};
    var map = L.map(mapId).setView(
            [options.lat, options.lon],
            options.zoom
            );
    return map;
};

/**
 * Add layers to Leaflet map
 * @param {L.Map} map - map leaflet
 * @param {Object[]} layers - array of layer configurations 
 * @param {string} layers[].url - url
 * @param {string} layers[].attribution - attribution
 * @param {Object} options - Options. Default : maxZoom = 18 
 * 
 */
Leaflet.prototype.addLayersToMap = function (map, layers, options) {

    options = options || {};

    // init layers
    for (var i in layers) {
        var layer = layers[i];
        L.tileLayer(layer.url, {
            attribution: layer.attribution,
            maxZoom: options.maxZoom || 18
        }).addTo(map);
    }
};

Leaflet.prototype.addControlToMap = function (map, control) {
    map.addControl(control);
};


Leaflet.prototype.setGeometries = function (featuresCollection, geometries) {
    L.geoJson(geometries, {
        onEachFeature: function (feature, layer) {
            featuresCollection.addLayer(layer);
        }
    });
};

Leaflet.prototype.fitBoundsToMap = function (map, featuresCollection) {
    map.fitBounds(featuresCollection.getBounds());
};

Leaflet.prototype.createFeaturesCollection = function (map) {
    return L.featureGroup().addTo(map);
};

Leaflet.prototype.removeFeatures = function (featuresCollection) {
    featuresCollection.clearLayers();
};

Leaflet.prototype.addFeaturesToLayer = function (featuresCollection, layer) {
    featuresCollection.addLayer(layer);
};

Leaflet.prototype.addDrawControlToMap = function (map, drawOptions) {

    var drawControlOptions = {
        draw: {
            position: 'topleft',
            marker: this.canEdit(drawOptions.geometryType, "Point"),
            polyline: this.canEdit(drawOptions.geometryType, "LineString"),
            polygon: this.canEdit(drawOptions.geometryType, "Polygon"),
            rectangle: this.canEdit(drawOptions.geometryType, "Rectangle"),
            circle: false
        },
        edit: {
            featureGroup: drawOptions.features
        }
    };

    var drawControl = new DrawControl(drawControlOptions);
    map.addControl(drawControl);
};


Leaflet.prototype.addDrawEventsToMap = function (map, events) {
    map.on('draw:created', events.onDrawCreated);
    map.on('draw:edited', events.onDrawModified);
    map.on('draw:deleted', events.onDrawDeleted);

};

/**
 * Indicates if geometryType is allowed by restriction
 * @param {string} geometryTypeToCompare
 * @param {string} geometryType
 * 
 * @returns {Boolean}
 * @private
 */
Leaflet.prototype.canEdit = function (geometryTypeToCompare, geometryType) {
    if (geometryType === "Rectangle") {
        if (geometryTypeToCompare.indexOf("Polygon") !== -1) {
            return true;
        }
    }

    if (geometryTypeToCompare === "Geometry") {
        return true;
    }
    if (geometryTypeToCompare === "GeometryCollection") {
        return true;
    }
    if (geometryTypeToCompare.indexOf(geometryType) !== -1) {
        return true;
    }
    return false;
};

Leaflet.prototype.getGeoJsonGeometry = function (featuresCollection, geometryType) {
    var geometry = featureCollectionToGeometry(featuresCollection.toGeoJSON());
    if (geometry) {
        if (geometryType === 'Rectangle') {
            return JSON.stringify(extent(geometry));
        } else {
            return JSON.stringify(geometry);
        }
    } else {
        return '';
    }

};


module.exports = Leaflet;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./../util/featureCollectionToGeometry.js":10,"turf-extent":2}],8:[function(require,module,exports){
(function (global){
var ol = (typeof window !== "undefined" ? window['ol'] : typeof global !== "undefined" ? global['ol'] : null);
var DrawControl = require('../util/openlayers/DrawControl');

/**
 * Openlayers constructor from a dataElement containing a serialized geometry
 * @param {Object} options
 */
var Openlayers = function (options) {
    
    this.settings = {
        dataProjection: "EPSG:4326",
        mapProjection: "EPSG:3857"
    };
    
    $.extend(this.settings, options); // deep copy
};


/**
 * Create leaflet map
 * @param {string} mapId - div map identifier
 * 
 * @return L.Map
 */
Openlayers.prototype.createMap = function (mapId, options) {
    options = options || {};

    var map = new ol.Map({
        target: mapId,
        view: new ol.View({
            center: ol.proj.transform([options.lon, options.lat], this.settings.dataProjection, this.settings.mapProjection),
            zoom: options.zoom,
            minZoom: options.minZoom,
            maxZoom: options.maxZoom,
            projection: this.settings.mapProjection
        }),
        controls: []
    });

    return map;
};

/**
 * Add layers to Openlayers map
 * @param {L.Map} map - map leaflet
 * @param {Object[]} layers - array of layer configurations 
 * @param {string} layers[].url - url
 * @param {string} layers[].attribution - attribution
 * @param {Object} options - Options. Default : maxZoom = 18 
 * 
 * @return L.Map
 */
Openlayers.prototype.addLayersToMap = function (map, layers, options) {

    options = options || {};

    // init layers
    for (var i in layers) {

        map.addLayer(new ol.layer.Tile({
            source: new ol.source.XYZ({
                attributions: [layers[i].attribution],
                url: layers[i].url,
                crossOrigin: "Anonymous"
            })
        }));

    }

};

Openlayers.prototype.addControlToMap = function (map, control) {
    map.addControl(control);
};


Openlayers.prototype.setGeometries = function (featuresCollection, geometries) {
    for (var i in geometries) {
        var geom;

        switch (geometries[i].type) {
            case "Point":
                geom = new ol.geom.Point(geometries[i].coordinates);
                break;
            case "LineString":
                geom = new ol.geom.LineString(geometries[i].coordinates);
                break;
            case "Polygon":
                geom = new ol.geom.Polygon(geometries[i].coordinates);
                break;
        }


        var feature = new ol.Feature({
            geometry: geom.transform(this.settings.dataProjection, this.settings.mapProjection)
        });

        featuresCollection.push(feature);
    }
};

Openlayers.prototype.fitBoundsToMap = function (map, featuresCollection) {
    map.getView().fit(featuresCollection.getArray()[0].getGeometry(), map.getSize());
};

Openlayers.prototype.createFeaturesCollection = function (map) {
    var featuresCollection = new ol.Collection();

    map.addLayer(new ol.layer.Vector({
        source: new ol.source.Vector({
            features: featuresCollection
        })
    }));

    return featuresCollection;
};

Openlayers.prototype.removeFeatures = function (featuresCollection) {
    featuresCollection.clear();
};

Openlayers.prototype.addFeaturesToLayer = function (featuresCollection, layer) {
    layer.addFeatures(featuresCollection);
};

Openlayers.prototype.addDrawControlToMap = function (map, drawOptions) {

    var drawControlOptions = {
//        draw: {
//            position: 'topleft',
//            marker: this.canEdit(drawOptions.geometryType, "Point"),
//            polyline: this.canEdit(drawOptions.geometryType, "LineString"),
//            polygon: this.canEdit(drawOptions.geometryType, "Polygon"),
//            rectangle: this.canEdit(drawOptions.geometryType, "Rectangle"),
//            circle: false
//        },
//        edit: {
//            featureGroup: drawOptions.features
//        }
    };

    var drawControl = new DrawControl(drawControlOptions);
    map.addControl(drawControl);
};


Openlayers.prototype.addDrawEventsToMap = function (map, events) {
    map.on('draw:created', events.onDrawCreated);
    map.on('draw:edited', events.onDrawModified);
    map.on('draw:deleted', events.onDrawDeleted);

};




Openlayers.prototype.getGeoJsonGeometry = function (featuresCollection, geometryType) {
    var geom = featuresCollection.getArray()[0].getGeometry().clone();
    return new ol.format.GeoJSON().writeGeometry(geom.transform(this.settings.mapProjection, this.settings.dataProjection));
};


module.exports = Openlayers;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../util/openlayers/DrawControl":15}],9:[function(require,module,exports){

/**
 * Default GeometryEditor parameters
 */
var defaultParams = {
    techno: "Leaflet", 
    tileLayers: [
       {
           url: "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
           attribution: 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
       }
    ],
    /*
     * display or hide corresponding form item
     */
    hide: true,
    editable: true,
    width: '100%',
    height: '500',
    lon: 2.0,
    lat: 45.0,
    zoom: 4,
    maxZoom: 18,
    geometryType: 'Geometry'
} ;

module.exports = defaultParams ;

},{}],10:[function(require,module,exports){

var geometriesToCollection = require('./geometriesToCollection.js') ;

/**
 * Converts FeatureCollection to a normalized geometry
 */
var featureCollectionToGeometry = function(featureCollection){
    var geometries = [] ;
    featureCollection.features.forEach(function(feature){
        geometries.push( feature.geometry ) ;
    });

    if ( geometries.length === 0 ){
        return null ;
    }

    if ( geometries.length == 1 ){
        return geometries[0];
    }else{
        return geometriesToCollection(geometries) ;
    }
} ;

module.exports = featureCollectionToGeometry ;

},{"./geometriesToCollection.js":11}],11:[function(require,module,exports){

/**
 * Converts an array of geometries to a collection (MultiPoint, MultiLineString,
 * MultiPolygon, GeometryCollection).
 */
var geometriesToCollection = function(geometries){
    // count by geometry type
    var counts = {};
    geometries.forEach(function(geometry){
        if ( typeof counts[geometry.type] === 'undefined' ){
            counts[geometry.type] = 1 ;
        }else{
            counts[geometry.type]++ ;
        }
    }) ;

    var geometryTypes = Object.keys(counts) ;
    if ( geometryTypes.length > 1 ){
        return {
            "type": "GeometryCollection",
            "geometries": geometries
        } ;
    }else{
        var multiType = "Multi"+Object.keys(counts)[0] ;
        var coordinates = [];
        geometries.forEach(function(geometry){
            coordinates.push(geometry.coordinates);
        }) ;
        return {
            "type": multiType,
            "coordinates": coordinates
        } ;
    }
} ;

module.exports = geometriesToCollection ;

},{}],12:[function(require,module,exports){

/**
 * Converts a multi-geometry to an array of geometries
 * @param {MultiPoint|MultiPolygon|MultiLineString} multi-geometry
 * @returns {Geometry[]} simple geometries
 */
var multiToGeometries = function(multiGeometry){
    var geometries = [] ;

    var simpleType = multiGeometry.type.substring("Multi".length) ;
    multiGeometry.coordinates.forEach(function(subCoordinates){
        geometries.push(
            {
                "type": simpleType,
                "coordinates": subCoordinates
            }
        );
    });

    return geometries ;
} ;

/**
 * Converts a geometry collection to an array of geometries
 * @param {GeometryCollection} geometry collection
 * @returns {Geometry[]} simple geometries
 */
var geometryCollectionToGeometries = function(geometryCollection){
    var geometries = [] ;
    geometryCollection.geometries.forEach(function(geometry){
        geometries.push(geometry);
    });
    return geometries ;
} ;


/**
 *
 * Converts a geometry to an array of single geometries. For
 * example, MultiPoint is converted to Point[].
 *
 * @param {Geometry} geometry
 * @returns {Geometry[]} simple geometries
 */
var geometryToSimpleGeometries = function(geometry){
    switch (geometry.type){
    case "Point":
    case "LineString":
    case "Polygon":
        return [geometry];
    case "MultiPoint":
    case "MultiLineString":
    case "MultiPolygon":
        return multiToGeometries(geometry);
    case "GeometryCollection":
        return geometryCollectionToGeometries(geometry);
    default:
        throw "unsupported geometry type : "+geometry.type;
    }
} ;

module.exports = geometryToSimpleGeometries ;

},{}],13:[function(require,module,exports){

/**
 * Generates uuidv4
 * @return {String} the generated uuid
 */
var guid = function() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
} ;

module.exports = guid ;

},{}],14:[function(require,module,exports){

/**
 * Indicates if the given type corresponds to a mutli geometry
 * @param {String} geometryType tested geometry type
 */
var isSingleGeometryType = function(geometryType) {
    return ["Point","LineString","Polygon","Rectangle"].indexOf(geometryType) !== -1 ;
};

module.exports = isSingleGeometryType ;

},{}],15:[function(require,module,exports){
(function (global){
var ol = (typeof window !== "undefined" ? window['ol'] : typeof global !== "undefined" ? global['ol'] : null);


/**
 * Contrôle de création d'une feature de type
 *
 * @constructor
 * @extends {ol.control.Control}
 * 
 * @param {object} options
 * @param {String} options.type le type d'élément dessiné ('Text', 'Point', 'LineString' ou 'Polygon')
 * 
 * @alias gpu.control.DrawControl
 */
var DrawControl = function (options) {

    var settings = {
        featuresCollection: null,
        type: "",
        title: "",
        hitTolerance: 10,
        onDrawStart: function () {},
        onDrawEnd: function () {},
        onDeactivate: function () {},
        onActivate: function () {}
    };

    this.settings = $.extend(settings, options);

    this.active = false;

    var element = $("<div>").addClass('ol-draw-' + this.settings.type.toLowerCase() + ' ol-unselectable ol-control');


    var self = this;
    $("<button>").attr('title', this.settings.title)
            .on("touchstart click", function (e)
            {
                if (e && e.preventDefault)
                    e.preventDefault();

                self.setActive(!self.active);
            }
            )
            .html('<span class="glyphicon gpu-draw-' + this.settings.type.toLowerCase() + '"></span>')
            .appendTo(element);


    ol.control.Control.call(this, {
        element: element.get(0),
        target: options.target
    });

    this.drawInteraction = this.createDrawInteraction();

};

ol.inherits(DrawControl, ol.control.Control);


DrawControl.prototype.setMap = function (map) {
    ol.control.Control.prototype.setMap.call(this, map);
    this.initControl();
};

DrawControl.prototype.initControl = function () {
    this.getMap().addInteraction(this.drawInteraction);
    this.drawInteraction.setActive(false);
};

DrawControl.prototype.setActive = function (active) {

    if (active && !this.active) {
        $(this).trigger('activate');
        this.settings.onActivate(this);
        this.getMap().addInteraction(this.drawInteraction);
        this.drawInteraction.setActive(true);
        this.active = true;
        $(this.element).addClass('active');

    }
    if (!active && this.active) {
        $(this).trigger('deactivate');
        this.settings.onDeactivate(this);
        this.drawInteraction.setActive(false);
        this.active = false;
        $(this.element).removeClass('active');

    }

};

DrawControl.prototype.createDrawInteraction = function () {
    var type = null;
    switch (this.settings.type) {
        case "Point" :
            type = "Point";
            break;
        case "Text":
            type = "Point";
            break;
        case "LineString":
            type = "LineString";
            break;
        case "Polygon":
            type = "Polygon";
            break;
    }


    var drawInteraction = new ol.interaction.Draw({
        type: type,
        features: this.settings.featuresCollection,
        style: this.settings.styleWhenDrown
    });

    var self = this;
    drawInteraction.on('drawstart', this.settings.onDrawStart);
    drawInteraction.on('drawend', function (e) {
        e.feature.setStyle(self.settings.styleWhenAdded);
        e.feature.setProperties({gpuGeometryType: self.settings.type});
        self.settings.onDrawEnd(e);

    });

    return drawInteraction;
};

module.exports = DrawControl;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],16:[function(require,module,exports){
(function (global){
// TODO check browserify usage (http://dontkry.com/posts/code/browserify-and-the-universal-module-definition.html)

var jQuery = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

var ge = {
    defaultParams: require('./ge/defaultParams'),
    GeometryEditor: require('./ge/GeometryEditor')
} ;

/**
 * Expose jQuery plugin
 */
jQuery.fn.geometryEditor = function( options ){
    return this.each(function() {
        var elem = $(this) ;
        var editor = new ge.GeometryEditor(elem,options);
        elem.data('editor',editor);
    });
} ;

global.ge = ge ;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./ge/GeometryEditor":5,"./ge/defaultParams":9}]},{},[16]);
