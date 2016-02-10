# JQuery Geometry Editor

jQuery plugin providing a geometry editor based on leaflet. The map is synchronized with an input (such as text input).

## Dependencies

* [JQuery](https://jquery.com/)
* [leaflet](http://leafletjs.com/) : Open-source JavaScript library for mobile-friendly interactive maps
* [leaflet-draw](https://github.com/Leaflet/Leaflet.draw) : Vector drawing and editing plugin for Leaflet
* [leaflet-omnivore](https://github.com/mapbox/leaflet-omnivore) : Universal format parser for Leaflet & Mapbox.js

## Basic usage

```
$('#geometry').geometryEditor({
    height: 400,
    hide: false,
    editable: true
});
```

See :

* [Basic example (bundle, i.e. built in dependencies)](example/basic.html)
* [Basic example (external dependencies)](example/basic-without-bundle.html)


## Advanced use

### Retrieve the geometry editor

```
// Get GeometryEditor
$('#geometry').data('editor')
```

## GeometryEditor options

### Basic options

* width (string|number)

The map width (ex : '500', default '100%')

* height (string|number)

The map height

### Edit options

* editable (boolean)

* Option "geometryType" (enum)

Type provides a restriction on geometry edition and supports the following values :

* Geometry : Any geometry type
* Point
* LineString
* Polygon
* MultiPolygon
* MultiLineString
* MultiPolygon
* GeometryCollection (default) : all geometries are supported

Note that :
* Adding geometries leads to replacement for single geometries (Point, LineString, Polygon)


## TODO

### Bugs

* Input geometries are not filtered according to geometryType
* Output geometries are not fully normalized according to geometryType

### Features

Restrict edition to the given type.

* Options "format"

GeoJSON (default)|WKT (easier to integrate with PostGIS).

### Clear and test code

* Rely only on npm for the build
* Test
    * FeatureCollection to Geometry
