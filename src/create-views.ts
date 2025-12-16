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
