var L = require('leaflet');
var DrawControl = require('leaflet-draw');
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
