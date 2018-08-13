import Model from 'ember-daux/utils/model';

export default Model.extend({
  attributes: ['message'],
  relationship: {
    author: {
      type: 'user',
      kind: 'belongsTo',
      inverse: 'posts',
    },
  },
});
