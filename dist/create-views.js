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
];
/**
 * View names for dropping/recreating
 */
export const viewNames = [
    'product_inventory_status',
    'reorder_alerts',
    'open_orders_unified',
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
export function dropViews(db, only) {
    const viewsToDrop = only ?? viewNames;
    for (const viewName of viewsToDrop) {
        db.exec(`DROP VIEW IF EXISTS ${viewName}`);
    }
}
//# sourceMappingURL=create-views.js.map