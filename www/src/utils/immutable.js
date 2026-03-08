import Model from 'web-player/models/Model';

/**
 * A collection of helpers for Backbone Models
 */

/**
 * @param {*} obj
 * @return {boolean}
 */
export function isModel(obj) {
  return !!obj && (obj instanceof Model || (obj.attrs && obj.toJSON));
}

/**
 * Converts a JS object to a passed in Model currently used across the app
 */
export function toModel(data, ModelConstructor, idAttribute, id) {
  // if data is already a backbone model return as is.
  if (isModel(data)) return data;

  const modelInstance = new ModelConstructor(data);

  if (idAttribute) modelInstance.idAttribute = idAttribute;
  if (id) modelInstance.id = id;

  return modelInstance;
}
