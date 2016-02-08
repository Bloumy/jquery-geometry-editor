(function($) {


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

			/*
			 * usefull option for multiple map in same form
			 */
			mapId: "map",
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
		var $mapDiv = $('<div id="'+this.settings.mapId+'"></div>') ;
		$mapDiv.css('width', this.settings.width) ;
		$mapDiv.css('height', this.settings.height) ;
		$mapDiv.insertAfter(this.inputElement);

		// create leaflet map
		var map = L.map(this.settings.mapId).setView(
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


	/**
	 * Init map from inputElement data
	 */
	GeometryEditor.prototype.initFeatures = function(){
		var drawnItems = new L.FeatureGroup();
		this.map.addLayer(drawnItems);

		var data = this.inputElement.val() ;
		console.log(data);
		if ( data !== '' ){
			L.geoJson(JSON.parse(data),{
				onEachFeature: function(feature, layer) {
					drawnItems.addLayer(layer);
					layer.on('click',
						function(e){
							if(selectedFeature)
								selectedFeature.editing.disable();
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
			console.log(e);
			self.drawnItems.addLayer(e.layer);
			self.inputElement.val(JSON.stringify(self.drawnItems.toGeoJSON()));
		});

		this.map.on('draw:edited', function (e) {
			console.log(e);
			self.inputElement.val(JSON.stringify(self.drawnItems.toGeoJSON()));
		});
	} ;


	$.fn.geometryEditor = function( options ){
		var editor = new GeometryEditor(this,options);
		this.data('editor',editor);
	} ;

})(jQuery);
