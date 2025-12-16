# inflow-materialize

Business-friendly materialized views for Inflow Inventory data.

## What This Is

A library that creates SQLite views on top of an `inflow-get` database. These views pre-join and pre-compute common business queries so frontends don't have to.

## Architecture

```
inflow-get (seeds SQLite)  →  inflow-materialize (creates views)  →  Frontend queries views
```

## Design Philosophy

Views are organized in **three layers** based on use case:

```
┌─────────────────────────────────────────────────────────────────┐
│  DASHBOARD LAYER (executive, quick answers)                     │
│  Company-wide aggregates, KPIs, alerts                          │
├─────────────────────────────────────────────────────────────────┤
│  OPERATIONAL LAYER (inventory manager, location-aware)          │
│  Per-location data, warehouse operations, fulfillment           │
├─────────────────────────────────────────────────────────────────┤
│  EXPERT LAYER (warehouse staff, QA, compliance)                 │
│  Full granularity: sublocation, serial, lot, movement history   │
└─────────────────────────────────────────────────────────────────┘
```

---

## View Roadmap

### Phase 1: Dashboard Layer ✅ COMPLETE

Global/company-wide views for dashboards and KPIs.

| View | Purpose | Status |
|------|---------|--------|
| `product_inventory_status` | Product card with global inventory + reorder flag | ✅ Done |
| `reorder_alerts` | Products below reorder point with vendor + cost | ✅ Done |
| `open_orders_unified` | PO + SO + MO pipeline (all open work) | ✅ Done |

### Phase 2: Operational Layer ✅ COMPLETE

Location-aware views for inventory managers and warehouse operations.

| View | Purpose | Status |
|------|---------|--------|
| `inventory_by_location` | productSummary broken out by location | ✅ Done |
| `location_stock_summary` | Aggregate stock value/count per location | ✅ Done |
| `location_reorder_alerts` | Per-location reorder points (not just global) | ✅ Done |
| `transfer_pipeline` | Open transfers between locations | ✅ Done |

### Phase 3: Expert Layer ✅ COMPLETE

Full granularity for power users, compliance, and warehouse operations.

| View | Purpose | Status |
|------|---------|--------|
| `inventory_detail` | inventoryLines + product/location names (sublocation, serial, lot) | ✅ Done |
| `stock_movement_ledger` | UNION of all stock movements (PO receipts, SO shipments, transfers, adjustments) | ✅ Done |
| `lot_inventory` | Lot-level tracking with product shelfLifeDays for expiry estimation | ✅ Done |
| `serial_inventory` | Serial number tracking with current location | ✅ Done |

### Phase 4: Business Analytics ✅ COMPLETE

Views for business intelligence and reporting.

| View | Purpose | Status |
|------|---------|--------|
| `customer_360` | Customer + total revenue + order count + open orders | ✅ Done |
| `vendor_scorecard` | Vendor + products supplied + PO history summary | ✅ Done |
| `product_margin` | Product price vs vendor cost = margin | ✅ Done |
| `bom_costed` | Bill of materials with component costs rolled up | ✅ Done |
| `category_inventory_summary` | Stock value/count aggregated by category | ✅ Done |

### Phase 5: Time-Series / History 🔲 FUTURE

Views that require historical data or time-based analysis.

| View | Purpose | Status |
|------|---------|--------|
| `order_history` | All orders (completed) with line details | 🔲 |
| `product_velocity` | Sales/consumption rate per product | 🔲 |
| `dead_stock` | Products with no movement in N days | 🔲 |

---

## Source Tables Reference

Views are built from these `inflow-get` tables:

### Reference Tables
- `categories` (hierarchical), `locations`, `currencies`, `pricingSchemes`
- `paymentTerms`, `taxCodes`, `taxingSchemes`, `operationTypes`
- `adjustmentReasons`, `teamMembers`, `customFieldDefinitions`

### Core Entities
- `products` → `productPrices`, `productBarcodes`, `itemBoms`, `productOperations`, `reorderSettings`
- `inventoryLines` (granular: sublocation/serial/lot)
- `productSummary` (pre-aggregated by Inflow: qty on hand/order/reserved/available)

### Trading Partners
- `vendors` → `vendorItems` (vendor-specific SKU, cost, lead time)
- `customers` (pricing scheme, payment terms)

### Orders
- `purchaseOrders` → `purchaseOrderLines` (qty received tracking)
- `salesOrders` → `salesOrderLines` (qty picked/shipped tracking)
- `manufacturingOrders` (work orders)

### Stock Movements
- `stockTransfers` → `stockTransferLines`
- `stockAdjustments` → `stockAdjustmentLines`
- `productCostAdjustments` → `productCostAdjustmentLines`
- `stockCounts` → `countSheets` → `countSheetLines`

---

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

## Testing Views

To test views against real data:

```bash
# 1. Seed a database with inflow-get
# 2. Run createViews()
# 3. Query and validate output shapes
```

## Publishing

```bash
npm version patch|minor|major
npm publish
```

## File Structure

```
src/
├── index.ts              # Main exports
├── create-views.ts       # createViews() and dropViews() utilities
└── views/
    ├── index.ts          # View re-exports
    ├── product-inventory-status.ts    # ✅ Phase 1
    ├── reorder-alerts.ts              # ✅ Phase 1
    ├── open-orders-unified.ts         # ✅ Phase 1
    ├── inventory-by-location.ts       # ✅ Phase 2
    ├── location-stock-summary.ts      # ✅ Phase 2
    ├── location-reorder-alerts.ts     # ✅ Phase 2
    ├── transfer-pipeline.ts           # ✅ Phase 2
    ├── inventory-detail.ts            # ✅ Phase 3
    ├── stock-movement-ledger.ts       # ✅ Phase 3
    ├── lot-inventory.ts               # ✅ Phase 3
    ├── serial-inventory.ts            # ✅ Phase 3
    ├── customer-360.ts                # ✅ Phase 4
    ├── vendor-scorecard.ts            # ✅ Phase 4
    ├── product-margin.ts              # ✅ Phase 4
    ├── bom-costed.ts                  # ✅ Phase 4
    ├── category-inventory-summary.ts  # ✅ Phase 4
    └── ...
```

## Related Packages

- `inflow-get` - Seeds SQLite from Inflow API
- `inflow-client` - API client with auth/rate limiting
- `inflow-api-types` - Zod schemas for API responses
