var ol = require('openlayers');
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
