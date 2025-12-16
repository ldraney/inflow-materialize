import { sqliteView } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
/**
 * Reorder Alerts View
 *
 * Products that need to be reordered - below reorder point with reordering enabled.
 * Includes preferred vendor info and suggested order quantity.
 *
 * Joins: products + productSummary + reorderSettings + vendors + vendorItems
 */
export const reorderAlerts = sqliteView('reorder_alerts').as((qb) => {
    return qb
        .select({
        // Product info
        productId: sql `p.product_id`.as('product_id'),
        sku: sql `p.sku`.as('sku'),
        productName: sql `p.name`.as('product_name'),
        categoryId: sql `p.category_id`.as('category_id'),
        // Current inventory position
        quantityOnHand: sql `ps.quantity_on_hand`.as('quantity_on_hand'),
        quantityAvailable: sql `ps.quantity_available`.as('quantity_available'),
        quantityOnPurchaseOrder: sql `ps.quantity_on_purchase_order`.as('quantity_on_purchase_order'),
        // Reorder settings
        reorderPoint: sql `rs.reorder_point`.as('reorder_point'),
        reorderQuantity: sql `rs.reorder_quantity`.as('reorder_quantity'),
        // How much we're short by
        shortfallQuantity: sql `
        CAST(rs.reorder_point AS REAL) - CAST(COALESCE(ps.quantity_available, '0') AS REAL)
      `.as('shortfall_quantity'),
        // Suggested order = reorder quantity, or shortfall if no reorder qty set
        suggestedOrderQuantity: sql `
        COALESCE(rs.reorder_quantity,
          CAST(rs.reorder_point AS REAL) - CAST(COALESCE(ps.quantity_available, '0') AS REAL)
        )
      `.as('suggested_order_quantity'),
        // Preferred vendor
        preferredVendorId: sql `rs.vendor_id`.as('preferred_vendor_id'),
        vendorName: sql `v.name`.as('vendor_name'),
        vendorCode: sql `v.vendor_code`.as('vendor_code'),
        // Vendor item details (cost and lead time from preferred vendor)
        vendorItemCode: sql `vi.vendor_item_code`.as('vendor_item_code'),
        vendorCost: sql `vi.cost`.as('vendor_cost'),
        leadTimeDays: sql `vi.lead_time_days`.as('lead_time_days'),
        // Estimated order value
        estimatedOrderValue: sql `
        CAST(COALESCE(rs.reorder_quantity,
          CAST(rs.reorder_point AS REAL) - CAST(COALESCE(ps.quantity_available, '0') AS REAL)
        ) AS REAL) * CAST(COALESCE(vi.cost, '0') AS REAL)
      `.as('estimated_order_value'),
    })
        .from(sql `products p`)
        .innerJoin(sql `reorder_settings rs`, sql `p.product_id = rs.product_id AND rs.location_id IS NULL`)
        .leftJoin(sql `product_summary ps`, sql `p.product_id = ps.product_id AND ps.location_id IS NULL`)
        .leftJoin(sql `vendors v`, sql `rs.vendor_id = v.vendor_id`)
        .leftJoin(sql `vendor_items vi`, sql `rs.vendor_id = vi.vendor_id AND p.product_id = vi.product_id`)
        .where(sql `
      rs.enable_reordering = 1
      AND rs.reorder_point IS NOT NULL
      AND CAST(COALESCE(ps.quantity_available, '0') AS REAL) <= CAST(rs.reorder_point AS REAL)
      AND p.is_active = 1
    `);
});
/**
 * SQL to create this view manually (for reference or direct execution)
 */
export const reorderAlertsSQL = `
CREATE VIEW IF NOT EXISTS reorder_alerts AS
SELECT
  p.product_id,
  p.sku,
  p.name AS product_name,
  p.category_id,

  ps.quantity_on_hand,
  ps.quantity_available,
  ps.quantity_on_purchase_order,

  rs.reorder_point,
  rs.reorder_quantity,

  CAST(rs.reorder_point AS REAL) - CAST(COALESCE(ps.quantity_available, '0') AS REAL) AS shortfall_quantity,

  COALESCE(rs.reorder_quantity,
    CAST(rs.reorder_point AS REAL) - CAST(COALESCE(ps.quantity_available, '0') AS REAL)
  ) AS suggested_order_quantity,

  rs.vendor_id AS preferred_vendor_id,
  v.name AS vendor_name,
  v.vendor_code,

  vi.vendor_item_code,
  vi.cost AS vendor_cost,
  vi.lead_time_days,

  CAST(COALESCE(rs.reorder_quantity,
    CAST(rs.reorder_point AS REAL) - CAST(COALESCE(ps.quantity_available, '0') AS REAL)
  ) AS REAL) * CAST(COALESCE(vi.cost, '0') AS REAL) AS estimated_order_value

FROM products p
INNER JOIN reorder_settings rs ON p.product_id = rs.product_id AND rs.location_id IS NULL
LEFT JOIN product_summary ps ON p.product_id = ps.product_id AND ps.location_id IS NULL
LEFT JOIN vendors v ON rs.vendor_id = v.vendor_id
LEFT JOIN vendor_items vi ON rs.vendor_id = vi.vendor_id AND p.product_id = vi.product_id
WHERE rs.enable_reordering = 1
  AND rs.reorder_point IS NOT NULL
  AND CAST(COALESCE(ps.quantity_available, '0') AS REAL) <= CAST(rs.reorder_point AS REAL)
  AND p.is_active = 1;
`;
//# sourceMappingURL=reorder-alerts.js.map