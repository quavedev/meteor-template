import { Meteor } from 'meteor/meteor';
import { ClicksCollection } from './ClicksCollection';

Meteor.methods({
  'clicks.increment': function incrementCount() {
    ClicksCollection.upsert({}, { $inc: { count: 1 } });
  },
});
