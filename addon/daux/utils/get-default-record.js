/**
 * @param {Daux.Core.Store} store
 * @param {string} type
 * @return {Object} Default record
 */
export default function getDefaultRecord(store, type) {
  const defaultRecord = {};
  const modelForType = store.model[type];

  modelForType.attributes.forEach((attribute) => {
    defaultRecord[attribute] = null;
  });

  Object.keys(modelForType.relationship).forEach((relationshipKey) => {
    if (modelForType.relationship[relationshipKey].kind === 'belongsTo') {
      defaultRecord[relationshipKey] = null;
    } else {
      defaultRecord[relationshipKey] = [];
    }
  });

  return defaultRecord;
}
