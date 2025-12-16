/**
 * Open Orders Unified View
 *
 * A single pipeline view of all open work across order types:
 * - Purchase Orders (awaiting receipt from vendors)
 * - Sales Orders (awaiting shipment to customers)
 * - Manufacturing Orders (work orders in progress)
 *
 * Normalized to common fields for easy display and filtering.
 */
export declare const openOrdersUnified: import("drizzle-orm/sqlite-core").SQLiteViewWithSelection<"open_orders_unified", false, {
    orderId: import("drizzle-orm").SQL.Aliased<string>;
    orderType: import("drizzle-orm").SQL.Aliased<string>;
    orderNumber: import("drizzle-orm").SQL.Aliased<string>;
    status: import("drizzle-orm").SQL.Aliased<string>;
    orderDate: import("drizzle-orm").SQL.Aliased<string>;
    expectedDate: import("drizzle-orm").SQL.Aliased<string>;
    counterpartyId: import("drizzle-orm").SQL.Aliased<string>;
    counterpartyName: import("drizzle-orm").SQL.Aliased<string>;
    counterpartyType: import("drizzle-orm").SQL.Aliased<string>;
    locationId: import("drizzle-orm").SQL.Aliased<string>;
    locationName: import("drizzle-orm").SQL.Aliased<string>;
    total: import("drizzle-orm").SQL.Aliased<string>;
    remarks: import("drizzle-orm").SQL.Aliased<string>;
    lastModified: import("drizzle-orm").SQL.Aliased<string>;
}>;
/**
 * SQL to create this view manually (for reference or direct execution)
 */
export declare const openOrdersUnifiedSQL = "\nCREATE VIEW IF NOT EXISTS open_orders_unified AS\nSELECT\n  po.purchase_order_id AS order_id,\n  'purchase_order' AS order_type,\n  po.order_number,\n  po.status,\n  po.order_date,\n  po.expected_date,\n  po.vendor_id AS counterparty_id,\n  v.name AS counterparty_name,\n  'vendor' AS counterparty_type,\n  po.location_id,\n  l.name AS location_name,\n  po.total,\n  po.remarks,\n  po.last_modified_date_time AS last_modified\nFROM purchase_orders po\nLEFT JOIN vendors v ON po.vendor_id = v.vendor_id\nLEFT JOIN locations l ON po.location_id = l.location_id\nWHERE po.status NOT IN ('Completed', 'Cancelled', 'Closed')\n\nUNION ALL\n\nSELECT\n  so.sales_order_id AS order_id,\n  'sales_order' AS order_type,\n  so.order_number,\n  so.status,\n  so.order_date,\n  so.expected_ship_date AS expected_date,\n  so.customer_id AS counterparty_id,\n  c.name AS counterparty_name,\n  'customer' AS counterparty_type,\n  so.location_id,\n  l.name AS location_name,\n  so.total,\n  so.remarks,\n  so.last_modified_date_time AS last_modified\nFROM sales_orders so\nLEFT JOIN customers c ON so.customer_id = c.customer_id\nLEFT JOIN locations l ON so.location_id = l.location_id\nWHERE so.status NOT IN ('Completed', 'Cancelled', 'Closed', 'Shipped')\n\nUNION ALL\n\nSELECT\n  mo.manufacturing_order_id AS order_id,\n  'manufacturing_order' AS order_type,\n  mo.order_number,\n  mo.status,\n  mo.order_date,\n  mo.expected_date,\n  mo.product_id AS counterparty_id,\n  p.name AS counterparty_name,\n  'product' AS counterparty_type,\n  mo.location_id,\n  l.name AS location_name,\n  CAST(mo.quantity AS TEXT) AS total,\n  mo.remarks,\n  mo.last_modified_date_time AS last_modified\nFROM manufacturing_orders mo\nLEFT JOIN products p ON mo.product_id = p.product_id\nLEFT JOIN locations l ON mo.location_id = l.location_id\nWHERE mo.status NOT IN ('Completed', 'Cancelled', 'Closed');\n";
//# sourceMappingURL=open-orders-unified.d.ts.map