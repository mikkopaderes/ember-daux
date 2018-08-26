import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

export default Controller.extend({
  store: service('store'),
  newRepoName: null,

  handleRepoNameInput(value) {
    this.set('newRepoName', value);
  },

  handleFormSubmit(event) {
    event.preventDefault();

    const repoIdToUpdate = this.model[0].id;

    this.store.update('repo', repoIdToUpdate, { name: this.newRepoName });
  },
});
