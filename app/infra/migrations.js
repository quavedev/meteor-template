import { Meteor } from 'meteor/meteor';
import { Migrations } from 'meteor/quave:migrations';

Migrations.config({
  log: true,
});

Migrations.add({
  version: 1,
  name: 'Not really migrating anything',
  up() {
    // eslint-disable-next-line no-console
    console.log("I'm a fake migration");
  },
});

Meteor.startup(() => {
  Migrations.migrateTo('latest');
});
