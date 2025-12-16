// Phase 1: Dashboard Layer
export {
  productInventoryStatus,
  productInventoryStatusSQL,
} from './product-inventory-status.js';

export {
  reorderAlerts,
  reorderAlertsSQL,
} from './reorder-alerts.js';

export {
  openOrdersUnified,
  openOrdersUnifiedSQL,
} from './open-orders-unified.js';

// Phase 2: Operational Layer
export {
  inventoryByLocation,
  inventoryByLocationSQL,
} from './inventory-by-location.js';

export {
  locationStockSummary,
  locationStockSummarySQL,
} from './location-stock-summary.js';

export {
  locationReorderAlerts,
  locationReorderAlertsSQL,
} from './location-reorder-alerts.js';

export {
  transferPipeline,
  transferPipelineSQL,
} from './transfer-pipeline.js';

// Phase 3: Expert Layer
export {
  inventoryDetail,
  inventoryDetailSQL,
} from './inventory-detail.js';

export {
  stockMovementLedger,
  stockMovementLedgerSQL,
} from './stock-movement-ledger.js';

export {
  lotInventory,
  lotInventorySQL,
} from './lot-inventory.js';

export {
  serialInventory,
  serialInventorySQL,
} from './serial-inventory.js';

/**
 * All view SQL statements for creating views directly
 */
export { allViewsSQL } from '../create-views.js';
