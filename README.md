# Meteor template by quave

[quave.dev](https://www.quave.dev)

Start your Meteor project with this template if you want to use React and TailwindCSS.

## What is it?

It's a template project ready for you to implement your business idea. It includes:
- sign-up and sign-in using email (passwordless authentication)
- router setup
- basic styles
- in-app alert system
- email system

## Dependencies

### Npm packages for React:
- react
- react-dom
- react-router-dom

### Npm packages for TailwindCSS:
- tailwindcss
- @headlessui/react
- @heroicons/react

### Meteor packages for React:
- [react-meteor-data](https://github.com/meteor/react-packages/tree/master/packages/react-meteor-data)

### Meteor packages for MongoDB:
- [quave:collections](https://github.com/quavedev/collections)

### Meteor packages for Authentication:
- [quave:accounts-passwordless-react](https://github.com/quavedev/accounts-passwordless-react)
- quave:alert-react-tailwind

### Meteor packages for Email:
- [quave:email-postmark](https://github.com/quavedev/email-postmark)
  
### Meteor packages for Alerts:
- quave:logged-user-react

## Set up your project

### Replace our placeholders

#### Inform your app info
- Fill the fields inside the settings in `public.appInfo` to make sure your app works properly.

#### Sending emails with Postmark
- Sign up for a [Postmark account](https://postmarkapp.com/signup) 
  - replace the following property with your postmark API KEY in the settings: `YOUR_API_TOKEN`
- Follow the steps to verify your domain in their website
  - replace the following property with your desired `from` for the emails in the settings: `YOUR_FROM_EMAIL@yourdomain.com`

## Updating your project

If you want to keep your project up-to-date with the changes made here, read our [CHANGELOG](CHANGELOG.md).

## Changes made to the initial Meteor React skeleton

- added Meteor packages listed above as dependencies
- added NPM packages listed above as dependencies
- configured eslint
- configured prettier
- configured eslint rules according to quave's recommendations
- removed npm scripts besides start
- added npm script `quave-eslint`
- added npm script `quave-prettier`
- added npm script `quave-check`
- configured husky
- renamed `.jsx` files to `.js`
- configured tailwindcss
- removed test folder
- removed imports folder
- configured WebStorm runner to exclude unused architectures: `meteor --exclude-archs web.browser.legacy,web.cordova`
- reorganized App.js file to be inside `app/general` directory
- used Router provider in App.js to allow React Router
- used AlertProvider in App.js to allow `quave:alert-react-tailwind`
- created sample Home page
- created sample Access page
