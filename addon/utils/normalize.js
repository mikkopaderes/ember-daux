import { getOwner } from '@ember/application';

/**
 * @param {Utility.Model} model
 * @return {Object} Record with default values
 * @function
 */
function getDefaultRecord(model) {
  const defaultRecord = {};

  model.attributes.forEach((attribute) => {
    defaultRecord[attribute] = null;
  });

  Object.keys(model.relationship).forEach((key) => {
    const { kind } = model.relationship[key];

    if (kind === 'belongsTo') {
      defaultRecord[key] = null;
    } else if (kind === 'hasMany') {
      defaultRecord[key] = [];
    }
  });

  return defaultRecord;
}

/**
 * @param {string} type
 * @param {string} key
 * @param {Object} record
 * @return {string} Record ID
 * @function
 */
function normalizeBelongsTo(type, key, record) {
  if (typeof record === 'string' || record === null) {
    return record;
  }

  if (typeof record === 'object') {
    return record.id;
  }

  throw new Error(`${type}.${key} is an invalid belongsTo relationship`);
}

/**
 * @param {string} type
 * @param {string} key
 * @param {Array} records
 * @return {Array.<string>} ID of records
 * @function
 */
function normalizeHasMany(type, key, records) {
  if (Array.isArray(records)) {
    return records.map((record) => {
      if (typeof record === 'string') {
        return record;
      }

      if (typeof record === 'object' && record !== null) {
        return record.id;
      }

      throw new Error(`${type}.${key} is an invalid hasMany relationship`);
    });
  }

  throw new Error(`${type}.${key} is an invalid hasMany relationship`);
}

/**
 * @param {string} type
 * @param {Object} record
 * @param {Service.Store} store
 * @return {Object} Normalized record
 */
export default function normalize(type, record, store) {
  const model = getOwner(store).lookup(`model:${type}`);
  const preNormalizedRecord = model.normalize(record);
  const normalizedRecord = Object.assign(getDefaultRecord(model), { id: record.id });

  Object.keys(preNormalizedRecord).forEach((key) => {
    if (model.attributes.includes(key)) {
      normalizedRecord[key] = preNormalizedRecord[key];
    } else if (Object.keys(model.relationship).includes(key)) {
      const { kind } = model.relationship[key];

      if (kind === 'belongsTo') {
        normalizedRecord[key] = normalizeBelongsTo(type, key, preNormalizedRecord[key]);
      } else if (kind === 'hasMany') {
        normalizedRecord[key] = normalizeHasMany(type, key, preNormalizedRecord[key]);
      }
    }
  });

  return normalizedRecord;
}
