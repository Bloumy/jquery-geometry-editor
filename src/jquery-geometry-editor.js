// TODO UMD

var jQuery = window.jQuery || require('jquery');

(function($) {

	var GeometryEditor = require('./ge/GeometryEditor');

	$.fn.geometryEditor = function( options ){
		return this.each(function() {
			var editor = new GeometryEditor($(this),options);
			$(this).data('editor',editor);
		});
	} ;

})(jQuery);
