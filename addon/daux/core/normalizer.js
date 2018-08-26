import getDefaultRecord from '../utils/get-default-record';

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
 * @param {Object} model
 * @param {string} type
 * @param {string} id
 * @param {Object} record
 * @return {Object} Record with default values
 * @function
 */
function normalizeRecord(model, type, id, record) {
  const modelForType = model[type];
  const normalizedRecord = { id };

  modelForType.attributes.forEach((attribute) => {
    normalizedRecord[attribute] = record[attribute] || null;
  });

  Object.keys(modelForType.relationship).forEach((relationshipKey) => {
    if (modelForType.relationship[relationshipKey].kind === 'belongsTo') {
      normalizedRecord[relationshipKey] = normalizeBelongsTo(record[relationshipKey]);
    } else {
      normalizedRecord[relationshipKey] = normalizeHasMany(record[relationshipKey]);
    }
  });

  return normalizedRecord;
}

/**
 * @param {Object} model
 * @param {string} type
 * @param {Object} record
 * @return {Object} Normalized record
 */
export function normalize(model, type, record) {
  const preNormalizedRecord = model[type].normalize(record);

  return normalizeRecord(model, type, record.id, preNormalizedRecord);
}

/**
 * @param {Daux.Core.Store} store
 * @param {string} type
 * @param {string} id
 * @param {number} [nestLevel=0]
 * @return {Object} Denormalized record
 */
export function denormalize(store, type, id, nestLevel = 0) {
  const record = Object.assign(
    getDefaultRecord(store, type),
    store.state[type].data[id],
    { id },
  );
  const { relationship } = store.model[type];

  Object.keys(relationship).forEach((relationshipKey) => {
    const meta = relationship[relationshipKey];

    if (meta.kind === 'belongsTo') {
      if (record[relationshipKey]) {
        if (nestLevel < 3) {
          record[relationshipKey] = denormalize(
            store,
            meta.type,
            record[relationshipKey],
            nestLevel + 1,
          );
        } else {
          record[relationshipKey] = { id: record[relationshipKey] };
        }
      } else {
        record[relationshipKey] = null;
      }
    } else if (meta.kind === 'hasMany') {
      // const hasManyRecords = getHasManyRecords(store, type, record, relationshipKey);

      record[relationshipKey] = record[relationshipKey].map((hasManyRecordId) => {
        if (nestLevel < 3) {
          return denormalize(store, meta.type, hasManyRecordId, nestLevel + 1);
        }

        return { id: hasManyRecordId };
      });
    }
  });

  return record;
}
