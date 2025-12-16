/**
 * inflow-materialize
 *
 * Business-friendly materialized views for Inflow Inventory data.
 * Use with inflow-get to create useful views for frontend consumption.
 *
 * @example
 * ```typescript
 * import { getDb } from 'inflow-get';
 * import { createViews } from 'inflow-materialize';
 *
 * const db = getDb('./inflow.db');
 * createViews(db);
 *
 * // Now query the views
 * const lowStock = db.prepare('SELECT * FROM reorder_alerts').all();
 * const pipeline = db.prepare('SELECT * FROM open_orders_unified ORDER BY expected_date').all();
 * ```
 */

export {
  createViews,
  dropViews,
  allViewsSQL,
  viewNames,
  type ViewName,
} from './create-views.js';

// Re-export individual views for Drizzle users
// Phase 1: Dashboard Layer
export {
  productInventoryStatus,
  productInventoryStatusSQL,
  reorderAlerts,
  reorderAlertsSQL,
  openOrdersUnified,
  openOrdersUnifiedSQL,
  // Phase 2: Operational Layer
  inventoryByLocation,
  inventoryByLocationSQL,
  locationStockSummary,
  locationStockSummarySQL,
  locationReorderAlerts,
  locationReorderAlertsSQL,
  transferPipeline,
  transferPipelineSQL,
} from './views/index.js';
