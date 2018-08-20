import Model from 'ember-daux/utils/model';

export default Model.extend({
  attributes: ['name'],
  relationship: {
    country: {
      type: 'country',
      kind: 'belongsTo',
      inverse: null,
    },
    groups: {
      type: 'group',
      kind: 'hasMany',
      inverse: 'members',
    },
    posts: {
      type: 'post',
      kind: 'hasMany',
      inverse: 'author',
    },
  },

  normalize(record) {
    const normalizedRecord = Object.assign({}, record);

    if (record.name.startsWith('123')) {
      normalizedRecord.name = 'Foobar';
    }

    if (record.fooPosts) {
      normalizedRecord.posts = [...record.fooPosts];

      delete normalizedRecord.fooPosts;
    }

    return normalizedRecord;
  },
});
