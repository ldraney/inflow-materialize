import { sqliteView } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

/**
 * Stock Movement Ledger View
 *
 * Unified history of all stock movements:
 * - PO receipts (inventory IN)
 * - SO shipments (inventory OUT)
 * - Transfers (both IN and OUT entries)
 * - Adjustments (IN or OUT depending on quantity sign)
 *
 * Use cases:
 * - "What happened to product X?"
 * - "Show all movements at Warehouse A"
 * - Audit trail / compliance
 * - Inventory reconciliation
 *
 * Note: Transfers create TWO rows - one OUT from source, one IN to destination
 */
export const stockMovementLedger = sqliteView('stock_movement_ledger').as((qb) => {
  // This view is a UNION of 4 sources - must be created via raw SQL
  // The Drizzle view definition here is for documentation/typing only
  return qb
    .select({
      movementType: sql<string>`'PLACEHOLDER'`.as('movement_type'),
      movementDate: sql<string>`NULL`.as('movement_date'),
      productId: sql<string>`NULL`.as('product_id'),
      sku: sql<string>`NULL`.as('sku'),
      productName: sql<string>`NULL`.as('product_name'),
      locationId: sql<string>`NULL`.as('location_id'),
      locationName: sql<string>`NULL`.as('location_name'),
      quantity: sql<string>`NULL`.as('quantity'),
      referenceType: sql<string>`NULL`.as('reference_type'),
      referenceNumber: sql<string>`NULL`.as('reference_number'),
      referenceId: sql<string>`NULL`.as('reference_id'),
      lineId: sql<string>`NULL`.as('line_id'),
    })
    .from(sql`(SELECT 1) dummy`)
    .where(sql`1=0`);
});

/**
 * SQL to create this view manually
 */
export const stockMovementLedgerSQL = `
CREATE VIEW IF NOT EXISTS stock_movement_ledger AS

-- PO Receipts (inventory IN)
SELECT
  'PO_RECEIPT' AS movement_type,
  po.order_date AS movement_date,
  pol.product_id,
  p.sku,
  p.name AS product_name,
  po.location_id,
  l.name AS location_name,
  pol.quantity_received AS quantity,
  'PurchaseOrder' AS reference_type,
  po.order_number AS reference_number,
  po.purchase_order_id AS reference_id,
  pol.purchase_order_line_id AS line_id
FROM purchase_order_lines pol
INNER JOIN purchase_orders po ON pol.purchase_order_id = po.purchase_order_id
INNER JOIN products p ON pol.product_id = p.product_id
LEFT JOIN locations l ON po.location_id = l.location_id
WHERE CAST(COALESCE(pol.quantity_received, '0') AS REAL) > 0

UNION ALL

-- SO Shipments (inventory OUT - negative quantity)
SELECT
  'SO_SHIPMENT' AS movement_type,
  so.order_date AS movement_date,
  sol.product_id,
  p.sku,
  p.name AS product_name,
  so.location_id,
  l.name AS location_name,
  '-' || sol.quantity_shipped AS quantity,
  'SalesOrder' AS reference_type,
  so.order_number AS reference_number,
  so.sales_order_id AS reference_id,
  sol.sales_order_line_id AS line_id
FROM sales_order_lines sol
INNER JOIN sales_orders so ON sol.sales_order_id = so.sales_order_id
INNER JOIN products p ON sol.product_id = p.product_id
LEFT JOIN locations l ON so.location_id = l.location_id
WHERE CAST(COALESCE(sol.quantity_shipped, '0') AS REAL) > 0

UNION ALL

-- Transfers OUT (from source location - negative)
SELECT
  'TRANSFER_OUT' AS movement_type,
  st.transfer_date AS movement_date,
  stl.product_id,
  p.sku,
  p.name AS product_name,
  st.from_location_id AS location_id,
  l.name AS location_name,
  '-' || stl.quantity AS quantity,
  'StockTransfer' AS reference_type,
  st.transfer_number AS reference_number,
  st.stock_transfer_id AS reference_id,
  stl.stock_transfer_line_id AS line_id
FROM stock_transfer_lines stl
INNER JOIN stock_transfers st ON stl.stock_transfer_id = st.stock_transfer_id
INNER JOIN products p ON stl.product_id = p.product_id
LEFT JOIN locations l ON st.from_location_id = l.location_id
WHERE st.status IN ('Completed', 'Closed')

UNION ALL

-- Transfers IN (to destination location - positive)
SELECT
  'TRANSFER_IN' AS movement_type,
  st.transfer_date AS movement_date,
  stl.product_id,
  p.sku,
  p.name AS product_name,
  st.to_location_id AS location_id,
  l.name AS location_name,
  stl.quantity AS quantity,
  'StockTransfer' AS reference_type,
  st.transfer_number AS reference_number,
  st.stock_transfer_id AS reference_id,
  stl.stock_transfer_line_id AS line_id
FROM stock_transfer_lines stl
INNER JOIN stock_transfers st ON stl.stock_transfer_id = st.stock_transfer_id
INNER JOIN products p ON stl.product_id = p.product_id
LEFT JOIN locations l ON st.to_location_id = l.location_id
WHERE st.status IN ('Completed', 'Closed')

UNION ALL

-- Adjustments (can be positive or negative)
SELECT
  'ADJUSTMENT' AS movement_type,
  sa.adjustment_date AS movement_date,
  sal.product_id,
  p.sku,
  p.name AS product_name,
  sa.location_id,
  l.name AS location_name,
  sal.quantity AS quantity,
  'StockAdjustment' AS reference_type,
  sa.adjustment_number AS reference_number,
  sa.stock_adjustment_id AS reference_id,
  sal.stock_adjustment_line_id AS line_id
FROM stock_adjustment_lines sal
INNER JOIN stock_adjustments sa ON sal.stock_adjustment_id = sa.stock_adjustment_id
INNER JOIN products p ON sal.product_id = p.product_id
LEFT JOIN locations l ON sa.location_id = l.location_id;
`;
