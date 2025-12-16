/**
 * Drizzle schemas for type-safe queries
 *
 * These are the same sqliteView definitions from ./views, re-exported
 * under a semantic path for downstream consumers who want typed queries.
 *
 * @example
 * ```typescript
 * import { reorderAlerts, productVelocity } from 'inflow-materialize/schemas';
 * import { drizzle } from 'drizzle-orm/better-sqlite3';
 *
 * const db = drizzle(sqlite);
 * const alerts = db.select().from(reorderAlerts).all();
 * // alerts is fully typed!
 * ```
 */
// Phase 1: Dashboard Layer
export { productInventoryStatus, reorderAlerts, openOrdersUnified, } from '../views/index.js';
// Phase 2: Operational Layer
export { inventoryByLocation, locationStockSummary, locationReorderAlerts, transferPipeline, } from '../views/index.js';
// Phase 3: Expert Layer
export { inventoryDetail, stockMovementLedger, lotInventory, serialInventory, } from '../views/index.js';
// Phase 4: Business Analytics
export { customer360, vendorScorecard, productMargin, bomCosted, categoryInventorySummary, } from '../views/index.js';
// Phase 5: Time-Series / History
export { orderHistory, productVelocity, deadStock, } from '../views/index.js';
//# sourceMappingURL=index.js.map