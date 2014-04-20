goog.provide('ol.interaction.Select');

goog.require('goog.array');
goog.require('goog.functions');
goog.require('ol.Feature');
goog.require('ol.FeatureOverlay');
goog.require('ol.events.condition');
goog.require('ol.feature');
goog.require('ol.geom.GeometryType');
goog.require('ol.interaction.Interaction');



/**
 * @constructor
 * @extends {ol.interaction.Interaction}
 * @param {olx.interaction.SelectOptions=} opt_options Options.
 * @todo stability experimental
 */
ol.interaction.Select = function(opt_options) {

  goog.base(this);

  var options = goog.isDef(opt_options) ? opt_options : {};

  /**
   * @private
   * @type {ol.events.ConditionType}
   */
  this.condition_ = goog.isDef(options.condition) ?
      options.condition : ol.events.condition.singleClick;

  /**
   * @private
   * @type {ol.events.ConditionType}
   */
  this.addCondition_ = goog.isDef(options.addCondition) ?
      options.addCondition : ol.events.condition.never;

  /**
   * @private
   * @type {ol.events.ConditionType}
   */
  this.removeCondition_ = goog.isDef(options.removeCondition) ?
      options.removeCondition : ol.events.condition.never;

  /**
   * @private
   * @type {ol.events.ConditionType}
   */
  this.toggleCondition_ = goog.isDef(options.toggleCondition) ?
      options.toggleCondition : ol.events.condition.shiftKeyOnly;

  var layerFilter;
  if (goog.isDef(options.layerFilter)) {
    layerFilter = options.layerFilter;
  } else if (goog.isDef(options.layer)) {
    var layer = options.layer;
    layerFilter =
        /**
         * @param {ol.layer.Layer} l Layer.
         * @return {boolean} Include.
         */
        function(l) {
      return l === layer;
    };
  } else if (goog.isDef(options.layers)) {
    var layers = options.layers;
    layerFilter =
        /**
         * @param {ol.layer.Layer} layer Layer.
         * @return {boolean} Include.
         */
        function(layer) {
      return goog.array.indexOf(layers, layer) != -1;
    };
  } else {
    layerFilter = goog.functions.TRUE;
  }

  /**
   * @private
   * @type {function(ol.layer.Layer): boolean}
   */
  this.layerFilter_ = layerFilter;

  /**
   * @private
   * @type {ol.FeatureOverlay}
   */
  this.featureOverlay_ = new ol.FeatureOverlay({
    style: (goog.isDef(options.style)) ? options.style :
        ol.interaction.Select.getDefaultStyleFunction()
  });

};
goog.inherits(ol.interaction.Select, ol.interaction.Interaction);


/**
 * @return {ol.Collection} Features collection.
 * @todo stability experimental
 */
ol.interaction.Select.prototype.getFeatures = function() {
  return this.featureOverlay_.getFeatures();
};


/**
 * @inheritDoc
 */
ol.interaction.Select.prototype.handleMapBrowserEvent =
    function(mapBrowserEvent) {
  if (!this.condition_(mapBrowserEvent)) {
    return true;
  }
  var add = this.addCondition_(mapBrowserEvent);
  var remove = this.removeCondition_(mapBrowserEvent);
  var toggle = this.toggleCondition_(mapBrowserEvent);
  var set = !add && !remove && !toggle;
  var map = mapBrowserEvent.map;
  var features = this.featureOverlay_.getFeatures();
  var skippedFeatures = map.getSkippedFeatures();
  if (set) {
    // Replace the currently selected feature(s) with the feature at the pixel,
    // or clear the selected feature(s) if there is no feature at the pixel.
    /** @type {ol.Feature|undefined} */
    var feature = map.forEachFeatureAtPixel(mapBrowserEvent.pixel,
        /**
         * @param {ol.Feature} feature Feature.
         * @param {ol.layer.Layer} layer Layer.
         */
        function(feature, layer) {
          return feature;
        }, undefined, this.layerFilter_);
    if (goog.isDef(feature) &&
        features.getLength() == 1 &&
        features.getAt(0) == feature) {
      // No change
    } else {
      if (features.getLength() !== 0) {
        features.forEach(function(feature) {
          skippedFeatures.remove(feature);
        });
        features.clear();
      }
      if (goog.isDef(feature)) {
        features.push(feature);
        skippedFeatures.push(feature);
      }
    }
  } else {
    // Modify the currently selected feature(s).
    map.forEachFeatureAtPixel(mapBrowserEvent.pixel,
        /**
         * @param {ol.Feature} feature Feature.
         * @param {ol.layer.Layer} layer Layer.
         */
        function(feature, layer) {
          var index = goog.array.indexOf(features.getArray(), feature);
          if (index == -1) {
            if (add || toggle) {
              features.push(feature);
              skippedFeatures.push(feature);
            }
          } else {
            if (remove || toggle) {
              features.removeAt(index);
              skippedFeatures.remove(feature);
            }
          }
        }, undefined, this.layerFilter_);
  }
  return false;
};


/**
 * @inheritDoc
 */
ol.interaction.Select.prototype.setMap = function(map) {
  var currentMap = this.getMap();
  var selectedFeatures = this.featureOverlay_.getFeatures();
  if (!goog.isNull(currentMap)) {
    selectedFeatures.forEach(function(feature) {
      currentMap.getSkippedFeatures().remove(feature);
    });
  }
  goog.base(this, 'setMap', map);
  this.featureOverlay_.setMap(map);
  if (!goog.isNull(map)) {
    selectedFeatures.forEach(function(feature) {
      map.getSkippedFeatures().push(feature);
    });
  }
};


/**
 * @return {ol.feature.StyleFunction} Styles.
 */
ol.interaction.Select.getDefaultStyleFunction = function() {
  var styles = ol.feature.createDefaultEditingStyles();
  goog.array.extend(styles[ol.geom.GeometryType.POLYGON],
      styles[ol.geom.GeometryType.LINE_STRING]);
  goog.array.extend(styles[ol.geom.GeometryType.GEOMETRY_COLLECTION],
      styles[ol.geom.GeometryType.LINE_STRING]);

  return function(feature, resolution) {
    return styles[feature.getGeometry().getType()];
  };
};
