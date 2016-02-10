
/**
 * Indicates if the given type corresponds to a mutli geometry
 */
var isSingleGeometryType = function(geometryType) {
    return ["Point","LineString","Polygon"].indexOf(geometryType);
};

module.exports = isSingleGeometryType ;
