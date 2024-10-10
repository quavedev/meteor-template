import { createCollection } from 'meteor/quave:collections';
import SimpleSchema from 'simpl-schema';

const ClickSchema = new SimpleSchema({
  count: {
    type: SimpleSchema.Integer,
    defaultValue: 0,
  },
});

export const ClicksCollection = createCollection({
  name: 'clicks',
  schema: ClickSchema,
  helpers: {
    getCountText() {
      return `${this.count}x`;
    },
  },
});
