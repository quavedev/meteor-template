# Meteor Template by Quave

[quave.dev](https://www.quave.dev)

A modern Meteor 3 application template showcasing Quave's best practices for building production-ready applications with React 19, Tailwind CSS 4, and MongoDB.

## What is it?

This template demonstrates how Quave builds Meteor applications. It includes a complete setup with authentication, routing, styling, monitoring, and development tooling - everything you need to start building your application.

## Tech Stack

- **Framework**: Meteor 3.3
- **Frontend**: React 19 with React Compiler
- **Styling**: Tailwind CSS 4
- **Database**: MongoDB
- **Bundler**: Rspack (optional, for faster builds)
- **Code Quality**: ESLint, Prettier, Lefthook

## Features

### Authentication
- Passwordless email authentication via [quave:accounts-passwordless-react](https://github.com/quavedev/accounts-passwordless-react)
- Logged user state management via quave:logged-user-react

### Routing
- React Router setup with conditional layouts:
  - `LoggedLayout` - Pages for authenticated users only
  - `AnonymousLayout` - Pages for non-authenticated users only
  - `PublicLayout` - Pages accessible to everyone

### Styling
- Tailwind CSS 4 with PostCSS
- Dark theme default
- In-app alert system via quave:alert-react-tailwind

### Database
- MongoDB with [quave:collections](https://github.com/quavedev/collections)
- SimpleSchema validation

### Email
- Postmark integration via [quave:email-postmark](https://github.com/quavedev/email-postmark)

### Background Jobs
- Synced cron jobs via [quave:synced-cron](https://github.com/quavedev/meteor-packages/tree/main/synced-cron)

### Migrations
- Database migrations via [quave:migrations](https://github.com/quavedev/meteor-packages/tree/main/migrations)

### Monitoring & Observability
- **Server Health Monitoring**: Real-time memory metrics with V8 heap statistics
- **Prometheus Metrics**: Exposed at `/api/metrics` via prom-client
- **Monti APM**: Performance monitoring with montiapm:agent

### Development Tools
- **Rspack**: Fast bundler with React Compiler support
- **Claude Code**: AI-assisted development with specialized agents
- **ESLint**: Code linting with @quave/eslint-config-quave
- **Prettier**: Code formatting
- **Lefthook**: Git hooks

### Server Features
- **Memory Leak Simulation**: Test memory behavior with controlled leak endpoints
- **Sticky Session Management**: Handle load balancer session affinity
- **Health Check API**: Monitor server status via `/api/check-reconnection`

## Dependencies

### NPM Packages
- react, react-dom (v19)
- react-router-dom
- react-error-boundary
- tailwindcss
- simpl-schema
- prom-client

### Meteor Packages
- react-meteor-data
- quave:collections
- quave:accounts-passwordless-react
- quave:logged-user-react
- quave:alert-react-tailwind
- quave:synced-cron
- quave:migrations
- quave:email-postmark
- montiapm:agent
- rspack
- zodern:types

### Other Quave Packages (not included)
- [quave:slingshot](https://github.com/quavedev/meteor-packages/tree/main/meteor-slingshot) - File uploads to AWS, CloudFlare, OCI

## Project Structure

```
app/
├── access/           # Access control logic
├── components/       # Reusable UI components
├── general/          # App routing and core logic
├── home/             # Home page features
├── infra/            # Infrastructure (cron, migrations)
├── layouts/          # Page layouts
├── server/           # Server-side methods
├── users/            # User management
└── [domains]/        # Feature-specific modules

server/
├── health.js         # Server health monitoring
├── metrics.js        # Prometheus metrics
├── rest.js           # REST API endpoints
└── main.js           # Server entry point

.claude/
├── agents/           # Specialized AI agents
└── settings.json     # Claude Code configuration
```

## Getting Started

### Prerequisites
- Node.js 20+
- Meteor 3.3+

### Installation

```bash
# Clone the template
git clone https://github.com/quavedev/meteor-template.git my-app
cd my-app

# Install dependencies
meteor npm install

# Start development server
meteor npm start
```

### Configuration

#### App Settings
Fill in `private/env/dev/settings.json` with your app configuration:
- `public.appInfo` - Application metadata

#### Email (Postmark)
1. Sign up at [postmarkapp.com](https://postmarkapp.com/signup)
2. Verify your domain
3. Update settings with your API key and sender email

#### Monti APM (Optional)
1. Sign up at [montiapm.com](https://montiapm.com)
2. Add your app ID and secret to settings

## Development

### Commands

```bash
# Start development server
meteor npm start

# Run code quality checks (ESLint + Prettier)
meteor npm run quave-check

# Individual tools
meteor npm run quave-eslint
meteor npm run quave-prettier
```

### Code Quality

Always run `npm run quave-check` before committing. The template uses:
- ESLint with @quave/eslint-config-quave
- Prettier for formatting
- React Compiler lint rules
- Lefthook for pre-commit hooks

### API Endpoints

- `GET /api` - Basic health check
- `GET /api/metrics` - Prometheus metrics
- `GET /api/check-reconnection` - Server health status
- `POST /api/clear-sticky-session` - Clear load balancer session
- `POST /api/memory-leak/start` - Start memory leak simulation
- `POST /api/memory-leak/stop` - Stop memory leak
- `POST /api/memory-leak/cleanup` - Clean up leaked memory

## Deployment

### Docker

The template includes a Dockerfile configured for Meteor 3.3. Build and deploy to any container platform.

### zCloud

See [quave.cloud](https://quave.cloud) for Meteor-optimized hosting with:
- Automatic scaling
- Sticky session support
- MongoDB hosting

## Updating

Keep your project up-to-date with template changes by reviewing the [CHANGELOG](CHANGELOG.md).

## License

MIT

## Support

- [Quave Website](https://www.quave.dev)
- [GitHub Issues](https://github.com/quavedev/meteor-template/issues)
