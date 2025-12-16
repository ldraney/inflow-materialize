# inflow-materialize

Business-friendly materialized views for Inflow Inventory data. Use with [inflow-get](https://npm.im/inflow-get) to create useful views for frontend consumption.

## Installation

```bash
npm install inflow-materialize inflow-get
```

## Usage

```typescript
import { getDb } from 'inflow-get';
import { createViews } from 'inflow-materialize';

// Get your seeded database from inflow-get
const db = getDb('./inflow.db');

// Create all materialized views
createViews(db);

// Query the views
const lowStock = db.prepare('SELECT * FROM reorder_alerts').all();
const pipeline = db.prepare('SELECT * FROM open_orders_unified ORDER BY expected_date').all();
const products = db.prepare('SELECT * FROM product_inventory_status WHERE is_active = 1').all();
```

## Views

### `product_inventory_status`

The "product card" view - everything you need to display a product's current inventory position.

| Column | Description |
|--------|-------------|
| `product_id`, `sku`, `name` | Product identifiers |
| `category_name` | Resolved category name |
| `quantity_on_hand` | Physical stock |
| `quantity_available` | Sellable stock (on hand - reserved) |
| `quantity_on_purchase_order` | Incoming from vendors |
| `reorder_point`, `reorder_quantity` | Reorder settings |
| `is_below_reorder` | 1 if needs reordering, 0 otherwise |
| `preferred_vendor_id` | Default vendor for reordering |

### `reorder_alerts`

Products that need to be reordered - filtered to only items below reorder point.

| Column | Description |
|--------|-------------|
| `product_id`, `sku`, `product_name` | Product identifiers |
| `quantity_available` | Current sellable stock |
| `reorder_point` | Threshold that triggered alert |
| `shortfall_quantity` | How much below reorder point |
| `suggested_order_quantity` | Recommended order qty |
| `vendor_name`, `vendor_cost` | Preferred vendor info |
| `lead_time_days` | Expected delivery time |
| `estimated_order_value` | Cost estimate for PO |

### `open_orders_unified`

Single pipeline view of all open work - POs, SOs, and Manufacturing Orders unified.

| Column | Description |
|--------|-------------|
| `order_id`, `order_number` | Order identifiers |
| `order_type` | `purchase_order`, `sales_order`, or `manufacturing_order` |
| `status` | Current order status |
| `order_date`, `expected_date` | Timeline |
| `counterparty_name` | Vendor/Customer/Product name |
| `counterparty_type` | `vendor`, `customer`, or `product` |
| `location_name` | Destination/source location |
| `total` | Order value (or quantity for MOs) |

## API

### `createViews(db, options?)`

Create all views in the database.

```typescript
createViews(db);

// Or with options
createViews(db, {
  dropExisting: true,  // Drop and recreate (default: true)
  only: ['reorder_alerts'],  // Only specific views
});
```

### `dropViews(db, only?)`

Drop views from the database.

```typescript
dropViews(db);  // Drop all
dropViews(db, ['reorder_alerts']);  // Drop specific
```

### Raw SQL

Each view exports its SQL for direct use:

```typescript
import { productInventoryStatusSQL, reorderAlertsSQL, openOrdersUnifiedSQL } from 'inflow-materialize';

// Execute directly
db.exec(productInventoryStatusSQL);
```

## License

ISC
