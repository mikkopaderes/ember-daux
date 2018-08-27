import EmberObject from '@ember/object';

import Country from './country';
import Group from './group';
import Post from './post';
import User from './user';

export default EmberObject.extend({
  model: {
    country: Country,
    group: Group,
    post: Post,
    user: User,
  },
});
