// eslint-disable-next-line import/no-unresolved
import { defineConfig } from '@meteorjs/rspack';

/**
 * Rspack configuration for Meteor projects.
 *
 * Provides typed flags on the `Meteor` object, such as:
 * - `Meteor.isClient` / `Meteor.isServer`
 * - `Meteor.isDevelopment` / `Meteor.isProduction`
 * - …and other flags available
 *
 * Use these flags to adjust your build settings based on environment.
 */
// eslint-disable-next-line import/no-default-export
export default defineConfig((Meteor) => ({
  // Mark react-router-dom as external so Meteor handles its compilation
  // This is needed because React atmosphere packages (quave:alert-react-tailwind)
  // depend on the Router context state. To keep this context compatible with Rspack code,
  // Meteor must process it.
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
  ignoreWarnings: [
    {
      // Ignore harmless warning requesting option support-color dependency for debug dep
      module: /debug[\\/]src[\\/]node\.js/,
      message: /Can't resolve 'supports-color'/,
    },
  ],
}));
