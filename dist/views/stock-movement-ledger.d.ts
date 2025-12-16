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
export declare const stockMovementLedger: import("drizzle-orm/sqlite-core").SQLiteViewWithSelection<"stock_movement_ledger", false, {
    movementType: import("drizzle-orm").SQL.Aliased<string>;
    movementDate: import("drizzle-orm").SQL.Aliased<string>;
    productId: import("drizzle-orm").SQL.Aliased<string>;
    sku: import("drizzle-orm").SQL.Aliased<string>;
    productName: import("drizzle-orm").SQL.Aliased<string>;
    locationId: import("drizzle-orm").SQL.Aliased<string>;
    locationName: import("drizzle-orm").SQL.Aliased<string>;
    quantity: import("drizzle-orm").SQL.Aliased<string>;
    referenceType: import("drizzle-orm").SQL.Aliased<string>;
    referenceNumber: import("drizzle-orm").SQL.Aliased<string>;
    referenceId: import("drizzle-orm").SQL.Aliased<string>;
    lineId: import("drizzle-orm").SQL.Aliased<string>;
}>;
/**
 * SQL to create this view manually
 */
export declare const stockMovementLedgerSQL = "\nCREATE VIEW IF NOT EXISTS stock_movement_ledger AS\n\n-- PO Receipts (inventory IN)\nSELECT\n  'PO_RECEIPT' AS movement_type,\n  po.order_date AS movement_date,\n  pol.product_id,\n  p.sku,\n  p.name AS product_name,\n  po.location_id,\n  l.name AS location_name,\n  pol.quantity_received AS quantity,\n  'PurchaseOrder' AS reference_type,\n  po.order_number AS reference_number,\n  po.purchase_order_id AS reference_id,\n  pol.purchase_order_line_id AS line_id\nFROM purchase_order_lines pol\nINNER JOIN purchase_orders po ON pol.purchase_order_id = po.purchase_order_id\nINNER JOIN products p ON pol.product_id = p.product_id\nLEFT JOIN locations l ON po.location_id = l.location_id\nWHERE CAST(COALESCE(pol.quantity_received, '0') AS REAL) > 0\n\nUNION ALL\n\n-- SO Shipments (inventory OUT - negative quantity)\nSELECT\n  'SO_SHIPMENT' AS movement_type,\n  so.order_date AS movement_date,\n  sol.product_id,\n  p.sku,\n  p.name AS product_name,\n  so.location_id,\n  l.name AS location_name,\n  '-' || sol.quantity_shipped AS quantity,\n  'SalesOrder' AS reference_type,\n  so.order_number AS reference_number,\n  so.sales_order_id AS reference_id,\n  sol.sales_order_line_id AS line_id\nFROM sales_order_lines sol\nINNER JOIN sales_orders so ON sol.sales_order_id = so.sales_order_id\nINNER JOIN products p ON sol.product_id = p.product_id\nLEFT JOIN locations l ON so.location_id = l.location_id\nWHERE CAST(COALESCE(sol.quantity_shipped, '0') AS REAL) > 0\n\nUNION ALL\n\n-- Transfers OUT (from source location - negative)\nSELECT\n  'TRANSFER_OUT' AS movement_type,\n  st.transfer_date AS movement_date,\n  stl.product_id,\n  p.sku,\n  p.name AS product_name,\n  st.from_location_id AS location_id,\n  l.name AS location_name,\n  '-' || stl.quantity AS quantity,\n  'StockTransfer' AS reference_type,\n  st.transfer_number AS reference_number,\n  st.stock_transfer_id AS reference_id,\n  stl.stock_transfer_line_id AS line_id\nFROM stock_transfer_lines stl\nINNER JOIN stock_transfers st ON stl.stock_transfer_id = st.stock_transfer_id\nINNER JOIN products p ON stl.product_id = p.product_id\nLEFT JOIN locations l ON st.from_location_id = l.location_id\nWHERE st.status IN ('Completed', 'Closed')\n\nUNION ALL\n\n-- Transfers IN (to destination location - positive)\nSELECT\n  'TRANSFER_IN' AS movement_type,\n  st.transfer_date AS movement_date,\n  stl.product_id,\n  p.sku,\n  p.name AS product_name,\n  st.to_location_id AS location_id,\n  l.name AS location_name,\n  stl.quantity AS quantity,\n  'StockTransfer' AS reference_type,\n  st.transfer_number AS reference_number,\n  st.stock_transfer_id AS reference_id,\n  stl.stock_transfer_line_id AS line_id\nFROM stock_transfer_lines stl\nINNER JOIN stock_transfers st ON stl.stock_transfer_id = st.stock_transfer_id\nINNER JOIN products p ON stl.product_id = p.product_id\nLEFT JOIN locations l ON st.to_location_id = l.location_id\nWHERE st.status IN ('Completed', 'Closed')\n\nUNION ALL\n\n-- Adjustments (can be positive or negative)\nSELECT\n  'ADJUSTMENT' AS movement_type,\n  sa.adjustment_date AS movement_date,\n  sal.product_id,\n  p.sku,\n  p.name AS product_name,\n  sa.location_id,\n  l.name AS location_name,\n  sal.quantity AS quantity,\n  'StockAdjustment' AS reference_type,\n  sa.adjustment_number AS reference_number,\n  sa.stock_adjustment_id AS reference_id,\n  sal.stock_adjustment_line_id AS line_id\nFROM stock_adjustment_lines sal\nINNER JOIN stock_adjustments sa ON sal.stock_adjustment_id = sa.stock_adjustment_id\nINNER JOIN products p ON sal.product_id = p.product_id\nLEFT JOIN locations l ON sa.location_id = l.location_id;\n";
//# sourceMappingURL=stock-movement-ledger.d.ts.map