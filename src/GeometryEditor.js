
var guid = require('./util/guid.js');

var featureCollectionToGeometry = require('./util/featureCollectionToGeometry.js');
var geometryToSimpleGeometries = require('./util/geometryToSimpleGeometries');

var isSingleGeometryType = require('./geometryType/isSingleGeometryType.js') ;

/**
 * GeometryEditor component creates a map synchronized with an input element.
 */
var GeometryEditor = function(dataElement,options){
    this.dataElement = dataElement ;
    this.settings = $.extend({
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
        lon: 45.0,
        lat: 2.0,
        zoom: 4,
        geometryType: 'Geometry'
    }, options );

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
        draw: {
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

    var drawControl = new L.Control.Draw(drawOptions);
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
