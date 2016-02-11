# JQuery Geometry Editor

## Motivation

When a date is needed is an HTML form, we simply pick a [Datepicker](https://jqueryui.com/datepicker/). When it's a shape : We write GeoJSON REST APIs and code client based on leaflet, openlayers, etc.

What about a new approach?

* Create a classic form with a serialized Geometry :

```
<form>
    <!-- a form field -->
    Place : <input type="text" name="name" value="The name" />
    <!-- a serialized geometry -->
    Position : <textarea id="position" name="position"
    >
    {
        "type": "Point",
        "coordinates": [5.0,45.0]
    }
    </textarea>
</form>
```

* Enable geometry editor :

```
$('#position').geometryEditor({
    width: '100%',
    height: 400,
    type: 'Point'
});
```

* Result

![Point example](doc/images/form-place.png)


## Dependencies

* [JQuery](https://jquery.com/)
* [leaflet](http://leafletjs.com/) : Open-source JavaScript library for mobile-friendly interactive maps
* [leaflet-draw](https://github.com/Leaflet/Leaflet.draw) : Vector drawing and editing plugin for Leaflet
* [leaflet-omnivore](https://github.com/mapbox/leaflet-omnivore) : Universal format parser for Leaflet & Mapbox.js

## Viewer mode

Controls can be disabled to get a geometry viewer :

```
$('#geometry').geometryEditor({
    editable: false
});
```

See :

* [Basic example (bundle, i.e. built in dependencies)](example/basic.html)
* [Basic example (external dependencies)](example/basic-without-bundle.html)

## Global customization

Default GeometryEditor parameters are exposed throw the variable ```ge.defaultParams``` :

```
ge.defaultParams.tileLayers = [
    {
        url: getGeoportalURL("GEOGRAPHICALGRIDSYSTEMS.PLANIGN"),
        attribution: '<a href="#">IGN</a>'
    }
]
```

## GeometryEditor options

### Basic options

#### width (string|number)

The map width (ex : '500', default '100%')

#### height (string|number)

The map height

### Edit options

#### editable (boolean)

#### geometryType" (enum)

This  provides a restriction on geometry edition :

* Geometry (default) : Any geometry type
* Point
* LineString
* Polygon
* MultiPolygon
* MultiLineString
* MultiPolygon
* GeometryCollection

![Geometry types](doc/images/geometry-types.png)

Note that :
* Adding geometries leads to replacement for single geometries (Point, LineString, Polygon)
* Circle are disabled for a while

## Advanced use

### Retrieve the geometry editor

The GeometryEditor is attached to the input field and can be retrieved :

```
// Get GeometryEditor
$('#geometry').data('editor')
```

### Use GeometryEditor component

```
var geometryEditor = new GeometryEditor(
    document.getElementById('position'),
    {
        geometryType: 'Point'
    }  
);
```

## TODO

### Bugs

* Input geometries are not filtered according to geometryType
* Output geometries are not fully normalized according to geometryType (Point instead of MultiPoint)

### Futures features

* Events to simplify customization (such as adding navigation control)

* Options "format"

GeoJSON (default)|WKT (easier to integrate with PostGIS).

### Clear and test code

* Rely only on npm for the build
* Test
    * FeatureCollection to Geometry
