var ol = require('openlayers');



/**
 * Openlayers constructor from a dataElement containing a serialized geometry
 * @param {Object} dataElement
 * @param {Object} options
 */
var Openlayers = function (options) {
    this.settings = {};
    $.extend(this.settings, options); // deep copy
};


/**
 * Create leaflet map
 * @param {string} mapId - div map identifier
 * 
 * @return L.Map
 */
Openlayers.prototype.createMap = function (mapId, options) {
    
};

/**
 * Add layers to Openlayers map
 * @param {ol.Map} map - map leaflet
 * @param {Object[]} layers - array of layer configurations 
 * @param {string} layers[].url - url
 * @param {string} layers[].attribution - attribution
 * @param {Object} options - Options. Default : maxZoom = 18 
 * 
 * @return L.Map
 */
Openlayers.prototype.addLayersToMap = function (map, layers, options) {
    options = options || {};
};

Openlayers.prototype.addControlToMap = function (map, control) {
    map.addControl(control);
};


Openlayers.prototype.setGeometries = function (drawLayer, geometries) {

};

Openlayers.prototype.fitBoundsToMap = function (map, drawLayer) {
    
};



Openlayers.prototype.createDrawLayer = function (map) {

};

Openlayers.prototype.addDrawEventsToMap = function (map, events) {
   

};


module.exports = Openlayers;
