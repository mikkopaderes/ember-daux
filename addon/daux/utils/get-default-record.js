/**
 * @param {Daux.Core.Model} model
 * @return {Object} Default record
 */
export default function getDefaultRecord(model) {
  const defaultRecord = {};

  model.attributes.forEach((attribute) => {
    defaultRecord[attribute] = null;
  });

  Object.keys(model.relationship).forEach((relationshipKey) => {
    if (model.relationship[relationshipKey].kind === 'belongsTo') {
      defaultRecord[relationshipKey] = null;
    } else {
      defaultRecord[relationshipKey] = [];
    }
  });

  return defaultRecord;
}
