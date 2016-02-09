# JQuery Geometry Editor

jQuery plugin providing a geometry editor based on leaflet. A map is synchronized
with an input (such as text input).

## Dependencies

* [JQuery](https://jquery.com/)
* [leaflet](http://leafletjs.com/) : Open-source JavaScript library for mobile-friendly interactive maps
* [leaflet-draw](https://github.com/Leaflet/Leaflet.draw) : Vector drawing and editing plugin for Leaflet
* [leaflet-omnivore](https://github.com/mapbox/leaflet-omnivore) : Universal format parser for Leaflet & Mapbox.js

## Basic usage

```
$(document).ready(function(){
    $('#geometry').geometryEditor({
        height: 400,
        hide: false,
        editable: true
    });
});
```

## Examples

* [Basic example (bundle, i.e. built in dependencies)](example/basic.html)
* [Basic example (external dependencies)](example/basic-without-bundle.html)

## Settings

* width (string|number): map width (ex : '500', default '100%')
* height (string|number) : map height (ex: '500', default '500px')

## TODO

* Allow edition of GeometryCollection, MultiPoint, MultiLineString, MultiPolygon
* Generate random map id
* Allow ```$('.geometry').geometryEditor()``` (multiple maps on same page, jQuery forEach)
* Bundle with leaflet and its plugins
