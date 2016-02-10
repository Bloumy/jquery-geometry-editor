
/**
 * Indicates if the given type corresponds to a mutli geometry
 */
var isMultiple = function(geometryType) {
    return geometryType.startsWith("Multi") || (geometryType === "GeometryCollection");
};

module.exports = isMultiple ;
