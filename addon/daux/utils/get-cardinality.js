/**
 * @param {Object} model
 * @param {string} type
 * @param {string} attribute
 * @return {string} Cardinality
 * @function
 */
export default function getCardinality(model, type, attribute) {
  const meta = model[type].relationship[attribute];

  if (meta.kind === 'belongsTo') {
    if (meta.inverse) {
      const inverseMeta = model[meta.type].relationship[meta.inverse];

      if (inverseMeta.kind === 'belongsTo') {
        return 'oneToOne';
      }

      return 'oneToMany';
    }

    return 'oneToNone';
  }

  if (meta.inverse) {
    const inverseMeta = model[meta.type].relationship[meta.inverse];

    if (inverseMeta.kind === 'belongsTo') {
      return 'oneToMany';
    }

    return 'manyToMany';
  }

  return 'manyToNone';
}
