import { Model } from 'ember-daux/daux';

export default class Group extends Model {
  static get attributes() {
    return ['name'];
  }

  static get relationship() {
    return {
      members: {
        type: 'user',
        kind: 'hasMany',
        inverse: 'groups',
      },
    };
  }
}
