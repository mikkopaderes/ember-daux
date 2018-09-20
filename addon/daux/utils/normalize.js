/**
 * @param {Object} record
 * @return {string|null} Record ID
 * @function
 */
function normalizeBelongsTo(record) {
  if (typeof record === 'string' || record === null) {
    return record;
  }

  if (typeof record === 'object') {
    return record.id;
  }

  return null;
}

/**
 * @param {Array.<Object>} records
 * @return {Array.<string>} Record IDs
 * @function
 */
function normalizeHasMany(records) {
  if (Array.isArray(records)) {
    return records.map((record) => {
      if (typeof record === 'string') {
        return record;
      }

      return record.id;
    });
  }

  return [];
}

/**
 * @param {Daux.Core.Model} model
 * @param {Object} record
 * @return {Object} Normalized record
 */
export default function normalize(model, record) {
  const normalizedRecord = { id: record.id };

  model.attributes.forEach((attribute) => {
    normalizedRecord[attribute] = Object.prototype.hasOwnProperty.call(record, attribute)
      ? record[attribute]
      : null;
  });

  Object.keys(model.relationship).forEach((relationshipKey) => {
    if (model.relationship[relationshipKey].kind === 'belongsTo') {
      normalizedRecord[relationshipKey] = normalizeBelongsTo(record[relationshipKey]);
    } else {
      normalizedRecord[relationshipKey] = normalizeHasMany(record[relationshipKey]);
    }
  });

  return normalizedRecord;
}
