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



module.exports = Backend;
