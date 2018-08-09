import Component from '@ember/component';
import layout from '../templates/components/user-list';

export default Component.extend({
  layout,
  randomId: Math.random().toString(32).slice(2).substr(0, 5),
});
