import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

import '../app/clicks/clicksMethods';
import '../app/clicks/clicksPublishes';

Accounts.emailTemplates.siteName =
  Meteor.settings?.public?.appInfo?.name || process.env.ROOT_URL;

Meteor.startup(() => {});
