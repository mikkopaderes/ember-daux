import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default Route.extend({
  store: service('store'),

  beforeModel() {
    this.store.subscribe(() => this.refresh());
  },

  async model() {
    const user = this.modelFor('users.user');

    if (user.posts.length === 0) {
      const batch = this.store.batch();
      const post = { id: 'post_a', message: 'Hello world' };

      batch.set('post', post);
      batch.update('user', user.id, { posts: [post] });
      batch.commit({ isBackgroundOperation: true });
    }

    const { posts } = await this.store.get('user', user.id);

    return posts;
  },
});
