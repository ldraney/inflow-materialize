// Phase 1: Dashboard Layer
export { productInventoryStatus, productInventoryStatusSQL, } from './product-inventory-status.js';
export { reorderAlerts, reorderAlertsSQL, } from './reorder-alerts.js';
export { openOrdersUnified, openOrdersUnifiedSQL, } from './open-orders-unified.js';
// Phase 2: Operational Layer
export { inventoryByLocation, inventoryByLocationSQL, } from './inventory-by-location.js';
export { locationStockSummary, locationStockSummarySQL, } from './location-stock-summary.js';
export { locationReorderAlerts, locationReorderAlertsSQL, } from './location-reorder-alerts.js';
export { transferPipeline, transferPipelineSQL, } from './transfer-pipeline.js';
// Phase 3: Expert Layer
export { inventoryDetail, inventoryDetailSQL, } from './inventory-detail.js';
export { stockMovementLedger, stockMovementLedgerSQL, } from './stock-movement-ledger.js';
export { lotInventory, lotInventorySQL, } from './lot-inventory.js';
export { serialInventory, serialInventorySQL, } from './serial-inventory.js';
// Phase 4: Business Analytics
export { customer360, customer360SQL, } from './customer-360.js';
export { vendorScorecard, vendorScorecardSQL, } from './vendor-scorecard.js';
export { productMargin, productMarginSQL, } from './product-margin.js';
export { bomCosted, bomCostedSQL, } from './bom-costed.js';
export { categoryInventorySummary, categoryInventorySummarySQL, } from './category-inventory-summary.js';
// Phase 5: Time-Series / History
export { orderHistory, orderHistorySQL, } from './order-history.js';
export { productVelocity, productVelocitySQL, } from './product-velocity.js';
export { deadStock, deadStockSQL, } from './dead-stock.js';
/**
 * All view SQL statements for creating views directly
 */
export { allViewsSQL } from '../create-views.js';
//# sourceMappingURL=index.js.map