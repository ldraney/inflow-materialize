/**
 * Category Inventory Summary View
 *
 * Aggregate inventory metrics per category. Answers questions like:
 * - "How much stock do we have in each product category?"
 * - "What categories have the most SKUs?"
 * - "Category-level inventory value analysis"
 *
 * Note: Categories are hierarchical. This view shows leaf-level aggregations.
 * For rolled-up hierarchy totals, additional queries would be needed.
 *
 * Aggregates: products + productSummary grouped by category
 */
export declare const categoryInventorySummary: import("drizzle-orm/sqlite-core").SQLiteViewWithSelection<"category_inventory_summary", false, {
    categoryId: import("drizzle-orm").SQL.Aliased<string>;
    categoryName: import("drizzle-orm").SQL.Aliased<string>;
    parentCategoryId: import("drizzle-orm").SQL.Aliased<string>;
    parentCategoryName: import("drizzle-orm").SQL.Aliased<string>;
    skuCount: import("drizzle-orm").SQL.Aliased<number>;
    activeSkuCount: import("drizzle-orm").SQL.Aliased<number>;
    totalQuantityOnHand: import("drizzle-orm").SQL.Aliased<number>;
    totalQuantityAvailable: import("drizzle-orm").SQL.Aliased<number>;
    totalQuantityReserved: import("drizzle-orm").SQL.Aliased<number>;
    totalQuantityOnPurchaseOrder: import("drizzle-orm").SQL.Aliased<number>;
    totalQuantityOnSalesOrder: import("drizzle-orm").SQL.Aliased<number>;
    totalStockValue: import("drizzle-orm").SQL.Aliased<string>;
}>;
/**
 * SQL to create this view manually
 */
export declare const categoryInventorySummarySQL = "\nCREATE VIEW IF NOT EXISTS category_inventory_summary AS\nSELECT\n  c.category_id,\n  c.name AS category_name,\n  c.parent_category_id,\n  pc.name AS parent_category_name,\n\n  COUNT(DISTINCT p.product_id) AS sku_count,\n  SUM(CASE WHEN p.is_active = 1 THEN 1 ELSE 0 END) AS active_sku_count,\n\n  SUM(CAST(COALESCE(ps.quantity_on_hand, '0') AS REAL)) AS total_quantity_on_hand,\n  SUM(CAST(COALESCE(ps.quantity_available, '0') AS REAL)) AS total_quantity_available,\n  SUM(CAST(COALESCE(ps.quantity_reserved, '0') AS REAL)) AS total_quantity_reserved,\n  SUM(CAST(COALESCE(ps.quantity_on_purchase_order, '0') AS REAL)) AS total_quantity_on_purchase_order,\n  SUM(CAST(COALESCE(ps.quantity_on_sales_order, '0') AS REAL)) AS total_quantity_on_sales_order,\n\n  CAST(SUM(\n    CAST(COALESCE(ps.quantity_on_hand, '0') AS REAL) *\n    CAST(COALESCE(ps.average_cost, '0') AS REAL)\n  ) AS TEXT) AS total_stock_value\n\nFROM categories c\nLEFT JOIN categories pc ON c.parent_category_id = pc.category_id\nLEFT JOIN products p ON c.category_id = p.category_id\nLEFT JOIN product_summary ps ON p.product_id = ps.product_id AND ps.location_id IS NULL\nGROUP BY c.category_id, c.name, c.parent_category_id, pc.name;\n";
//# sourceMappingURL=category-inventory-summary.d.ts.map