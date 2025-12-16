# inflow-materialize

Business-friendly materialized views for Inflow Inventory data.

## What This Is

A library that creates SQLite views on top of an `inflow-get` database. These views pre-join and pre-compute common business queries so frontends don't have to.

## Architecture

```
inflow-get (seeds SQLite)  →  inflow-materialize (creates views)  →  Frontend queries views
```

## Views

| View | Purpose |
|------|---------|
| `product_inventory_status` | Product card with inventory + reorder status |
| `reorder_alerts` | Products below reorder point (filtered) |
| `open_orders_unified` | POs + SOs + MOs in one pipeline view |

## Usage

```typescript
import { createDb } from 'inflow-get';
import { createViews } from 'inflow-materialize';

const db = createDb('./inflow.db');
createViews(db.$sqlite);

// Query the views directly
db.$sqlite.prepare('SELECT * FROM reorder_alerts').all();
```

## Development

```bash
npm install
npm run build    # Compile TypeScript
npm run dev      # Watch mode
```

## Publishing

```bash
npm version patch|minor|major
npm publish
```

## File Structure

- `src/views/` - Individual view definitions (Drizzle + raw SQL)
- `src/create-views.ts` - `createViews()` and `dropViews()` utilities
- `src/index.ts` - Main exports

## Related Packages

- `inflow-get` - Seeds SQLite from Inflow API
- `inflow-client` - API client with auth/rate limiting
- `inflow-api-types` - Zod schemas for API responses
