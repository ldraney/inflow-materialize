import { sqliteView } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
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
export const categoryInventorySummary = sqliteView('category_inventory_summary').as((qb) => {
    return qb
        .select({
        // Category info
        categoryId: sql `c.category_id`.as('category_id'),
        categoryName: sql `c.name`.as('category_name'),
        parentCategoryId: sql `c.parent_category_id`.as('parent_category_id'),
        parentCategoryName: sql `pc.name`.as('parent_category_name'),
        // Product counts
        skuCount: sql `COUNT(DISTINCT p.product_id)`.as('sku_count'),
        activeSkuCount: sql `SUM(CASE WHEN p.is_active = 1 THEN 1 ELSE 0 END)`.as('active_sku_count'),
        // Quantity metrics (global, not location-specific)
        totalQuantityOnHand: sql `SUM(CAST(COALESCE(ps.quantity_on_hand, '0') AS REAL))`.as('total_quantity_on_hand'),
        totalQuantityAvailable: sql `SUM(CAST(COALESCE(ps.quantity_available, '0') AS REAL))`.as('total_quantity_available'),
        totalQuantityReserved: sql `SUM(CAST(COALESCE(ps.quantity_reserved, '0') AS REAL))`.as('total_quantity_reserved'),
        totalQuantityOnPurchaseOrder: sql `SUM(CAST(COALESCE(ps.quantity_on_purchase_order, '0') AS REAL))`.as('total_quantity_on_purchase_order'),
        totalQuantityOnSalesOrder: sql `SUM(CAST(COALESCE(ps.quantity_on_sales_order, '0') AS REAL))`.as('total_quantity_on_sales_order'),
        // Value metrics (using average cost from product_summary)
        totalStockValue: sql `
        CAST(SUM(
          CAST(COALESCE(ps.quantity_on_hand, '0') AS REAL) *
          CAST(COALESCE(ps.average_cost, '0') AS REAL)
        ) AS TEXT)
      `.as('total_stock_value'),
    })
        .from(sql `categories c`)
        .leftJoin(sql `categories pc`, sql `c.parent_category_id = pc.category_id`)
        .leftJoin(sql `products p`, sql `c.category_id = p.category_id`)
        .leftJoin(sql `product_summary ps`, sql `p.product_id = ps.product_id AND ps.location_id IS NULL`)
        .groupBy(sql `c.category_id, c.name, c.parent_category_id, pc.name`);
});
/**
 * SQL to create this view manually
 */
export const categoryInventorySummarySQL = `
CREATE VIEW IF NOT EXISTS category_inventory_summary AS
SELECT
  c.category_id,
  c.name AS category_name,
  c.parent_category_id,
  pc.name AS parent_category_name,

  COUNT(DISTINCT p.product_id) AS sku_count,
  SUM(CASE WHEN p.is_active = 1 THEN 1 ELSE 0 END) AS active_sku_count,

  SUM(CAST(COALESCE(ps.quantity_on_hand, '0') AS REAL)) AS total_quantity_on_hand,
  SUM(CAST(COALESCE(ps.quantity_available, '0') AS REAL)) AS total_quantity_available,
  SUM(CAST(COALESCE(ps.quantity_reserved, '0') AS REAL)) AS total_quantity_reserved,
  SUM(CAST(COALESCE(ps.quantity_on_purchase_order, '0') AS REAL)) AS total_quantity_on_purchase_order,
  SUM(CAST(COALESCE(ps.quantity_on_sales_order, '0') AS REAL)) AS total_quantity_on_sales_order,

  CAST(SUM(
    CAST(COALESCE(ps.quantity_on_hand, '0') AS REAL) *
    CAST(COALESCE(ps.average_cost, '0') AS REAL)
  ) AS TEXT) AS total_stock_value

FROM categories c
LEFT JOIN categories pc ON c.parent_category_id = pc.category_id
LEFT JOIN products p ON c.category_id = p.category_id
LEFT JOIN product_summary ps ON p.product_id = ps.product_id AND ps.location_id IS NULL
GROUP BY c.category_id, c.name, c.parent_category_id, pc.name;
`;
//# sourceMappingURL=category-inventory-summary.js.map