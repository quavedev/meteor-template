// eslint-disable-next-line import/no-unresolved
import { defineConfig } from '@meteorjs/rspack';

// eslint-disable-next-line import/no-default-export
export default defineConfig((Meteor) => ({
  externals: [/^react-router-dom/],
  ...(Meteor.isClient && {
    module: {
      rules: [
        {
          test: /\.css$/,
          use: ['postcss-loader'],
          type: 'css',
        },
      ],
    },
  }),
}));
