
/**
 * Indicates if the given type corresponds to a mutli geometry
 */
var isSingleGeometryType = function(geometryType) {
    console.log(geometryType);
    return ["Point","LineString","Polygon"].indexOf(geometryType) !== -1 ;
};

module.exports = isSingleGeometryType ;
