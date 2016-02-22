# JQuery Geometry Editor

## Motivation

When a date is needed is an HTML form, we simply pick a [Datepicker](https://jqueryui.com/datepicker/). When it's a shape : We write GeoJSON REST APIs and code client based on leaflet, openlayers, etc.

What about a new approach? A serialized geometry and a dedicated widget :

```
$('#position').geometryEditor({
    height: 400,
    type: 'Point'
});
```

![Point example](doc/images/form-place.png)


## Dependencies

* [JQuery](https://jquery.com/)
* [leaflet](http://leafletjs.com/) : Open-source JavaScript library for mobile-friendly interactive maps
* [leaflet-draw](https://github.com/Leaflet/Leaflet.draw) : Vector drawing and editing plugin for Leaflet
* [TurfJS](https://github.com/Turfjs) : Geometry manipulation

Exemples use either [OSM tiles](http://www.openstreetmap.org/copyright) or [IGN geoportal](http://www.geoportail.gouv.fr) (see [Conditions énérales](http://api.ign.fr/conditions-generales)) (French).

## Viewer mode

GeometryEditor acts as a geometry viewer when edition controls are disabled :

```
$('#geometry').geometryEditor({
    editable: false
});
```

## GeometryEditor options

### Basic options

#### *width* (string|number)

The map width (ex : '500', default '100%')

#### *height* (string|number)

The map height

#### *tileLayers* (Object[])

An array corresponding to background layers :

```
tileLayers: [
   {
       url: "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
       attribution: 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
   }
]
```

### Edit options

#### *editable* (boolean)

#### *geometryType* (enum)

This  provides a restriction on geometry edition :

* Geometry (default) : Any geometry type
* Point
* LineString
* Polygon
* MultiPolygon
* MultiLineString
* MultiPolygon
* GeometryCollection
* Rectangle (bounding box)

![Geometry types](doc/images/geometry-types.png)

Note that :
* Adding geometries leads to replacement for single geometries (Point, LineString, Polygon)
* Circle are disabled for a while

## Global customization

Default parameters are exposed throw the variable ```ge.defaultParams``` :

```
ge.defaultParams.tileLayers = [
{
    url: getGeoportalURL("GEOGRAPHICALGRIDSYSTEMS.PLANIGN"),
    attribution: '<a href="#">IGN</a>'
}
]
```

## Advanced use


### Retrieve the geometry editor

The GeometryEditor is attached to the input field and can be retrieved :

```
// Get GeometryEditor
$('#geometry').data('editor')
```

### GeometryEditor component

WARNING : GeometryEditor interface is not yet really stable.

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

### Incoming features

* Multiple tileLayers
* Events to simplify customization (such as adding navigation control)
* Options "format"

GeoJSON (default)|WKT (easier to integrate with PostGIS).
