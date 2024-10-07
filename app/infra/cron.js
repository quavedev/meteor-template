/* eslint-disable newline-per-chained-call */
import { SyncedCron } from 'meteor/quave:synced-cron';
import { Meteor } from 'meteor/meteor';

SyncedCron.config({
  log: true,
});

function sleepSeconds(number) {
  return new Promise((resolve) => {
    setTimeout(resolve, number * 1000);
  });
}

Meteor.startup(() => {
  SyncedCron.add({
    name: 'I run every 1 minute for 10 seconds',
    schedule: (parser) => parser.text('every 1 minute'),
    job: async () => {
      // eslint-disable-next-line no-console
      console.log(`I'll start now ${new Date()}`);
      await sleepSeconds(10);
      // eslint-disable-next-line no-console
      console.log(`I've finished now ${new Date()}`);
    },
    onSuccess: async ({ intendedAt }) => {
      // eslint-disable-next-line no-console
      console.log(
        `cron job finished after persist in the database now ${new Date()}, I took ${new Date() - intendedAt}ms`
      );
    },
    onError: async ({ error, intendedAt }) => {
      console.error(
        `cron job errored after persist in the database now ${new Date()}, I took ${new Date() - intendedAt}ms`,
        error
      );
    },
  });
  SyncedCron.start();
});
