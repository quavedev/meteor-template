# Changelog

## 0.0.9 (2025-11-19)

- Adds Rspack bundler support with React Compiler integration
- Adds server health monitoring with real-time status component
- Adds memory metrics using V8 heap statistics for accurate Node.js memory tracking
- Adds controlled memory leak simulation for testing (start/stop/cleanup)
- Adds sticky session management for load balancer scenarios
- Adds Prometheus metrics endpoint (`/api/metrics`)
- Adds Monti APM agent for performance monitoring
- Enables modern browser target in package.json
- Updates Docker base images to Meteor 3.3

## 0.0.8 (2025-08-03)

- Upgrades Meteor to 3.3
- Upgrades npm dependencies
- Adds Claude Code files (CLAUDE.md and specialized agents)

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
- Adding [qauve.cloud](https://quave.cloud) instructions to deploy

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
