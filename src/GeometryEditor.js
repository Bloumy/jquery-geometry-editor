
var guid = require('./util/guid.js');

var GeometryEditor = function(inputElement,options){
    this.inputElement = inputElement ;
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
        height: '500'
    }, options );

    // init map
    this.map = this.initMap();

    // init features
    this.drawnItems = this.initFeatures() ;

    // draw controls
    if ( this.settings.editable ){
        this.initDrawControls();
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
    $mapDiv.insertAfter(this.inputElement);

    // create leaflet map
    var map = L.map(mapId).setView(
        [45.0, 2.0], 4
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


GeometryEditor.prototype.getInputData = function(){
    if ( typeof this.inputElement.attr('value') !== 'undefined' ){
        return $.trim( this.inputElement.val() ) ;
    }else{
        return $.trim( this.inputElement.html() ) ;
    }
} ;

GeometryEditor.prototype.setInputData = function(value){
    if ( typeof this.inputElement.attr('value') !== 'undefined' ){
        this.inputElement.val(value) ;
    }else{
        this.inputElement.html(value) ;
    }
} ;

/**
 * Init map from inputElement data
 */
GeometryEditor.prototype.initFeatures = function(){
    var drawnItems = new L.FeatureGroup();
    this.map.addLayer(drawnItems);

    var data = this.getInputData();
    if ( data !== '' ){
        L.geoJson(JSON.parse(data),{
            onEachFeature: function(feature, layer) {
                drawnItems.addLayer(layer);
                layer.on('click',
                    function(e){
                        if( typeof selectedFeature !== "undefined" ){
                            selectedFeature.editing.disable();
                        }
                        selectedFeature = e.target;
                        e.target.editing.enable();
                    }
                );
            }
        }) ;
        //drawnItems.addData(featureCollection);
        this.map.fitBounds(drawnItems.getBounds());
    }
    return drawnItems ;
} ;


/**
 * Init draw controls
 * @see https://github.com/Leaflet/Leaflet.draw#disabling-a-toolbar-item
 */
GeometryEditor.prototype.initDrawControls = function(){
    var drawOptions = {
        polyline: true,
        polygon: true,
        rectangle: true,
        circle: true,
        edit: {
            featureGroup: this.drawnItems
        }
    } ;

    var drawControl = new L.Control.Draw(drawOptions);
    this.map.addControl(drawControl);

    var self = this ;
    this.map.on('draw:created', function(e) {
        self.drawnItems.addLayer(e.layer);
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
    var featureCollection = this.drawnItems.toGeoJSON() ;
    var geometry = this.featureCollectionToGeometry(featureCollection);
    this.setInputData(JSON.stringify(geometry));
} ;


/**
 * Converts FeatureCollection to normalized geometry
 */
GeometryEditor.prototype.featureCollectionToGeometry = function(featureCollection){
    var geometries = [] ;
    featureCollection.features.forEach(function(feature){
        geometries.push( feature.geometry ) ;
    });
    if ( geometries.length <= 1 ){
        return geometries[0];
    }else{
        return this.geometriesToCollection(geometries) ;
    }
} ;

/**
 * Converts an array of geometries to a collection (MultiPoint, MultiLineString,
 * MultiPolygon, GeometryCollection)
 */
GeometryEditor.prototype.geometriesToCollection = function(geometries){
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


module.exports = GeometryEditor ;
