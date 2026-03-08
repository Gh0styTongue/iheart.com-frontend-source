// # Abstract Model object
// This is the skeleton of all model classes
/**
 * @module models
 */

import { isPlainObject, merge, mergeWith, noop } from 'lodash-es';

/**
 * Construct Model object with a set of attributes
 * @constructor
 * @param {Object} attrs Attribute objects
 */
function Model(attrs) {
  this.attrs = this.parse(merge({}, attrs));
  this.id = attrs[this.idAttribute];
}

Model.prototype = {
  /**
   * Get an attribute based on name
   * @param  {String} attr Attribute name
   * @return {}      Value of that attribute
   */
  get(attr) {
    return this.attrs[attr];
  },

  idAttribute: 'id',

  parse(attrs) {
    return attrs || {};
  },
  /**
   * Set an attribute
   * @param {String} attr Attribute name
   * @param {} val  Attribute value
   */
  set(attr, val, customizer = noop) {
    if (isPlainObject(attr)) {
      this.attrs = mergeWith({}, this.attrs, attr, customizer);
    } else {
      this.attrs = mergeWith({}, this.attrs, { [attr]: val }, customizer);
    }
    this.id = this.attrs[this.idAttribute];
    return this;
  },
  /**
   * Convert this object into a POJO clone
   * @return {Object} The instance's properties
   */
  toJSON() {
    return merge({}, this.attrs);
  },
};

export default Model;
