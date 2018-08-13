import Model from 'ember-daux/utils/model';

export default Model.extend({
  attributes: ['name'],
  relationship: {
    members: {
      type: 'user',
      kind: 'hasMany',
      inverse: 'groups',
    },
  },
});
