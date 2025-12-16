import { sqliteView } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
/**
 * Product Inventory Status View
 *
 * The "product card" essentials - everything you need to display a product's
 * current inventory position in one row.
 *
 * Joins: products + categories + productSummary (global) + reorderSettings
 */
export const productInventoryStatus = sqliteView('product_inventory_status').as((qb) => {
    return qb
        .select({
        // Product identifiers
        productId: sql `p.product_id`.as('product_id'),
        sku: sql `p.sku`.as('sku'),
        name: sql `p.name`.as('name'),
        description: sql `p.description`.as('description'),
        itemType: sql `p.item_type`.as('item_type'),
        isActive: sql `p.is_active`.as('is_active'),
        // Category info
        categoryId: sql `p.category_id`.as('category_id'),
        categoryName: sql `c.name`.as('category_name'),
        // Inventory quantities (from global productSummary where locationId is null)
        quantityOnHand: sql `ps.quantity_on_hand`.as('quantity_on_hand'),
        quantityAvailable: sql `ps.quantity_available`.as('quantity_available'),
        quantityReserved: sql `ps.quantity_reserved`.as('quantity_reserved'),
        quantityOnPurchaseOrder: sql `ps.quantity_on_purchase_order`.as('quantity_on_purchase_order'),
        quantityOnWorkOrder: sql `ps.quantity_on_work_order`.as('quantity_on_work_order'),
        quantityInTransit: sql `ps.quantity_in_transit`.as('quantity_in_transit'),
        quantityBuildable: sql `ps.quantity_buildable`.as('quantity_buildable'),
        // Reorder settings (global - where locationId is null)
        reorderPoint: sql `rs.reorder_point`.as('reorder_point'),
        reorderQuantity: sql `rs.reorder_quantity`.as('reorder_quantity'),
        enableReordering: sql `rs.enable_reordering`.as('enable_reordering'),
        preferredVendorId: sql `rs.vendor_id`.as('preferred_vendor_id'),
        // Computed: is this product below reorder point?
        isBelowReorder: sql `
        CASE
          WHEN rs.enable_reordering = 1
            AND rs.reorder_point IS NOT NULL
            AND CAST(COALESCE(ps.quantity_available, '0') AS REAL) <= CAST(rs.reorder_point AS REAL)
          THEN 1
          ELSE 0
        END
      `.as('is_below_reorder'),
        // Image
        imageUrl: sql `ps.image_small_url`.as('image_url'),
    })
        .from(sql `products p`)
        .leftJoin(sql `categories c`, sql `p.category_id = c.category_id`)
        .leftJoin(sql `product_summary ps`, sql `p.product_id = ps.product_id AND ps.location_id IS NULL`)
        .leftJoin(sql `reorder_settings rs`, sql `p.product_id = rs.product_id AND rs.location_id IS NULL`);
});
/**
 * SQL to create this view manually (for reference or direct execution)
 */
export const productInventoryStatusSQL = `
CREATE VIEW IF NOT EXISTS product_inventory_status AS
SELECT
  p.product_id,
  p.sku,
  p.name,
  p.description,
  p.item_type,
  p.is_active,

  p.category_id,
  c.name AS category_name,

  ps.quantity_on_hand,
  ps.quantity_available,
  ps.quantity_reserved,
  ps.quantity_on_purchase_order,
  ps.quantity_on_work_order,
  ps.quantity_in_transit,
  ps.quantity_buildable,

  rs.reorder_point,
  rs.reorder_quantity,
  rs.enable_reordering,
  rs.vendor_id AS preferred_vendor_id,

  CASE
    WHEN rs.enable_reordering = 1
      AND rs.reorder_point IS NOT NULL
      AND CAST(COALESCE(ps.quantity_available, '0') AS REAL) <= CAST(rs.reorder_point AS REAL)
    THEN 1
    ELSE 0
  END AS is_below_reorder,

  ps.image_small_url AS image_url

FROM products p
LEFT JOIN categories c ON p.category_id = c.category_id
LEFT JOIN product_summary ps ON p.product_id = ps.product_id AND ps.location_id IS NULL
LEFT JOIN reorder_settings rs ON p.product_id = rs.product_id AND rs.location_id IS NULL;
`;
//# sourceMappingURL=product-inventory-status.js.map