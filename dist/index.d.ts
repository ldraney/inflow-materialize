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
export { createViews, dropViews, allViewsSQL, viewNames, type ViewName, } from './create-views.js';
export { productInventoryStatus, productInventoryStatusSQL, reorderAlerts, reorderAlertsSQL, openOrdersUnified, openOrdersUnifiedSQL, inventoryByLocation, inventoryByLocationSQL, locationStockSummary, locationStockSummarySQL, locationReorderAlerts, locationReorderAlertsSQL, transferPipeline, transferPipelineSQL, inventoryDetail, inventoryDetailSQL, stockMovementLedger, stockMovementLedgerSQL, lotInventory, lotInventorySQL, serialInventory, serialInventorySQL, customer360, customer360SQL, vendorScorecard, vendorScorecardSQL, productMargin, productMarginSQL, bomCosted, bomCostedSQL, categoryInventorySummary, categoryInventorySummarySQL, orderHistory, orderHistorySQL, productVelocity, productVelocitySQL, deadStock, deadStockSQL, } from './views/index.js';
//# sourceMappingURL=index.d.ts.map