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
];
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
];
/**
 * Create all materialized views in the database
 *
 * @param db - better-sqlite3 Database instance (from inflow-get)
 * @param options - Configuration options
 */
export function createViews(db, options = {}) {
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
function getViewSQL(viewName) {
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
    }
}
/**
 * Drop all materialized views from the database
 */
export function dropViews(db, only) {
    const viewsToDrop = only ?? viewNames;
    for (const viewName of viewsToDrop) {
        db.exec(`DROP VIEW IF EXISTS ${viewName}`);
    }
}
//# sourceMappingURL=create-views.js.map