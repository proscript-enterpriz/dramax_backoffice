# Commands & environment

Common commands

```bash
# Development
npm run dev           # Start dev server
npm run build         # Build for production
npm run start         # Start production server
npm run lint          # Run ESLint

# Service generation (project-specific)
npm run gen:services  # Generate services from OpenAPI
```

Important environment variables

```
BATAR_DOMAIN="http://localhost:3000/api/v1"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

Notes

- Keep secrets out of source control and use `.env.local` for local development.
- The `gen:services` command is used to create typed API clients from OpenAPI when required; check existing services before generating.

