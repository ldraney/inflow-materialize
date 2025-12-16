import type { Database } from 'better-sqlite3';
import { productInventoryStatusSQL } from './views/product-inventory-status.js';
import { reorderAlertsSQL } from './views/reorder-alerts.js';
import { openOrdersUnifiedSQL } from './views/open-orders-unified.js';

/**
 * All view SQL statements
 */
export const allViewsSQL = [
  productInventoryStatusSQL,
  reorderAlertsSQL,
  openOrdersUnifiedSQL,
] as const;

/**
 * View names for dropping/recreating
 */
export const viewNames = [
  'product_inventory_status',
  'reorder_alerts',
  'open_orders_unified',
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
    case 'product_inventory_status':
      return productInventoryStatusSQL;
    case 'reorder_alerts':
      return reorderAlertsSQL;
    case 'open_orders_unified':
      return openOrdersUnifiedSQL;
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
