# Changelog

## 0.0.7 (2025-01-30)

- Upgrades to Tailwind CSS 4.0.0

## 0.0.6 (2024-09-25)

- Upgrades to React 19 RC
- Upgrades to Meteor 3.0.3
  - Updates Dockerfile to run in zCloud with Meteor 3.0.3 
- Removes dependencies from `@headlessui/react` and `@heroicons/react`

## 0.0.5 (2023-04-12)

- Upgrades Meteor version to 2.11.0
- Upgrades all dependencies to latest.
- Adding Dockerfile to create container image to run app
- Adding [zcloud.ws](https://zcloud.ws) instructions to deploy
- Adding [Meteor up](https://meteor-up.com/) config example to running using [zcloud.ws](https://zcloud.ws) images

## 0.0.4 (2023-02-27)

- Upgrades Meteor version to 2.10.
- Upgrades all dependencies to latest.
- Includes conditional router rendering supporting:
  - Pages for authenticated people only (LoggedLayout) 
  - Pages for anonymous people only (AnonymousLayout) 
  - Pages for all people (PublicLayout) 

## 0.0.3 (2022-01-28)

- Upgrades Meteor version to 2.6-rc.1 from 2.5.5.

## 0.0.2 (2022-01-19)

- Fixes tailwind.config.js: it was purging wrong paths.
- Upgrades Meteor version to 2.5.5 from 2.5.3.
- Fixes app name in passwordless emails.

## 0.0.1 (2022-01-17)

- Initial version.
