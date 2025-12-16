/**
 * Order History View
 *
 * Unified history of all completed orders with line-level detail:
 * - Purchase Orders (received from vendors)
 * - Sales Orders (shipped to customers)
 * - Manufacturing Orders (production completed)
 *
 * Use cases:
 * - "What did we order from vendor X last quarter?"
 * - "What products did customer Y buy?"
 * - Historical reporting and audits
 * - Revenue/cost analysis by time period
 *
 * Note: Line-level granularity - one row per order line, not per order header
 */
export declare const orderHistory: import("drizzle-orm/sqlite-core").SQLiteViewWithSelection<"order_history", false, {
    orderType: import("drizzle-orm").SQL.Aliased<string>;
    orderId: import("drizzle-orm").SQL.Aliased<string>;
    orderNumber: import("drizzle-orm").SQL.Aliased<string>;
    orderDate: import("drizzle-orm").SQL.Aliased<string>;
    status: import("drizzle-orm").SQL.Aliased<string>;
    partnerId: import("drizzle-orm").SQL.Aliased<string>;
    partnerName: import("drizzle-orm").SQL.Aliased<string>;
    locationId: import("drizzle-orm").SQL.Aliased<string>;
    locationName: import("drizzle-orm").SQL.Aliased<string>;
    lineId: import("drizzle-orm").SQL.Aliased<string>;
    productId: import("drizzle-orm").SQL.Aliased<string>;
    sku: import("drizzle-orm").SQL.Aliased<string>;
    productName: import("drizzle-orm").SQL.Aliased<string>;
    quantityOrdered: import("drizzle-orm").SQL.Aliased<string>;
    quantityFulfilled: import("drizzle-orm").SQL.Aliased<string>;
    unitPrice: import("drizzle-orm").SQL.Aliased<string>;
    lineTotal: import("drizzle-orm").SQL.Aliased<string>;
}>;
/**
 * SQL to create this view manually
 */
export declare const orderHistorySQL = "\nCREATE VIEW IF NOT EXISTS order_history AS\n\n-- Purchase Orders (completed receipts from vendors)\nSELECT\n  'PO' AS order_type,\n  po.purchase_order_id AS order_id,\n  po.order_number,\n  po.order_date,\n  po.status,\n  po.vendor_id AS partner_id,\n  v.name AS partner_name,\n  po.location_id,\n  l.name AS location_name,\n  pol.purchase_order_line_id AS line_id,\n  pol.product_id,\n  p.sku,\n  p.name AS product_name,\n  pol.quantity AS quantity_ordered,\n  pol.quantity_received AS quantity_fulfilled,\n  pol.unit_cost AS unit_price,\n  CAST(CAST(COALESCE(pol.quantity_received, '0') AS REAL) * CAST(COALESCE(pol.unit_cost, '0') AS REAL) AS TEXT) AS line_total\nFROM purchase_orders po\nINNER JOIN purchase_order_lines pol ON po.purchase_order_id = pol.purchase_order_id\nINNER JOIN products p ON pol.product_id = p.product_id\nLEFT JOIN vendors v ON po.vendor_id = v.vendor_id\nLEFT JOIN locations l ON po.location_id = l.location_id\nWHERE po.status IN ('Completed', 'Closed')\n\nUNION ALL\n\n-- Sales Orders (completed shipments to customers)\nSELECT\n  'SO' AS order_type,\n  so.sales_order_id AS order_id,\n  so.order_number,\n  so.order_date,\n  so.status,\n  so.customer_id AS partner_id,\n  c.name AS partner_name,\n  so.location_id,\n  l.name AS location_name,\n  sol.sales_order_line_id AS line_id,\n  sol.product_id,\n  p.sku,\n  p.name AS product_name,\n  sol.quantity AS quantity_ordered,\n  sol.quantity_shipped AS quantity_fulfilled,\n  sol.unit_price AS unit_price,\n  CAST(CAST(COALESCE(sol.quantity_shipped, '0') AS REAL) * CAST(COALESCE(sol.unit_price, '0') AS REAL) AS TEXT) AS line_total\nFROM sales_orders so\nINNER JOIN sales_order_lines sol ON so.sales_order_id = sol.sales_order_id\nINNER JOIN products p ON sol.product_id = p.product_id\nLEFT JOIN customers c ON so.customer_id = c.customer_id\nLEFT JOIN locations l ON so.location_id = l.location_id\nWHERE so.status IN ('Completed', 'Shipped', 'Closed')\n\nUNION ALL\n\n-- Manufacturing Orders (completed production)\nSELECT\n  'MO' AS order_type,\n  mo.manufacturing_order_id AS order_id,\n  mo.order_number,\n  mo.order_date,\n  mo.status,\n  NULL AS partner_id,\n  NULL AS partner_name,\n  mo.location_id,\n  l.name AS location_name,\n  mo.manufacturing_order_id AS line_id,\n  mo.product_id,\n  p.sku,\n  p.name AS product_name,\n  mo.quantity AS quantity_ordered,\n  mo.quantity_completed AS quantity_fulfilled,\n  p.cost AS unit_price,\n  CAST(CAST(COALESCE(mo.quantity_completed, '0') AS REAL) * CAST(COALESCE(p.cost, '0') AS REAL) AS TEXT) AS line_total\nFROM manufacturing_orders mo\nINNER JOIN products p ON mo.product_id = p.product_id\nLEFT JOIN locations l ON mo.location_id = l.location_id\nWHERE mo.status IN ('Completed', 'Closed');\n";
//# sourceMappingURL=order-history.d.ts.map