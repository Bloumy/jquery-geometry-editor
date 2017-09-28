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
