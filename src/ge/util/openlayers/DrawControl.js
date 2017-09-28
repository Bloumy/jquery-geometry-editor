var ol = require('openlayers');


/**
 * Contrôle de création d'une feature de type
 *
 * @constructor
 * @extends {ol.control.Control}
 * 
 * @param {object} options
 * @param {String} options.type le type d'élément dessiné ('Text', 'Point', 'LineString' ou 'Polygon')
 * 
 * @alias gpu.control.DrawControl
 */
var DrawControl = function (options) {

    var settings = {
        featuresCollection: null,
        type: "",
        title: "",
        hitTolerance: 10,
        onDrawStart: function () {},
        onDrawEnd: function () {},
        onDeactivate: function () {},
        onActivate: function () {}
    };

    this.settings = $.extend(settings, options);

    this.active = false;

    var element = $("<div>").addClass('ol-draw-' + this.settings.type.toLowerCase() + ' ol-unselectable ol-control');


    var self = this;
    $("<button>").attr('title', this.settings.title)
            .on("touchstart click", function (e)
            {
                if (e && e.preventDefault)
                    e.preventDefault();

                self.setActive(!self.active);
            }
            )
            .html('<span class="glyphicon gpu-draw-' + this.settings.type.toLowerCase() + '"></span>')
            .appendTo(element);


    ol.control.Control.call(this, {
        element: element.get(0),
        target: options.target
    });

    this.drawInteraction = this.createDrawInteraction();

};

ol.inherits(DrawControl, ol.control.Control);


DrawControl.prototype.setMap = function (map) {
    ol.control.Control.prototype.setMap.call(this, map);
    this.initControl();
};

DrawControl.prototype.initControl = function () {
    this.getMap().addInteraction(this.drawInteraction);
    this.drawInteraction.setActive(false);
};

DrawControl.prototype.setActive = function (active) {

    if (active && !this.active) {
        $(this).trigger('activate');
        this.settings.onActivate(this);
        this.getMap().addInteraction(this.drawInteraction);
        this.drawInteraction.setActive(true);
        this.active = true;
        $(this.element).addClass('active');

    }
    if (!active && this.active) {
        $(this).trigger('deactivate');
        this.settings.onDeactivate(this);
        this.drawInteraction.setActive(false);
        this.active = false;
        $(this.element).removeClass('active');

    }

};

DrawControl.prototype.createDrawInteraction = function () {
    var type = null;
    switch (this.settings.type) {
        case "Point" :
            type = "Point";
            break;
        case "Text":
            type = "Point";
            break;
        case "LineString":
            type = "LineString";
            break;
        case "Polygon":
            type = "Polygon";
            break;
    }


    var drawInteraction = new ol.interaction.Draw({
        type: type,
        features: this.settings.featuresCollection,
        style: this.settings.styleWhenDrown
    });

    var self = this;
    drawInteraction.on('drawstart', this.settings.onDrawStart);
    drawInteraction.on('drawend', function (e) {
        e.feature.setStyle(self.settings.styleWhenAdded);
        e.feature.setProperties({gpuGeometryType: self.settings.type});
        self.settings.onDrawEnd(e);

    });

    return drawInteraction;
};

module.exports = DrawControl;
