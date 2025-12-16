import { sqliteView } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

/**
 * Vendor Scorecard View
 *
 * Complete vendor profile with product catalog and PO history metrics.
 * Shows products supplied, total spend, and PO performance.
 *
 * Use cases:
 * - "Who are my top vendors by spend?"
 * - "How many products does this vendor supply?"
 * - "Vendor lead time analysis"
 *
 * Joins: vendors + vendor_items (aggregated) + purchase_orders (aggregated)
 */
export const vendorScorecard = sqliteView('vendor_scorecard').as((qb) => {
  return qb
    .select({
      // Vendor info
      vendorId: sql<string>`v.vendor_id`.as('vendor_id'),
      vendorName: sql<string>`v.name`.as('vendor_name'),
      vendorCode: sql<string>`v.vendor_code`.as('vendor_code'),
      email: sql<string>`v.email`.as('email'),
      phone: sql<string>`v.phone`.as('phone'),
      isActive: sql<number>`v.is_active`.as('is_active'),

      // Payment terms
      paymentTermsId: sql<string>`v.payment_terms_id`.as('payment_terms_id'),
      paymentTermsName: sql<string>`pt.name`.as('payment_terms_name'),

      // Products supplied metrics
      productsSupplied: sql<number>`COALESCE(product_stats.products_supplied, 0)`.as('products_supplied'),
      avgLeadTimeDays: sql<number>`product_stats.avg_lead_time_days`.as('avg_lead_time_days'),

      // PO metrics (all time)
      totalPOs: sql<number>`COALESCE(po_stats.total_pos, 0)`.as('total_pos'),
      completedPOs: sql<number>`COALESCE(po_stats.completed_pos, 0)`.as('completed_pos'),
      cancelledPOs: sql<number>`COALESCE(po_stats.cancelled_pos, 0)`.as('cancelled_pos'),
      openPOs: sql<number>`COALESCE(po_stats.open_pos, 0)`.as('open_pos'),

      // Spend metrics
      totalSpend: sql<string>`COALESCE(po_stats.total_spend, '0')`.as('total_spend'),
      averagePOValue: sql<string>`
        CASE
          WHEN COALESCE(po_stats.completed_pos, 0) > 0
          THEN CAST(CAST(COALESCE(po_stats.total_spend, '0') AS REAL) / po_stats.completed_pos AS TEXT)
          ELSE '0'
        END
      `.as('average_po_value'),
      openPOsValue: sql<string>`COALESCE(po_stats.open_pos_value, '0')`.as('open_pos_value'),

      // Dates
      firstPODate: sql<string>`po_stats.first_po_date`.as('first_po_date'),
      lastPODate: sql<string>`po_stats.last_po_date`.as('last_po_date'),
    })
    .from(sql`vendors v`)
    .leftJoin(sql`payment_terms pt`, sql`v.payment_terms_id = pt.payment_terms_id`)
    .leftJoin(
      sql`(
        SELECT
          vendor_id,
          COUNT(DISTINCT product_id) AS products_supplied,
          AVG(lead_time_days) AS avg_lead_time_days
        FROM vendor_items
        GROUP BY vendor_id
      ) product_stats`,
      sql`v.vendor_id = product_stats.vendor_id`
    )
    .leftJoin(
      sql`(
        SELECT
          vendor_id,
          COUNT(*) AS total_pos,
          SUM(CASE WHEN status IN ('Completed', 'Closed') THEN 1 ELSE 0 END) AS completed_pos,
          SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END) AS cancelled_pos,
          SUM(CASE WHEN status NOT IN ('Completed', 'Closed', 'Cancelled') THEN 1 ELSE 0 END) AS open_pos,
          SUM(CASE WHEN status IN ('Completed', 'Closed') THEN CAST(COALESCE(total, '0') AS REAL) ELSE 0 END) AS total_spend,
          SUM(CASE WHEN status NOT IN ('Completed', 'Closed', 'Cancelled') THEN CAST(COALESCE(total, '0') AS REAL) ELSE 0 END) AS open_pos_value,
          MIN(order_date) AS first_po_date,
          MAX(order_date) AS last_po_date
        FROM purchase_orders
        GROUP BY vendor_id
      ) po_stats`,
      sql`v.vendor_id = po_stats.vendor_id`
    );
});

/**
 * SQL to create this view manually
 */
export const vendorScorecardSQL = `
CREATE VIEW IF NOT EXISTS vendor_scorecard AS
SELECT
  v.vendor_id,
  v.name AS vendor_name,
  v.vendor_code,
  v.email,
  v.phone,
  v.is_active,

  v.payment_terms_id,
  pt.name AS payment_terms_name,

  COALESCE(product_stats.products_supplied, 0) AS products_supplied,
  product_stats.avg_lead_time_days,

  COALESCE(po_stats.total_pos, 0) AS total_pos,
  COALESCE(po_stats.completed_pos, 0) AS completed_pos,
  COALESCE(po_stats.cancelled_pos, 0) AS cancelled_pos,
  COALESCE(po_stats.open_pos, 0) AS open_pos,

  COALESCE(po_stats.total_spend, '0') AS total_spend,
  CASE
    WHEN COALESCE(po_stats.completed_pos, 0) > 0
    THEN CAST(CAST(COALESCE(po_stats.total_spend, '0') AS REAL) / po_stats.completed_pos AS TEXT)
    ELSE '0'
  END AS average_po_value,
  COALESCE(po_stats.open_pos_value, '0') AS open_pos_value,

  po_stats.first_po_date,
  po_stats.last_po_date

FROM vendors v
LEFT JOIN payment_terms pt ON v.payment_terms_id = pt.payment_terms_id
LEFT JOIN (
  SELECT
    vendor_id,
    COUNT(DISTINCT product_id) AS products_supplied,
    AVG(lead_time_days) AS avg_lead_time_days
  FROM vendor_items
  GROUP BY vendor_id
) product_stats ON v.vendor_id = product_stats.vendor_id
LEFT JOIN (
  SELECT
    vendor_id,
    COUNT(*) AS total_pos,
    SUM(CASE WHEN status IN ('Completed', 'Closed') THEN 1 ELSE 0 END) AS completed_pos,
    SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END) AS cancelled_pos,
    SUM(CASE WHEN status NOT IN ('Completed', 'Closed', 'Cancelled') THEN 1 ELSE 0 END) AS open_pos,
    SUM(CASE WHEN status IN ('Completed', 'Closed') THEN CAST(COALESCE(total, '0') AS REAL) ELSE 0 END) AS total_spend,
    SUM(CASE WHEN status NOT IN ('Completed', 'Closed', 'Cancelled') THEN CAST(COALESCE(total, '0') AS REAL) ELSE 0 END) AS open_pos_value,
    MIN(order_date) AS first_po_date,
    MAX(order_date) AS last_po_date
  FROM purchase_orders
  GROUP BY vendor_id
) po_stats ON v.vendor_id = po_stats.vendor_id;
`;
