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
export declare const customer360: import("drizzle-orm/sqlite-core").SQLiteViewWithSelection<"customer_360", false, {
    customerId: import("drizzle-orm").SQL.Aliased<string>;
    customerName: import("drizzle-orm").SQL.Aliased<string>;
    customerCode: import("drizzle-orm").SQL.Aliased<string>;
    email: import("drizzle-orm").SQL.Aliased<string>;
    phone: import("drizzle-orm").SQL.Aliased<string>;
    isActive: import("drizzle-orm").SQL.Aliased<number>;
    pricingSchemeId: import("drizzle-orm").SQL.Aliased<string>;
    pricingSchemeName: import("drizzle-orm").SQL.Aliased<string>;
    paymentTermsId: import("drizzle-orm").SQL.Aliased<string>;
    paymentTermsName: import("drizzle-orm").SQL.Aliased<string>;
    totalOrders: import("drizzle-orm").SQL.Aliased<number>;
    completedOrders: import("drizzle-orm").SQL.Aliased<number>;
    cancelledOrders: import("drizzle-orm").SQL.Aliased<number>;
    totalRevenue: import("drizzle-orm").SQL.Aliased<string>;
    averageOrderValue: import("drizzle-orm").SQL.Aliased<string>;
    openOrders: import("drizzle-orm").SQL.Aliased<number>;
    openOrdersValue: import("drizzle-orm").SQL.Aliased<string>;
    firstOrderDate: import("drizzle-orm").SQL.Aliased<string>;
    lastOrderDate: import("drizzle-orm").SQL.Aliased<string>;
}>;
/**
 * SQL to create this view manually
 */
export declare const customer360SQL = "\nCREATE VIEW IF NOT EXISTS customer_360 AS\nSELECT\n  c.customer_id,\n  c.name AS customer_name,\n  c.customer_code,\n  c.email,\n  c.phone,\n  c.is_active,\n\n  c.pricing_scheme_id,\n  ps.name AS pricing_scheme_name,\n  c.payment_terms_id,\n  pt.name AS payment_terms_name,\n\n  COALESCE(order_stats.total_orders, 0) AS total_orders,\n  COALESCE(order_stats.completed_orders, 0) AS completed_orders,\n  COALESCE(order_stats.cancelled_orders, 0) AS cancelled_orders,\n\n  COALESCE(order_stats.total_revenue, '0') AS total_revenue,\n  CASE\n    WHEN COALESCE(order_stats.completed_orders, 0) > 0\n    THEN CAST(CAST(COALESCE(order_stats.total_revenue, '0') AS REAL) / order_stats.completed_orders AS TEXT)\n    ELSE '0'\n  END AS average_order_value,\n\n  COALESCE(order_stats.open_orders, 0) AS open_orders,\n  COALESCE(order_stats.open_orders_value, '0') AS open_orders_value,\n\n  order_stats.first_order_date,\n  order_stats.last_order_date\n\nFROM customers c\nLEFT JOIN pricing_schemes ps ON c.pricing_scheme_id = ps.pricing_scheme_id\nLEFT JOIN payment_terms pt ON c.payment_terms_id = pt.payment_terms_id\nLEFT JOIN (\n  SELECT\n    customer_id,\n    COUNT(*) AS total_orders,\n    SUM(CASE WHEN status IN ('Completed', 'Shipped', 'Closed') THEN 1 ELSE 0 END) AS completed_orders,\n    SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END) AS cancelled_orders,\n    SUM(CASE WHEN status NOT IN ('Completed', 'Shipped', 'Closed', 'Cancelled') THEN 1 ELSE 0 END) AS open_orders,\n    SUM(CASE WHEN status IN ('Completed', 'Shipped', 'Closed') THEN CAST(COALESCE(total, '0') AS REAL) ELSE 0 END) AS total_revenue,\n    SUM(CASE WHEN status NOT IN ('Completed', 'Shipped', 'Closed', 'Cancelled') THEN CAST(COALESCE(total, '0') AS REAL) ELSE 0 END) AS open_orders_value,\n    MIN(order_date) AS first_order_date,\n    MAX(order_date) AS last_order_date\n  FROM sales_orders\n  GROUP BY customer_id\n) order_stats ON c.customer_id = order_stats.customer_id;\n";
//# sourceMappingURL=customer-360.d.ts.map