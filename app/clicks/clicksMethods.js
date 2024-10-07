import { Meteor } from 'meteor/meteor';
import { ClicksCollection } from './ClicksCollection';
import { UsersCollection } from '../users/UsersCollection';

Meteor.methods({
  'clicks.increment': async function incrementCount() {
    await ClicksCollection.upsertAsync({}, { $inc: { count: 1 } });
  },
  'clicks.doubleIncrementGmail': async function incrementCount() {
    const { userId } = this;
    const user = await UsersCollection.findOneAsync(userId);
    if (!user?.emails[0].address.includes('@gmail')) {
      throw new Meteor.Error('Not Allowed', 'Only for gmail users');
    }
    await ClicksCollection.upsertAsync({}, { $inc: { count: 2 } });
  },
  'clicks.invalidUpdate': async function incrementCount() {
    await ClicksCollection.upsertAsync({}, { $set: { count: 'not a number' } });
  },
});
