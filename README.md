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


## TODO

### Bugs

* Multiple maps are not yet allowed

Generate random map id and allow ```$('.geometry').geometryEditor()``` (multiple maps on same page, jQuery forEach)

* Fix edition of GeometryCollection, MultiPoint, MultiLineString, MultiPolygon

### Features

* Option "type" (enum)

Point|LineString|Polygon|MultiPolygon|MultiLineString|MultiPolygon|GeometryCollection)

Restrict edition to the given type.

### Clear and test code

* CommonJS
* Rely only on npm for the build
* Test
    * FeatureCollection to Geometry
