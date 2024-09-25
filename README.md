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
