import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

import '../app/infra/migrations';
import '../app/infra/cron';

import '../app/clicks/clicksMethods';
import '../app/clicks/clicksPublishes';

import './rest';

Accounts.emailTemplates.siteName =
  Meteor.settings?.public?.appInfo?.name || process.env.ROOT_URL;

Meteor.startup(() => {});
