import { Model } from 'daux';

export default class User extends Model {
  static get attributes() {
    return ['name'];
  }

  static get relationship() {
    return {
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
    };
  }

  static normalize(record) {
    const normalizedRecord = Object.assign({}, record);

    if (record.name.startsWith('123')) {
      normalizedRecord.name = 'Foobar';
    }

    if (record.fooPosts) {
      normalizedRecord.posts = [...record.fooPosts];

      delete normalizedRecord.fooPosts;
    }

    return normalizedRecord;
  }
}
