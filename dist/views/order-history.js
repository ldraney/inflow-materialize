import { sqliteView } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
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
export const orderHistory = sqliteView('order_history').as((qb) => {
    return qb.select({
        orderType: sql `order_type`.as('order_type'),
        orderId: sql `order_id`.as('order_id'),
        orderNumber: sql `order_number`.as('order_number'),
        orderDate: sql `order_date`.as('order_date'),
        status: sql `status`.as('status'),
        partnerId: sql `partner_id`.as('partner_id'),
        partnerName: sql `partner_name`.as('partner_name'),
        locationId: sql `location_id`.as('location_id'),
        locationName: sql `location_name`.as('location_name'),
        lineId: sql `line_id`.as('line_id'),
        productId: sql `product_id`.as('product_id'),
        sku: sql `sku`.as('sku'),
        productName: sql `product_name`.as('product_name'),
        quantityOrdered: sql `quantity_ordered`.as('quantity_ordered'),
        quantityFulfilled: sql `quantity_fulfilled`.as('quantity_fulfilled'),
        unitPrice: sql `unit_price`.as('unit_price'),
        lineTotal: sql `line_total`.as('line_total'),
    }).from(sql `(
    -- Purchase Orders (completed receipts from vendors)
    SELECT
      'PO' AS order_type,
      po.purchase_order_id AS order_id,
      po.order_number,
      po.order_date,
      po.status,
      po.vendor_id AS partner_id,
      v.name AS partner_name,
      po.location_id,
      l.name AS location_name,
      pol.purchase_order_line_id AS line_id,
      pol.product_id,
      p.sku,
      p.name AS product_name,
      pol.quantity AS quantity_ordered,
      pol.quantity_received AS quantity_fulfilled,
      pol.unit_cost AS unit_price,
      CAST(CAST(COALESCE(pol.quantity_received, '0') AS REAL) * CAST(COALESCE(pol.unit_cost, '0') AS REAL) AS TEXT) AS line_total
    FROM purchase_orders po
    INNER JOIN purchase_order_lines pol ON po.purchase_order_id = pol.purchase_order_id
    INNER JOIN products p ON pol.product_id = p.product_id
    LEFT JOIN vendors v ON po.vendor_id = v.vendor_id
    LEFT JOIN locations l ON po.location_id = l.location_id
    WHERE po.status IN ('Completed', 'Closed')

    UNION ALL

    -- Sales Orders (completed shipments to customers)
    SELECT
      'SO' AS order_type,
      so.sales_order_id AS order_id,
      so.order_number,
      so.order_date,
      so.status,
      so.customer_id AS partner_id,
      c.name AS partner_name,
      so.location_id,
      l.name AS location_name,
      sol.sales_order_line_id AS line_id,
      sol.product_id,
      p.sku,
      p.name AS product_name,
      sol.quantity AS quantity_ordered,
      sol.quantity_shipped AS quantity_fulfilled,
      sol.unit_price AS unit_price,
      CAST(CAST(COALESCE(sol.quantity_shipped, '0') AS REAL) * CAST(COALESCE(sol.unit_price, '0') AS REAL) AS TEXT) AS line_total
    FROM sales_orders so
    INNER JOIN sales_order_lines sol ON so.sales_order_id = sol.sales_order_id
    INNER JOIN products p ON sol.product_id = p.product_id
    LEFT JOIN customers c ON so.customer_id = c.customer_id
    LEFT JOIN locations l ON so.location_id = l.location_id
    WHERE so.status IN ('Completed', 'Shipped', 'Closed')

    UNION ALL

    -- Manufacturing Orders (completed production)
    SELECT
      'MO' AS order_type,
      mo.manufacturing_order_id AS order_id,
      mo.order_number,
      mo.order_date,
      mo.status,
      NULL AS partner_id,
      NULL AS partner_name,
      mo.location_id,
      l.name AS location_name,
      mo.manufacturing_order_id AS line_id,
      mo.product_id,
      p.sku,
      p.name AS product_name,
      mo.quantity AS quantity_ordered,
      mo.quantity_completed AS quantity_fulfilled,
      p.cost AS unit_price,
      CAST(CAST(COALESCE(mo.quantity_completed, '0') AS REAL) * CAST(COALESCE(p.cost, '0') AS REAL) AS TEXT) AS line_total
    FROM manufacturing_orders mo
    INNER JOIN products p ON mo.product_id = p.product_id
    LEFT JOIN locations l ON mo.location_id = l.location_id
    WHERE mo.status IN ('Completed', 'Closed')
  )`);
});
/**
 * SQL to create this view manually
 */
export const orderHistorySQL = `
CREATE VIEW IF NOT EXISTS order_history AS

-- Purchase Orders (completed receipts from vendors)
SELECT
  'PO' AS order_type,
  po.purchase_order_id AS order_id,
  po.order_number,
  po.order_date,
  po.status,
  po.vendor_id AS partner_id,
  v.name AS partner_name,
  po.location_id,
  l.name AS location_name,
  pol.purchase_order_line_id AS line_id,
  pol.product_id,
  p.sku,
  p.name AS product_name,
  pol.quantity AS quantity_ordered,
  pol.quantity_received AS quantity_fulfilled,
  pol.unit_cost AS unit_price,
  CAST(CAST(COALESCE(pol.quantity_received, '0') AS REAL) * CAST(COALESCE(pol.unit_cost, '0') AS REAL) AS TEXT) AS line_total
FROM purchase_orders po
INNER JOIN purchase_order_lines pol ON po.purchase_order_id = pol.purchase_order_id
INNER JOIN products p ON pol.product_id = p.product_id
LEFT JOIN vendors v ON po.vendor_id = v.vendor_id
LEFT JOIN locations l ON po.location_id = l.location_id
WHERE po.status IN ('Completed', 'Closed')

UNION ALL

-- Sales Orders (completed shipments to customers)
SELECT
  'SO' AS order_type,
  so.sales_order_id AS order_id,
  so.order_number,
  so.order_date,
  so.status,
  so.customer_id AS partner_id,
  c.name AS partner_name,
  so.location_id,
  l.name AS location_name,
  sol.sales_order_line_id AS line_id,
  sol.product_id,
  p.sku,
  p.name AS product_name,
  sol.quantity AS quantity_ordered,
  sol.quantity_shipped AS quantity_fulfilled,
  sol.unit_price AS unit_price,
  CAST(CAST(COALESCE(sol.quantity_shipped, '0') AS REAL) * CAST(COALESCE(sol.unit_price, '0') AS REAL) AS TEXT) AS line_total
FROM sales_orders so
INNER JOIN sales_order_lines sol ON so.sales_order_id = sol.sales_order_id
INNER JOIN products p ON sol.product_id = p.product_id
LEFT JOIN customers c ON so.customer_id = c.customer_id
LEFT JOIN locations l ON so.location_id = l.location_id
WHERE so.status IN ('Completed', 'Shipped', 'Closed')

UNION ALL

-- Manufacturing Orders (completed production)
SELECT
  'MO' AS order_type,
  mo.manufacturing_order_id AS order_id,
  mo.order_number,
  mo.order_date,
  mo.status,
  NULL AS partner_id,
  NULL AS partner_name,
  mo.location_id,
  l.name AS location_name,
  mo.manufacturing_order_id AS line_id,
  mo.product_id,
  p.sku,
  p.name AS product_name,
  mo.quantity AS quantity_ordered,
  mo.quantity_completed AS quantity_fulfilled,
  p.cost AS unit_price,
  CAST(CAST(COALESCE(mo.quantity_completed, '0') AS REAL) * CAST(COALESCE(p.cost, '0') AS REAL) AS TEXT) AS line_total
FROM manufacturing_orders mo
INNER JOIN products p ON mo.product_id = p.product_id
LEFT JOIN locations l ON mo.location_id = l.location_id
WHERE mo.status IN ('Completed', 'Closed');
`;
//# sourceMappingURL=order-history.js.map