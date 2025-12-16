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
export declare const productVelocity: import("drizzle-orm/sqlite-core").SQLiteViewWithSelection<"product_velocity", false, {
    productId: import("drizzle-orm").SQL.Aliased<string>;
    sku: import("drizzle-orm").SQL.Aliased<string>;
    productName: import("drizzle-orm").SQL.Aliased<string>;
    categoryId: import("drizzle-orm").SQL.Aliased<string>;
    categoryName: import("drizzle-orm").SQL.Aliased<string>;
    quantityOnHand: import("drizzle-orm").SQL.Aliased<string>;
    sold7d: import("drizzle-orm").SQL.Aliased<string>;
    sold30d: import("drizzle-orm").SQL.Aliased<string>;
    sold90d: import("drizzle-orm").SQL.Aliased<string>;
    avgDailySales: import("drizzle-orm").SQL.Aliased<string>;
    daysOfStock: import("drizzle-orm").SQL.Aliased<string>;
    lastSaleDate: import("drizzle-orm").SQL.Aliased<string>;
    velocityTier: import("drizzle-orm").SQL.Aliased<string>;
}>;
/**
 * SQL to create this view manually
 */
export declare const productVelocitySQL = "\nCREATE VIEW IF NOT EXISTS product_velocity AS\nSELECT\n  p.product_id,\n  p.sku,\n  p.name AS product_name,\n  p.category_id,\n  c.name AS category_name,\n  COALESCE(ps.quantity_on_hand, '0') AS quantity_on_hand,\n  COALESCE(sales.sold_7d, '0') AS sold_7d,\n  COALESCE(sales.sold_30d, '0') AS sold_30d,\n  COALESCE(sales.sold_90d, '0') AS sold_90d,\n  CASE\n    WHEN COALESCE(sales.sold_30d, 0) > 0\n    THEN CAST(CAST(sales.sold_30d AS REAL) / 30.0 AS TEXT)\n    ELSE '0'\n  END AS avg_daily_sales,\n  CASE\n    WHEN COALESCE(sales.sold_30d, 0) > 0\n    THEN CAST(\n      CAST(COALESCE(ps.quantity_on_hand, '0') AS REAL) /\n      (CAST(sales.sold_30d AS REAL) / 30.0)\n      AS TEXT\n    )\n    ELSE NULL\n  END AS days_of_stock,\n  sales.last_sale_date,\n  CASE\n    WHEN COALESCE(sales.sold_30d, 0) / 30.0 > 1 THEN 'FAST'\n    WHEN COALESCE(sales.sold_30d, 0) / 30.0 > 0.1 THEN 'MEDIUM'\n    ELSE 'SLOW'\n  END AS velocity_tier\nFROM products p\nLEFT JOIN categories c ON p.category_id = c.category_id\nLEFT JOIN product_summary ps ON p.product_id = ps.product_id AND ps.location_id IS NULL\nLEFT JOIN (\n  SELECT\n    sol.product_id,\n    SUM(CASE\n      WHEN julianday('now') - julianday(so.order_date) <= 7\n      THEN CAST(COALESCE(sol.quantity_shipped, '0') AS REAL)\n      ELSE 0\n    END) AS sold_7d,\n    SUM(CASE\n      WHEN julianday('now') - julianday(so.order_date) <= 30\n      THEN CAST(COALESCE(sol.quantity_shipped, '0') AS REAL)\n      ELSE 0\n    END) AS sold_30d,\n    SUM(CASE\n      WHEN julianday('now') - julianday(so.order_date) <= 90\n      THEN CAST(COALESCE(sol.quantity_shipped, '0') AS REAL)\n      ELSE 0\n    END) AS sold_90d,\n    MAX(so.order_date) AS last_sale_date\n  FROM sales_order_lines sol\n  INNER JOIN sales_orders so ON sol.sales_order_id = so.sales_order_id\n  WHERE LOWER(so.status) IN ('completed', 'shipped', 'closed', 'fulfilled')\n    AND julianday('now') - julianday(so.order_date) <= 90\n  GROUP BY sol.product_id\n) sales ON p.product_id = sales.product_id\nWHERE p.is_active = 1;\n";
//# sourceMappingURL=product-velocity.d.ts.map