# inflow-materialize

Business-friendly materialized views for Inflow Inventory data with type-safe Drizzle schemas.

Use with [inflow-get](https://npm.im/inflow-get) to create useful views for frontend consumption.

## Installation

```bash
npm install inflow-materialize inflow-get drizzle-orm
```

## Usage

### Basic Usage (Raw SQL)

```typescript
import { getDb } from 'inflow-get';
import { createViews } from 'inflow-materialize';

const db = getDb('./inflow.db');
createViews(db);

// Query views with raw SQL
const lowStock = db.prepare('SELECT * FROM reorder_alerts').all();
```

### Type-Safe Queries (Drizzle)

```typescript
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { createViews } from 'inflow-materialize';
import { reorderAlerts, productVelocity } from 'inflow-materialize/schemas';

const sqlite = new Database('./inflow.db');
createViews(sqlite);

const db = drizzle(sqlite);

// Fully typed queries!
const alerts = db.select().from(reorderAlerts).all();
//    ^? { productId: string, sku: string | null, ... }[]

const fastMovers = db
  .select()
  .from(productVelocity)
  .where(eq(productVelocity.velocityTier, 'FAST'))
  .all();
```

## Views

### Dashboard Layer (Company-Wide)

| View | Purpose |
|------|---------|
| `product_inventory_status` | Product card with global inventory + reorder flag |
| `reorder_alerts` | Products below reorder point with vendor + cost |
| `open_orders_unified` | PO + SO + MO pipeline (all open work) |

### Operational Layer (Location-Aware)

| View | Purpose |
|------|---------|
| `inventory_by_location` | Product summary broken out by location |
| `location_stock_summary` | Aggregate stock value/count per location |
| `location_reorder_alerts` | Per-location reorder points |
| `transfer_pipeline` | Open transfers between locations |

### Expert Layer (Full Granularity)

| View | Purpose |
|------|---------|
| `inventory_detail` | Inventory lines with sublocation, serial, lot |
| `stock_movement_ledger` | UNION of all stock movements |
| `lot_inventory` | Lot-level tracking with expiry estimation |
| `serial_inventory` | Serial number tracking with current location |

### Business Analytics

| View | Purpose |
|------|---------|
| `customer_360` | Customer + revenue + order count + open orders |
| `vendor_scorecard` | Vendor + products supplied + PO history |
| `product_margin` | Product price vs vendor cost = margin |
| `bom_costed` | Bill of materials with component costs rolled up |
| `category_inventory_summary` | Stock value/count by category |

### Time-Series / History

| View | Purpose |
|------|---------|
| `order_history` | All completed orders with line details |
| `product_velocity` | Sales rate with 7/30/90 day windows |
| `dead_stock` | Products with no movement in 30+ days |

## API

### `createViews(db, options?)`

Create all views in the database.

```typescript
createViews(db);

// With options
createViews(db, {
  dropExisting: true,  // Drop and recreate (default: true)
  only: ['reorder_alerts', 'product_velocity'],  // Only specific views
});
```

### `dropViews(db, only?)`

Drop views from the database.

```typescript
dropViews(db);  // Drop all
dropViews(db, ['reorder_alerts']);  // Drop specific
```

### Raw SQL Exports

Each view exports its SQL for direct use:

```typescript
import { reorderAlertsSQL, productVelocitySQL } from 'inflow-materialize';

db.exec(reorderAlertsSQL);
```

### Drizzle Schemas

Import from `/schemas` for type-safe queries:

```typescript
import {
  productInventoryStatus,
  reorderAlerts,
  productVelocity,
  deadStock,
  // ... all 18 views
} from 'inflow-materialize/schemas';
```

## Related Packages

- [inflow-get](https://npm.im/inflow-get) - Seeds SQLite from Inflow API
- [inflow-client](https://npm.im/inflow-client) - API client with auth/rate limiting
- [inflow-api-types](https://npm.im/inflow-api-types) - Zod schemas for API responses

## License

ISC
