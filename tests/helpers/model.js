import { Model } from 'ember-daux/daux';

/**
 * @class Country
 * @extends Daux.Core.Model
 */
class Country extends Model {
  /**
   * @override
   */
  static get attributes() {
    return ['name'];
  }
}

/**
 * @class Country
 * @extends Daux.Core.Model
 */
class Group extends Model {
  /**
   * @override
   */
  static get attributes() {
    return ['name'];
  }

  /**
   * @override
   */
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

/**
 * @class Country
 * @extends Daux.Core.Model
 */
class Post extends Model {
  /**
   * @override
   */
  static get attributes() {
    return ['message'];
  }

  /**
   * @override
   */
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

/**
 * @class Country
 * @extends Daux.Core.Model
 */
class Username extends Model {
  /**
   * @override
   */
  static get relationship() {
    return {
      user: {
        type: 'user',
        kind: 'belongsTo',
        inverse: 'username',
      },
    };
  }
}

/**
 * @class Country
 * @extends Daux.Core.Model
 */
class User extends Model {
  /**
   * @override
   */
  static get attributes() {
    return ['name'];
  }

  /**
   * @override
   */
  static get relationship() {
    return {
      blockedUsers: {
        type: 'user',
        kind: 'hasMany',
        inverse: null,
      },
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
      username: {
        type: 'username',
        kind: 'belongsTo',
        inverse: 'user',
      },
    };
  }

  /**
   * @override
   */
  static normalize(record) {
    const normalizedRecord = Object.assign({}, record);

    if (record.country === 'm0naco') {
      normalizedRecord.country = 'monaco';
    }

    return normalizedRecord;
  }
}

export default {
  country: Country,
  group: Group,
  post: Post,
  username: Username,
  user: User,
};
