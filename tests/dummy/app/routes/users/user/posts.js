import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default Route.extend({
  store: service('store'),

  beforeModel() {
    this.store.subscribe(() => this.refresh());
  },

  model() {
    const user = this.modelFor('users.user');

    if (user.posts.length === 0) {
      const batch = this.store.batch();
      const post = { id: 'post_a', message: 'Hello world' };

      batch.add('post', post);
      batch.update('user', user.id, { posts: [post] });
      batch.commit({ isBackgroundOperation: true });
    }

    return this.store.get('user', user.id).posts;
  },
});
