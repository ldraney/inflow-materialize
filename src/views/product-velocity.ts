import { sqliteView } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

/**
 * Product Velocity View
 *
 * Rolling sales velocity metrics for each product with multiple time windows.
 * Helps identify fast/slow moving inventory for demand planning.
 *
 * Use cases:
 * - "What are my fastest selling products?"
 * - "Which products should I reorder more frequently?"
 * - "How many days of stock do I have?"
 * - Demand forecasting inputs
 *
 * Time windows: 7, 30, 90 days (rolling from current date)
 * Velocity tiers: FAST (>1/day), MEDIUM (>0.1/day), SLOW (<=0.1/day)
 *
 * Joins: products + categories + productSummary + sales_orders/lines (aggregated)
 */
export const productVelocity = sqliteView('product_velocity').as((qb) => {
  return qb.select({
    productId: sql<string>`product_id`.as('product_id'),
    sku: sql<string>`sku`.as('sku'),
    productName: sql<string>`product_name`.as('product_name'),
    categoryId: sql<string>`category_id`.as('category_id'),
    categoryName: sql<string>`category_name`.as('category_name'),
    quantityOnHand: sql<string>`quantity_on_hand`.as('quantity_on_hand'),
    sold7d: sql<string>`sold_7d`.as('sold_7d'),
    sold30d: sql<string>`sold_30d`.as('sold_30d'),
    sold90d: sql<string>`sold_90d`.as('sold_90d'),
    avgDailySales: sql<string>`avg_daily_sales`.as('avg_daily_sales'),
    daysOfStock: sql<string>`days_of_stock`.as('days_of_stock'),
    lastSaleDate: sql<string>`last_sale_date`.as('last_sale_date'),
    velocityTier: sql<string>`velocity_tier`.as('velocity_tier'),
  }).from(sql`(
    SELECT
      p.product_id,
      p.sku,
      p.name AS product_name,
      p.category_id,
      c.name AS category_name,
      COALESCE(ps.quantity_on_hand, '0') AS quantity_on_hand,
      COALESCE(sales.sold_7d, '0') AS sold_7d,
      COALESCE(sales.sold_30d, '0') AS sold_30d,
      COALESCE(sales.sold_90d, '0') AS sold_90d,
      CASE
        WHEN COALESCE(sales.sold_30d, 0) > 0
        THEN CAST(CAST(sales.sold_30d AS REAL) / 30.0 AS TEXT)
        ELSE '0'
      END AS avg_daily_sales,
      CASE
        WHEN COALESCE(sales.sold_30d, 0) > 0
        THEN CAST(
          CAST(COALESCE(ps.quantity_on_hand, '0') AS REAL) /
          (CAST(sales.sold_30d AS REAL) / 30.0)
          AS TEXT
        )
        ELSE NULL
      END AS days_of_stock,
      sales.last_sale_date,
      CASE
        WHEN COALESCE(sales.sold_30d, 0) / 30.0 > 1 THEN 'FAST'
        WHEN COALESCE(sales.sold_30d, 0) / 30.0 > 0.1 THEN 'MEDIUM'
        ELSE 'SLOW'
      END AS velocity_tier
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.category_id
    LEFT JOIN product_summary ps ON p.product_id = ps.product_id AND ps.location_id IS NULL
    LEFT JOIN (
      SELECT
        sol.product_id,
        SUM(CASE
          WHEN julianday('now') - julianday(so.order_date) <= 7
          THEN CAST(COALESCE(sol.quantity_shipped, '0') AS REAL)
          ELSE 0
        END) AS sold_7d,
        SUM(CASE
          WHEN julianday('now') - julianday(so.order_date) <= 30
          THEN CAST(COALESCE(sol.quantity_shipped, '0') AS REAL)
          ELSE 0
        END) AS sold_30d,
        SUM(CASE
          WHEN julianday('now') - julianday(so.order_date) <= 90
          THEN CAST(COALESCE(sol.quantity_shipped, '0') AS REAL)
          ELSE 0
        END) AS sold_90d,
        MAX(so.order_date) AS last_sale_date
      FROM sales_order_lines sol
      INNER JOIN sales_orders so ON sol.sales_order_id = so.sales_order_id
      WHERE so.status IN ('Completed', 'Shipped', 'Closed')
        AND julianday('now') - julianday(so.order_date) <= 90
      GROUP BY sol.product_id
    ) sales ON p.product_id = sales.product_id
    WHERE p.is_active = 1
  )`);
});

/**
 * SQL to create this view manually
 */
export const productVelocitySQL = `
CREATE VIEW IF NOT EXISTS product_velocity AS
SELECT
  p.product_id,
  p.sku,
  p.name AS product_name,
  p.category_id,
  c.name AS category_name,
  COALESCE(ps.quantity_on_hand, '0') AS quantity_on_hand,
  COALESCE(sales.sold_7d, '0') AS sold_7d,
  COALESCE(sales.sold_30d, '0') AS sold_30d,
  COALESCE(sales.sold_90d, '0') AS sold_90d,
  CASE
    WHEN COALESCE(sales.sold_30d, 0) > 0
    THEN CAST(CAST(sales.sold_30d AS REAL) / 30.0 AS TEXT)
    ELSE '0'
  END AS avg_daily_sales,
  CASE
    WHEN COALESCE(sales.sold_30d, 0) > 0
    THEN CAST(
      CAST(COALESCE(ps.quantity_on_hand, '0') AS REAL) /
      (CAST(sales.sold_30d AS REAL) / 30.0)
      AS TEXT
    )
    ELSE NULL
  END AS days_of_stock,
  sales.last_sale_date,
  CASE
    WHEN COALESCE(sales.sold_30d, 0) / 30.0 > 1 THEN 'FAST'
    WHEN COALESCE(sales.sold_30d, 0) / 30.0 > 0.1 THEN 'MEDIUM'
    ELSE 'SLOW'
  END AS velocity_tier
FROM products p
LEFT JOIN categories c ON p.category_id = c.category_id
LEFT JOIN product_summary ps ON p.product_id = ps.product_id AND ps.location_id IS NULL
LEFT JOIN (
  SELECT
    sol.product_id,
    SUM(CASE
      WHEN julianday('now') - julianday(so.order_date) <= 7
      THEN CAST(COALESCE(sol.quantity_shipped, '0') AS REAL)
      ELSE 0
    END) AS sold_7d,
    SUM(CASE
      WHEN julianday('now') - julianday(so.order_date) <= 30
      THEN CAST(COALESCE(sol.quantity_shipped, '0') AS REAL)
      ELSE 0
    END) AS sold_30d,
    SUM(CASE
      WHEN julianday('now') - julianday(so.order_date) <= 90
      THEN CAST(COALESCE(sol.quantity_shipped, '0') AS REAL)
      ELSE 0
    END) AS sold_90d,
    MAX(so.order_date) AS last_sale_date
  FROM sales_order_lines sol
  INNER JOIN sales_orders so ON sol.sales_order_id = so.sales_order_id
  WHERE so.status IN ('Completed', 'Shipped', 'Closed')
    AND julianday('now') - julianday(so.order_date) <= 90
  GROUP BY sol.product_id
) sales ON p.product_id = sales.product_id
WHERE p.is_active = 1;
`;
