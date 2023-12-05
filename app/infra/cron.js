/* eslint-disable newline-per-chained-call */
import { SyncedCron } from 'meteor/quave:synced-cron';
import { Meteor } from 'meteor/meteor';

SyncedCron.config({
  log: true,
});

Meteor.startup(() => {
  SyncedCron.add({
    name: 'I run every 5 seconds',
    schedule: (parser) => parser.text('every 5 seconds'),
    job: () => {
      // eslint-disable-next-line no-console
      console.log('cron job running');
    },
  });
  SyncedCron.start();
});
