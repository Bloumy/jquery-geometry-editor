var guid = require('./util/guid.js');

var L = require('leaflet');
var DrawControl = require('leaflet-draw');

var bboxPolygon = require('turf-bbox-polygon');
var extent = require('turf-extent');

var defaultParams = require('./defaultParams.js');
var featureCollectionToGeometry = require('./util/featureCollectionToGeometry.js');
var geometryToSimpleGeometries = require('./util/geometryToSimpleGeometries');
var isSingleGeometryType = require('./util/isSingleGeometryType.js');


/**
 * GeometryEditor constructor from a dataElement containing a serialized geometry
 * @param {Object} dataElement
 * @param {Object} options
 */
var GeometryEditor = function(dataElement, options) {
    this.dataElement = dataElement;
    this.settings = {};
    $.extend(true, this.settings, defaultParams, options); // deep copy

    // init map
    this.map = this.initMap();

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
};


/**
 * Init leaflet map
 *
 * @return L.Map
 */
GeometryEditor.prototype.initMap = function() {
    // create map div
    var mapId = 'map-' + guid();
    var $mapDiv = $('<div id="' + mapId + '"></div>');
    $mapDiv.addClass('map');
    $mapDiv.css('width', this.settings.width);
    $mapDiv.css('height', this.settings.height);
    $mapDiv.insertAfter(this.dataElement);

    // create leaflet map
    var map = L.map(mapId).setView(
        [this.settings.lat, this.settings.lon],
        this.settings.zoom
    );

    // init layers
    for (var i in this.settings.tileLayers) {
        var tileLayer = this.settings.tileLayers[i];
        L.tileLayer(tileLayer.url, {
            attribution: tileLayer.attribution,
            maxZoom: 18
        }).addTo(map);
    }

    return map;
};

/**
 * Indicates if data element is an input field (<input>, <textarea>, etc.)
 * @private
 */
GeometryEditor.prototype.isDataElementAnInput = function() {
    return typeof this.dataElement.attr('value') !== 'undefined';
};

/**
 * Get raw data from the dataElement
 * @returns {String}
 */
GeometryEditor.prototype.getRawData = function() {
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
GeometryEditor.prototype.setRawData = function(value) {
    var currentData = this.getRawData() ;
    if ( currentData === value ){
        return ;
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
GeometryEditor.prototype.setGeometry = function(geometry) {
    // hack to accept bbox
    if (geometry instanceof Array && geometry.length === 4 ){
        geometry = bboxPolygon(geometry).geometry ;
    }

    this.drawLayer.clearLayers();
    var geometries = geometryToSimpleGeometries(geometry);

    var self = this;
    L.geoJson(geometries, {
        onEachFeature: function(feature, layer) {
            self.drawLayer.addLayer(layer);
        }
    });
    if (geometries.length !== 0) {
        this.map.fitBounds(this.drawLayer.getBounds());
    }
    this.serializeGeometry();
};



/**
 * Init map from dataElement data
 */
GeometryEditor.prototype.initDrawLayer = function() {
    this.drawLayer = L.featureGroup().addTo(this.map);
    this.updateDrawLayer();
    this.dataElement.on('change',this.updateDrawLayer.bind(this));
};

/**
 * Update draw layer from data
 */
GeometryEditor.prototype.updateDrawLayer = function(){
    var data = this.getRawData();
    if (data !== '') {
        var geometry = JSON.parse(data);
        this.setGeometry(geometry);
    }
};

/**
 * Get output geometry type
 * @returns {String}
 */
GeometryEditor.prototype.getGeometryType = function() {
    return this.settings.geometryType;
};

/**
 * Indicates if geometryType is allowed by restriction
 * @param {type} geometryType
 * @returns {Boolean}
 */
GeometryEditor.prototype.canEdit = function(geometryType) {
    if ( geometryType === "Rectangle" ){
        if ( this.getGeometryType().indexOf("Polygon") !== -1 ){
            return true ;
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
GeometryEditor.prototype.initDrawControls = function() {
    var drawOptions = {
        draw: {
            position: 'topleft',
            marker: this.canEdit("Point"),
            polyline: this.canEdit("LineString"),
            polygon: this.canEdit("Polygon"),
            rectangle: this.canEdit("Rectangle"),
            circle: false
        },
        edit: {
            featureGroup: this.drawLayer
        }
    };

    var drawControl = new DrawControl(drawOptions);
    this.map.addControl(drawControl);

    var self = this;
    this.map.on('draw:created', function(e) {
        if (isSingleGeometryType(self.getGeometryType())) {
            self.drawLayer.clearLayers();
        }
        self.drawLayer.addLayer(e.layer);
        self.serializeGeometry();
    });

    this.map.on('draw:deleted', function(e) {
        self.serializeGeometry();
    });

    this.map.on('draw:edited', function(e) {
        self.serializeGeometry();
    });
};


/**
 * Serialize geometry to dataElement
 * 
 * @private
 */
GeometryEditor.prototype.serializeGeometry = function() {
    var featureCollection = this.drawLayer.toGeoJSON();
    var geometry = featureCollectionToGeometry(featureCollection);
    if (geometry) {
        if ( this.getGeometryType() === 'Rectangle' ){
            this.setRawData( JSON.stringify( extent(geometry) ) );
        }else{
            this.setRawData( JSON.stringify(geometry) );
        }
    } else {
        this.setRawData('');
    }
};


module.exports = GeometryEditor;
