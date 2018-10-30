import { Model } from 'daux';

export default class Post extends Model {
  static get attributes() {
    return ['message'];
  }

  static get relationship() {
    return {
      author: {
        type: 'user',
        kind: 'belongsTo',
        inverse: 'posts',
      },
    };
  }
}
