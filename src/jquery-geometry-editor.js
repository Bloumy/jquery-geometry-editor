(function($) {

	$.fn.geometry = function( options ){
		var settings = $.extend({
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
		
		if ( settings.hide ){
			this.hide();
		}
		
		/*
		 * add map div to DOM
		 */
		var $mapDiv = $('<div id="'+settings.mapId+'"></div>') ;
		$mapDiv.css('width', settings.width) ;
		$mapDiv.css('height', settings.height) ;
		$mapDiv.insertAfter(this);
		
		/*
		 * init leaflet map
		 */
		var map = L.map(settings.mapId).setView(
			[45.0, 2.0], 4
		);
		
		for ( var i in settings.tileLayers ){
			var tileLayer = settings.tileLayers[i] ;
			L.tileLayer(tileLayer.url, {
			    attribution: tileLayer.attribution,
			    maxZoom: 18
			}).addTo(map);
		}
		
		/*
		 * Create vector layer width data
		 */
		var drawnItems = new L.FeatureGroup();
		map.addLayer(drawnItems);
		
		var data = this.val() ;
		if ( data != "" ){
//			var feature = L.geoJson(data) ;
//			feature.addTo(drawnItems);
//			map.fitBounds(drawnItems.getBounds());
		}		
		
		/*
		 * map edition
		 */
		if ( settings.editable ){
			// TODO see https://github.com/Leaflet/Leaflet.draw#disabling-a-toolbar-item
			var drawOptions = {
				edit: {
					featureGroup: drawnItems
				}
			} ;
			var drawControl = new L.Control.Draw(drawOptions).addTo(map);
			
			var self = this ;
			map.on('draw:created', function(e) {
				drawnItems.addLayer(e.layer);
				self.val(JSON.stringify(drawnItems.toGeoJSON()));
			});
			
			map.on('draw:edited', function (e) {
			    //var geojson = e.layer.toGeoJSON();
			    //var wkt = Terraformer.WKT.convert(geojson.geometry);
			    //console.log(wkt);
			    //drawnItems.addLayer(e.layer);
				//alert(geojson);
				self.val(JSON.stringify(e.layer.toGeoJSON()));
			});
		}
		
		/*
		 * allows to get leaflet map from div $('#map').data('map');
		 */
		this.data('map',map);
	} ;
	
})(jQuery);
