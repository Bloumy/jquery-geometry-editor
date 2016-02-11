// TODO UMD

var ge = {
    defaultParams: require('./ge/defaultParams'),
    GeometryEditor: require('./ge/GeometryEditor')
} ;

if ( typeof window !== 'undefined' ){
    window.ge = ge ;
}else{
    module.exports = ge ;
}

var jQuery = window.jQuery || require('jquery');

(function($) {

	var GeometryEditor = require('./ge/GeometryEditor');

	$.fn.geometryEditor = function( options ){
		return this.each(function() {
			var editor = new GeometryEditor($(this),options);
			$(this).data('editor',editor);
		});
	} ;

})(jQuery);
