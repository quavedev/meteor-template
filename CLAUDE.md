# Meteor 3 Template - Universal Project Guidelines

## Project Overview
A modern Meteor 3 application template with React 19, Tailwind CSS 4, and MongoDB. Designed for rapid development with consistent code standards and best practices.

## Tech Stack
- **Framework**: Meteor 3
- **Frontend**: React 19 RC with React Router
- **Styling**: Tailwind CSS 4
- **Database**: MongoDB
- **Schema**: SimpleSchema
- **Build Tools**: Babel, PostCSS
- **Code Quality**: ESLint (@quave/eslint-config-quave), Prettier, Lefthook

## Universal Code Standards

### Language & Architecture
- **JavaScript only** - Never use TypeScript
- **Functional programming always** - Avoid mutations and imperative patterns
- **Named parameters** - Always use objects with named properties instead of args when defining functions
- **Named functions** - Anonymous functions are not accepted, always give functions names
- **ES6+ features** - Use modern JavaScript appropriately

### Code Organization Principles
- **Feature-based folders** - Group by domain (users/, components/, etc.)
- **Single responsibility** - One component/collection per file
- **Consistent naming** - Follow established patterns across all features
- **Relative imports** - Don't rely on tooling to resolve imports

### Quality Gates
**CRITICAL**: Before finishing any task, ALWAYS run:
1. `npm run quave-check` (ESLint + Prettier)  
2. Fix any ESLint errors or warnings
3. Only mark tasks complete after passing lint checks

### Security & Performance
- **User isolation** - Always filter queries by `userId`
- **Input validation** - Use SimpleSchema and `check()` for all inputs
- **Async patterns** - Use Meteor 3 async APIs throughout
- **Index optimization** - Create indexes for frequently queried fields

## Project Structure
```
app/
├── access/           # Access control logic
├── components/       # Reusable UI components
├── general/          # App routing and core logic
├── home/            # Home page and main features
├── infra/           # Infrastructure (cron, APIs, migrations)
├── layouts/         # Page layouts
├── users/           # User management
└── [other domains]  # Feature-specific modules
```

## Core Development Principles
- **Data ownership**: All data must be associated with userId
- **Mobile-first**: Responsive design with Tailwind CSS
- **Dark theme**: Default styling approach
- **User-centric**: Design with user experience as priority

## Development Workflow
```bash
# Start development
npm start

# Code quality (run before every commit)
npm run quave-check

# Package management
meteor npm install [package]  # Always prefix with meteor
```

## Database Overview
Template includes common collections structure:
- `users`: User account information and preferences
- `userSettings`: User configuration data
- Standard Meteor accounts collections for authentication

## Specialized Agent Usage
When working on specific aspects of the project, Claude will automatically use specialized agents:
- **React components**: Uses react-agent for React 19 + hooks patterns
- **Meteor APIs**: Uses meteor-agent for async method patterns
- **Database work**: Uses data-agent for schema and validation
- **Styling**: Uses tailwind-agent for utility-first CSS
- **Code quality**: Uses code-style-agent for linting standards
- **Version control**: Uses git-agent for commit conventions
- **UI/UX**: Uses ui-design-agent for responsive design
- **JavaScript**: Uses javascript-agent for file organization

This ensures consistent application of domain-specific best practices while maintaining universal project standards.
