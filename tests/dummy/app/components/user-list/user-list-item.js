import Component from '@ember/component';
import layout from '../../templates/components/user-list/user-list-item';

export default Component.extend({
  layout,
  tagName: 'li',
  classNames: ['fade-in'],
});
