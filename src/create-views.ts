import type { Database } from 'better-sqlite3';
// Phase 1: Dashboard Layer
import { productInventoryStatusSQL } from './views/product-inventory-status.js';
import { reorderAlertsSQL } from './views/reorder-alerts.js';
import { openOrdersUnifiedSQL } from './views/open-orders-unified.js';
// Phase 2: Operational Layer
import { inventoryByLocationSQL } from './views/inventory-by-location.js';
import { locationStockSummarySQL } from './views/location-stock-summary.js';
import { locationReorderAlertsSQL } from './views/location-reorder-alerts.js';
import { transferPipelineSQL } from './views/transfer-pipeline.js';
// Phase 3: Expert Layer
import { inventoryDetailSQL } from './views/inventory-detail.js';
import { stockMovementLedgerSQL } from './views/stock-movement-ledger.js';
import { lotInventorySQL } from './views/lot-inventory.js';
import { serialInventorySQL } from './views/serial-inventory.js';
// Phase 4: Business Analytics
import { customer360SQL } from './views/customer-360.js';
import { vendorScorecardSQL } from './views/vendor-scorecard.js';
import { productMarginSQL } from './views/product-margin.js';
import { bomCostedSQL } from './views/bom-costed.js';
import { categoryInventorySummarySQL } from './views/category-inventory-summary.js';
// Phase 5: Time-Series / History
import { orderHistorySQL } from './views/order-history.js';
import { productVelocitySQL } from './views/product-velocity.js';
import { deadStockSQL } from './views/dead-stock.js';

/**
 * All view SQL statements
 */
export const allViewsSQL = [
  // Phase 1: Dashboard Layer
  productInventoryStatusSQL,
  reorderAlertsSQL,
  openOrdersUnifiedSQL,
  // Phase 2: Operational Layer
  inventoryByLocationSQL,
  locationStockSummarySQL,
  locationReorderAlertsSQL,
  transferPipelineSQL,
  // Phase 3: Expert Layer
  inventoryDetailSQL,
  stockMovementLedgerSQL,
  lotInventorySQL,
  serialInventorySQL,
  // Phase 4: Business Analytics
  customer360SQL,
  vendorScorecardSQL,
  productMarginSQL,
  bomCostedSQL,
  categoryInventorySummarySQL,
  // Phase 5: Time-Series / History
  orderHistorySQL,
  productVelocitySQL,
  deadStockSQL,
] as const;

/**
 * View names for dropping/recreating
 */
export const viewNames = [
  // Phase 1: Dashboard Layer
  'product_inventory_status',
  'reorder_alerts',
  'open_orders_unified',
  // Phase 2: Operational Layer
  'inventory_by_location',
  'location_stock_summary',
  'location_reorder_alerts',
  'transfer_pipeline',
  // Phase 3: Expert Layer
  'inventory_detail',
  'stock_movement_ledger',
  'lot_inventory',
  'serial_inventory',
  // Phase 4: Business Analytics
  'customer_360',
  'vendor_scorecard',
  'product_margin',
  'bom_costed',
  'category_inventory_summary',
  // Phase 5: Time-Series / History
  'order_history',
  'product_velocity',
  'dead_stock',
] as const;

export type ViewName = (typeof viewNames)[number];

/**
 * Create all materialized views in the database
 *
 * @param db - better-sqlite3 Database instance (from inflow-get)
 * @param options - Configuration options
 */
export function createViews(
  db: Database,
  options: {
    /** Drop existing views before creating (default: true) */
    dropExisting?: boolean;
    /** Only create specific views */
    only?: ViewName[];
  } = {}
): void {
  const { dropExisting = true, only } = options;

  const viewsToCreate = only
    ? viewNames.filter((name) => only.includes(name))
    : viewNames;

  for (const viewName of viewsToCreate) {
    if (dropExisting) {
      db.exec(`DROP VIEW IF EXISTS ${viewName}`);
    }
  }

  for (const viewName of viewsToCreate) {
    const sql = getViewSQL(viewName);
    db.exec(sql);
  }
}

/**
 * Get the SQL for a specific view
 */
function getViewSQL(viewName: ViewName): string {
  switch (viewName) {
    // Phase 1: Dashboard Layer
    case 'product_inventory_status':
      return productInventoryStatusSQL;
    case 'reorder_alerts':
      return reorderAlertsSQL;
    case 'open_orders_unified':
      return openOrdersUnifiedSQL;
    // Phase 2: Operational Layer
    case 'inventory_by_location':
      return inventoryByLocationSQL;
    case 'location_stock_summary':
      return locationStockSummarySQL;
    case 'location_reorder_alerts':
      return locationReorderAlertsSQL;
    case 'transfer_pipeline':
      return transferPipelineSQL;
    // Phase 3: Expert Layer
    case 'inventory_detail':
      return inventoryDetailSQL;
    case 'stock_movement_ledger':
      return stockMovementLedgerSQL;
    case 'lot_inventory':
      return lotInventorySQL;
    case 'serial_inventory':
      return serialInventorySQL;
    // Phase 4: Business Analytics
    case 'customer_360':
      return customer360SQL;
    case 'vendor_scorecard':
      return vendorScorecardSQL;
    case 'product_margin':
      return productMarginSQL;
    case 'bom_costed':
      return bomCostedSQL;
    case 'category_inventory_summary':
      return categoryInventorySummarySQL;
    // Phase 5: Time-Series / History
    case 'order_history':
      return orderHistorySQL;
    case 'product_velocity':
      return productVelocitySQL;
    case 'dead_stock':
      return deadStockSQL;
  }
}

/**
 * Drop all materialized views from the database
 */
export function dropViews(db: Database, only?: ViewName[]): void {
  const viewsToDrop = only ?? viewNames;

  for (const viewName of viewsToDrop) {
    db.exec(`DROP VIEW IF EXISTS ${viewName}`);
  }
}
