import { sqliteView } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
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
export const openOrdersUnified = sqliteView('open_orders_unified').as((qb) => {
    // Note: Drizzle doesn't directly support UNION in views,
    // so we use raw SQL for the full view definition
    return qb.select({
        orderId: sql `order_id`.as('order_id'),
        orderType: sql `order_type`.as('order_type'),
        orderNumber: sql `order_number`.as('order_number'),
        status: sql `status`.as('status'),
        orderDate: sql `order_date`.as('order_date'),
        expectedDate: sql `expected_date`.as('expected_date'),
        counterpartyId: sql `counterparty_id`.as('counterparty_id'),
        counterpartyName: sql `counterparty_name`.as('counterparty_name'),
        counterpartyType: sql `counterparty_type`.as('counterparty_type'),
        locationId: sql `location_id`.as('location_id'),
        locationName: sql `location_name`.as('location_name'),
        total: sql `total`.as('total'),
        remarks: sql `remarks`.as('remarks'),
        lastModified: sql `last_modified`.as('last_modified'),
    }).from(sql `(
    SELECT
      po.purchase_order_id AS order_id,
      'purchase_order' AS order_type,
      po.order_number,
      po.status,
      po.order_date,
      po.expected_date,
      po.vendor_id AS counterparty_id,
      v.name AS counterparty_name,
      'vendor' AS counterparty_type,
      po.location_id,
      l.name AS location_name,
      po.total,
      po.remarks,
      po.last_modified_date_time AS last_modified
    FROM purchase_orders po
    LEFT JOIN vendors v ON po.vendor_id = v.vendor_id
    LEFT JOIN locations l ON po.location_id = l.location_id
    WHERE po.status NOT IN ('Completed', 'Cancelled', 'Closed')

    UNION ALL

    SELECT
      so.sales_order_id AS order_id,
      'sales_order' AS order_type,
      so.order_number,
      so.status,
      so.order_date,
      so.expected_ship_date AS expected_date,
      so.customer_id AS counterparty_id,
      c.name AS counterparty_name,
      'customer' AS counterparty_type,
      so.location_id,
      l.name AS location_name,
      so.total,
      so.remarks,
      so.last_modified_date_time AS last_modified
    FROM sales_orders so
    LEFT JOIN customers c ON so.customer_id = c.customer_id
    LEFT JOIN locations l ON so.location_id = l.location_id
    WHERE so.status NOT IN ('Completed', 'Cancelled', 'Closed', 'Shipped')

    UNION ALL

    SELECT
      mo.manufacturing_order_id AS order_id,
      'manufacturing_order' AS order_type,
      mo.order_number,
      mo.status,
      mo.order_date,
      mo.expected_date,
      mo.product_id AS counterparty_id,
      p.name AS counterparty_name,
      'product' AS counterparty_type,
      mo.location_id,
      l.name AS location_name,
      CAST(mo.quantity AS TEXT) AS total,
      mo.remarks,
      mo.last_modified_date_time AS last_modified
    FROM manufacturing_orders mo
    LEFT JOIN products p ON mo.product_id = p.product_id
    LEFT JOIN locations l ON mo.location_id = l.location_id
    WHERE mo.status NOT IN ('Completed', 'Cancelled', 'Closed')
  )`);
});
/**
 * SQL to create this view manually (for reference or direct execution)
 */
export const openOrdersUnifiedSQL = `
CREATE VIEW IF NOT EXISTS open_orders_unified AS
SELECT
  po.purchase_order_id AS order_id,
  'purchase_order' AS order_type,
  po.order_number,
  po.status,
  po.order_date,
  po.expected_date,
  po.vendor_id AS counterparty_id,
  v.name AS counterparty_name,
  'vendor' AS counterparty_type,
  po.location_id,
  l.name AS location_name,
  po.total,
  po.remarks,
  po.last_modified_date_time AS last_modified
FROM purchase_orders po
LEFT JOIN vendors v ON po.vendor_id = v.vendor_id
LEFT JOIN locations l ON po.location_id = l.location_id
WHERE po.status NOT IN ('Completed', 'Cancelled', 'Closed')

UNION ALL

SELECT
  so.sales_order_id AS order_id,
  'sales_order' AS order_type,
  so.order_number,
  so.status,
  so.order_date,
  so.expected_ship_date AS expected_date,
  so.customer_id AS counterparty_id,
  c.name AS counterparty_name,
  'customer' AS counterparty_type,
  so.location_id,
  l.name AS location_name,
  so.total,
  so.remarks,
  so.last_modified_date_time AS last_modified
FROM sales_orders so
LEFT JOIN customers c ON so.customer_id = c.customer_id
LEFT JOIN locations l ON so.location_id = l.location_id
WHERE so.status NOT IN ('Completed', 'Cancelled', 'Closed', 'Shipped')

UNION ALL

SELECT
  mo.manufacturing_order_id AS order_id,
  'manufacturing_order' AS order_type,
  mo.order_number,
  mo.status,
  mo.order_date,
  mo.expected_date,
  mo.product_id AS counterparty_id,
  p.name AS counterparty_name,
  'product' AS counterparty_type,
  mo.location_id,
  l.name AS location_name,
  CAST(mo.quantity AS TEXT) AS total,
  mo.remarks,
  mo.last_modified_date_time AS last_modified
FROM manufacturing_orders mo
LEFT JOIN products p ON mo.product_id = p.product_id
LEFT JOIN locations l ON mo.location_id = l.location_id
WHERE mo.status NOT IN ('Completed', 'Cancelled', 'Closed');
`;
//# sourceMappingURL=open-orders-unified.js.map