(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){

var guid = require('./util/guid.js');

var defaultParams = require('./defaultParams.js') ;
var featureCollectionToGeometry = require('./util/featureCollectionToGeometry.js');
var geometryToSimpleGeometries = require('./util/geometryToSimpleGeometries');

var isSingleGeometryType = require('./geometryType/isSingleGeometryType.js') ;

var L = (typeof window !== "undefined" ? window['L'] : typeof global !== "undefined" ? global['L'] : null);
var DrawControl = (typeof window !== "undefined" ? window['L']['Control']['Draw'] : typeof global !== "undefined" ? global['L']['Control']['Draw'] : null);

/**
 * GeometryEditor component creates a map synchronized with an input element.
 */
var GeometryEditor = function(dataElement,options){
    this.dataElement = dataElement ;
    this.settings = $.extend(defaultParams, options );

    // init map
    this.map = this.initMap();

    // init features
    this.initDrawLayer() ;

    // draw controls
    if ( this.settings.editable ){
        this.initDrawControls();
    }

    // hide data
    if ( this.settings.hide ){
        this.dataElement.hide();
    }
} ;


/**
 * Init leaflet map
 *
 * @return L.Map
 */
GeometryEditor.prototype.initMap = function(){
    // create map div
    var mapId = 'map-'+guid();
    var $mapDiv = $('<div id="'+mapId+'"></div>') ;
    $mapDiv.addClass('map');
    $mapDiv.css('width', this.settings.width) ;
    $mapDiv.css('height', this.settings.height) ;
    $mapDiv.insertAfter(this.dataElement);

    // create leaflet map
    var map = L.map(mapId).setView(
        [this.settings.lat, this.settings.lon],
        this.settings.zoom
    );

    // init layers
    for ( var i in this.settings.tileLayers ){
        var tileLayer = this.settings.tileLayers[i] ;
        L.tileLayer(tileLayer.url, {
            attribution: tileLayer.attribution,
            maxZoom: 18
        }).addTo(map);
    }

    return map ;
} ;

/**
 * Indicates if data element is an input field (<input>, <textarea>, etc.)
 */
GeometryEditor.prototype.isDataElementAnInput = function(){
    return typeof this.dataElement.attr('value') !== 'undefined' ;
} ;

/**
 * Get raw data from the dataElement
 */
GeometryEditor.prototype.getRawData = function(){
    if ( this.isDataElementAnInput() ){
        return $.trim( this.dataElement.val() ) ;
    }else{
        return $.trim( this.dataElement.html() ) ;
    }
} ;

/**
 * Set raw data to the dataElement
 */
GeometryEditor.prototype.setRawData = function(value){
    if ( this.isDataElementAnInput() ){
        this.dataElement.val(value) ;
    }else{
        this.dataElement.html(value) ;
    }
    this.dataElement.trigger('change');
} ;

/**
 * Set the geometry
 */
GeometryEditor.prototype.setGeometry = function(geometry){
    this.drawLayer.clearLayers();
    var geometries = geometryToSimpleGeometries(geometry);

    var self = this ;
    L.geoJson(geometries,{
        onEachFeature: function(feature, layer) {
            self.drawLayer.addLayer(layer);
        }
    }) ;
    if ( geometries.length !== 0 ){
        this.map.fitBounds(this.drawLayer.getBounds());
    }
    this.serializeGeometry();
} ;



/**
 * Init map from dataElement data
 */
GeometryEditor.prototype.initDrawLayer = function(){
    this.drawLayer = L.featureGroup().addTo(this.map);

    var data = this.getRawData();
    if ( data !== '' ){
        var geometry = JSON.parse(data);
        this.setGeometry(geometry);
    }
} ;

/**
 * Get output geometry type
 * @returns {String}
 */
GeometryEditor.prototype.getGeometryType = function(){
    return this.settings.geometryType ;
} ;

/**
 * Indicates if geometryType allows LineString
 * @param {String} Point|LineString|Polygon
 * @return {boolean}
 */
GeometryEditor.prototype.canEdit = function(geometryType){
    if ( this.getGeometryType() === "Geometry" ){
        return true ;
    }
    if ( this.getGeometryType() === "GeometryCollection" ){
        return true ;
    }
    if ( this.getGeometryType().indexOf(geometryType) !== -1 ){
        return true ;
    }
    return false;
} ;



/**
 * Init draw controls
 * @see https://github.com/Leaflet/Leaflet.draw#disabling-a-toolbar-item
 */
GeometryEditor.prototype.initDrawControls = function(){
    var drawOptions = {
        draw: {
            position: 'topleft',
            marker: this.canEdit("Point"),
            polyline: this.canEdit("LineString"),
            polygon: this.canEdit("Polygon"),
            rectangle: this.canEdit("Polygon"),
            circle: false
        },
        edit: {
            featureGroup: this.drawLayer
        }
    } ;

    var drawControl = new DrawControl(drawOptions);
    this.map.addControl(drawControl);

    var self = this ;
    this.map.on('draw:created', function(e) {
        if ( isSingleGeometryType( self.getGeometryType() ) ){
            self.drawLayer.clearLayers();
        }
        self.drawLayer.addLayer(e.layer);
        self.serializeGeometry();
    });

    this.map.on('draw:deleted', function (e) {
        self.serializeGeometry();
    });

    this.map.on('draw:edited', function (e) {
        self.serializeGeometry();
    });
} ;


/**
 * Serialize geometry to input field
 */
GeometryEditor.prototype.serializeGeometry = function(){
    var featureCollection = this.drawLayer.toGeoJSON() ;
    var geometry = featureCollectionToGeometry(featureCollection);
    if ( geometry ){
        this.setRawData(JSON.stringify(geometry));
    }else{
        this.setRawData("");
    }
} ;




module.exports = GeometryEditor ;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./defaultParams.js":2,"./geometryType/isSingleGeometryType.js":3,"./util/featureCollectionToGeometry.js":4,"./util/geometryToSimpleGeometries":6,"./util/guid.js":7}],2:[function(require,module,exports){

/**
 * Default GeometryEditor parameters
 */
var defaultParams = {
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
    geometryType: 'Geometry'
} ;

module.exports = defaultParams ;

},{}],3:[function(require,module,exports){

/**
 * Indicates if the given type corresponds to a mutli geometry
 */
var isSingleGeometryType = function(geometryType) {
    return ["Point","LineString","Polygon"].indexOf(geometryType) !== -1 ;
};

module.exports = isSingleGeometryType ;

},{}],4:[function(require,module,exports){

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

},{"./geometriesToCollection.js":5}],5:[function(require,module,exports){

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

},{}],6:[function(require,module,exports){

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

},{}],7:[function(require,module,exports){

/**
 * Generates uuidv4
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

},{}],8:[function(require,module,exports){
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
        var editor = new ge.GeometryEditor($(this),options);
        $(this).data('editor',editor);
    });
} ;

global.ge = ge ;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./ge/GeometryEditor":1,"./ge/defaultParams":2}]},{},[8]);
