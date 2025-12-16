import { sqliteView } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

/**
 * Customer 360 View
 *
 * Complete customer profile with order history metrics.
 * Shows total revenue, order counts, and current open orders.
 *
 * Use cases:
 * - "Who are my top customers?"
 * - "Which customers have open orders?"
 * - "Customer lifetime value analysis"
 *
 * Joins: customers + sales_orders (aggregated)
 */
export const customer360 = sqliteView('customer_360').as((qb) => {
  return qb
    .select({
      // Customer info
      customerId: sql<string>`c.customer_id`.as('customer_id'),
      customerName: sql<string>`c.name`.as('customer_name'),
      customerCode: sql<string>`c.customer_code`.as('customer_code'),
      email: sql<string>`c.email`.as('email'),
      phone: sql<string>`c.phone`.as('phone'),
      isActive: sql<number>`c.is_active`.as('is_active'),

      // Pricing and terms
      pricingSchemeId: sql<string>`c.pricing_scheme_id`.as('pricing_scheme_id'),
      pricingSchemeName: sql<string>`ps.name`.as('pricing_scheme_name'),
      paymentTermsId: sql<string>`c.payment_terms_id`.as('payment_terms_id'),
      paymentTermsName: sql<string>`pt.name`.as('payment_terms_name'),

      // Order metrics (all time)
      totalOrders: sql<number>`COALESCE(order_stats.total_orders, 0)`.as('total_orders'),
      completedOrders: sql<number>`COALESCE(order_stats.completed_orders, 0)`.as('completed_orders'),
      cancelledOrders: sql<number>`COALESCE(order_stats.cancelled_orders, 0)`.as('cancelled_orders'),

      // Revenue metrics
      totalRevenue: sql<string>`COALESCE(order_stats.total_revenue, '0')`.as('total_revenue'),
      averageOrderValue: sql<string>`
        CASE
          WHEN COALESCE(order_stats.completed_orders, 0) > 0
          THEN CAST(CAST(COALESCE(order_stats.total_revenue, '0') AS REAL) / order_stats.completed_orders AS TEXT)
          ELSE '0'
        END
      `.as('average_order_value'),

      // Open order metrics
      openOrders: sql<number>`COALESCE(order_stats.open_orders, 0)`.as('open_orders'),
      openOrdersValue: sql<string>`COALESCE(order_stats.open_orders_value, '0')`.as('open_orders_value'),

      // Dates
      firstOrderDate: sql<string>`order_stats.first_order_date`.as('first_order_date'),
      lastOrderDate: sql<string>`order_stats.last_order_date`.as('last_order_date'),
    })
    .from(sql`customers c`)
    .leftJoin(sql`pricing_schemes ps`, sql`c.pricing_scheme_id = ps.pricing_scheme_id`)
    .leftJoin(sql`payment_terms pt`, sql`c.payment_terms_id = pt.payment_terms_id`)
    .leftJoin(
      sql`(
        SELECT
          customer_id,
          COUNT(*) AS total_orders,
          SUM(CASE WHEN status IN ('Completed', 'Shipped', 'Closed') THEN 1 ELSE 0 END) AS completed_orders,
          SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END) AS cancelled_orders,
          SUM(CASE WHEN status NOT IN ('Completed', 'Shipped', 'Closed', 'Cancelled') THEN 1 ELSE 0 END) AS open_orders,
          SUM(CASE WHEN status IN ('Completed', 'Shipped', 'Closed') THEN CAST(COALESCE(total, '0') AS REAL) ELSE 0 END) AS total_revenue,
          SUM(CASE WHEN status NOT IN ('Completed', 'Shipped', 'Closed', 'Cancelled') THEN CAST(COALESCE(total, '0') AS REAL) ELSE 0 END) AS open_orders_value,
          MIN(order_date) AS first_order_date,
          MAX(order_date) AS last_order_date
        FROM sales_orders
        GROUP BY customer_id
      ) order_stats`,
      sql`c.customer_id = order_stats.customer_id`
    );
});

/**
 * SQL to create this view manually
 */
export const customer360SQL = `
CREATE VIEW IF NOT EXISTS customer_360 AS
SELECT
  c.customer_id,
  c.name AS customer_name,
  c.customer_code,
  c.email,
  c.phone,
  c.is_active,

  c.pricing_scheme_id,
  ps.name AS pricing_scheme_name,
  c.payment_terms_id,
  pt.name AS payment_terms_name,

  COALESCE(order_stats.total_orders, 0) AS total_orders,
  COALESCE(order_stats.completed_orders, 0) AS completed_orders,
  COALESCE(order_stats.cancelled_orders, 0) AS cancelled_orders,

  COALESCE(order_stats.total_revenue, '0') AS total_revenue,
  CASE
    WHEN COALESCE(order_stats.completed_orders, 0) > 0
    THEN CAST(CAST(COALESCE(order_stats.total_revenue, '0') AS REAL) / order_stats.completed_orders AS TEXT)
    ELSE '0'
  END AS average_order_value,

  COALESCE(order_stats.open_orders, 0) AS open_orders,
  COALESCE(order_stats.open_orders_value, '0') AS open_orders_value,

  order_stats.first_order_date,
  order_stats.last_order_date

FROM customers c
LEFT JOIN pricing_schemes ps ON c.pricing_scheme_id = ps.pricing_scheme_id
LEFT JOIN payment_terms pt ON c.payment_terms_id = pt.payment_terms_id
LEFT JOIN (
  SELECT
    customer_id,
    COUNT(*) AS total_orders,
    SUM(CASE WHEN status IN ('Completed', 'Shipped', 'Closed') THEN 1 ELSE 0 END) AS completed_orders,
    SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END) AS cancelled_orders,
    SUM(CASE WHEN status NOT IN ('Completed', 'Shipped', 'Closed', 'Cancelled') THEN 1 ELSE 0 END) AS open_orders,
    SUM(CASE WHEN status IN ('Completed', 'Shipped', 'Closed') THEN CAST(COALESCE(total, '0') AS REAL) ELSE 0 END) AS total_revenue,
    SUM(CASE WHEN status NOT IN ('Completed', 'Shipped', 'Closed', 'Cancelled') THEN CAST(COALESCE(total, '0') AS REAL) ELSE 0 END) AS open_orders_value,
    MIN(order_date) AS first_order_date,
    MAX(order_date) AS last_order_date
  FROM sales_orders
  GROUP BY customer_id
) order_stats ON c.customer_id = order_stats.customer_id;
`;
