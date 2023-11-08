import { Meteor } from 'meteor/meteor';
import { ClicksCollection } from './ClicksCollection';

Meteor.methods({
  'clicks.increment': async function incrementCount() {
    const loggedUser = Meteor.user();

    ClicksCollection.upsert(
      {},
      { $inc: { count: 1 }, $set: { loggedUserId: loggedUser._id } }
    );
  },
});
