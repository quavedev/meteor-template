import { Meteor } from 'meteor/meteor';
import { ClicksCollection } from './ClicksCollection';

Meteor.publish('countData', () => ClicksCollection.find());
