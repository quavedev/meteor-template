import { Meteor } from 'meteor/meteor';
import { ClicksCollection } from './ClicksCollection';

Meteor.methods({
  'clicks.increment': async function incrementCount() {
    await ClicksCollection.upsertAsync({}, { $inc: { count: 1 } });
  },
});
