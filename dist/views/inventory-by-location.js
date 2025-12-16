import { sqliteView } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
/**
 * Inventory By Location View
 *
 * Product inventory broken out by location. Shows quantities at each
 * warehouse/location rather than company-wide totals.
 *
 * Use cases:
 * - "What do we have at Warehouse A?"
 * - "Where is this product stocked?"
 * - Location-level inventory management
 *
 * Joins: productSummary + products + locations + categories
 */
export const inventoryByLocation = sqliteView('inventory_by_location').as((qb) => {
    return qb
        .select({
        // Composite key
        productId: sql `ps.product_id`.as('product_id'),
        locationId: sql `ps.location_id`.as('location_id'),
        // Product info
        sku: sql `p.sku`.as('sku'),
        productName: sql `p.name`.as('product_name'),
        itemType: sql `p.item_type`.as('item_type'),
        isActive: sql `p.is_active`.as('is_active'),
        categoryId: sql `p.category_id`.as('category_id'),
        categoryName: sql `c.name`.as('category_name'),
        // Location info
        locationName: sql `l.name`.as('location_name'),
        locationAbbreviation: sql `l.abbreviation`.as('location_abbreviation'),
        isShippable: sql `l.is_shippable`.as('is_shippable'),
        isReceivable: sql `l.is_receivable`.as('is_receivable'),
        // Inventory quantities
        quantityOnHand: sql `ps.quantity_on_hand`.as('quantity_on_hand'),
        quantityAvailable: sql `ps.quantity_available`.as('quantity_available'),
        quantityReserved: sql `ps.quantity_reserved`.as('quantity_reserved'),
        quantityReservedForSales: sql `ps.quantity_reserved_for_sales`.as('quantity_reserved_for_sales'),
        quantityReservedForManufacturing: sql `ps.quantity_reserved_for_manufacturing`.as('quantity_reserved_for_manufacturing'),
        quantityReservedForTransfers: sql `ps.quantity_reserved_for_transfers`.as('quantity_reserved_for_transfers'),
        quantityOnPurchaseOrder: sql `ps.quantity_on_purchase_order`.as('quantity_on_purchase_order'),
        quantityOnWorkOrder: sql `ps.quantity_on_work_order`.as('quantity_on_work_order'),
        quantityOnTransferOrder: sql `ps.quantity_on_transfer_order`.as('quantity_on_transfer_order'),
        quantityPicked: sql `ps.quantity_picked`.as('quantity_picked'),
        quantityInTransit: sql `ps.quantity_in_transit`.as('quantity_in_transit'),
        // Image
        imageUrl: sql `ps.image_small_url`.as('image_url'),
    })
        .from(sql `product_summary ps`)
        .innerJoin(sql `products p`, sql `ps.product_id = p.product_id`)
        .innerJoin(sql `locations l`, sql `ps.location_id = l.location_id`)
        .leftJoin(sql `categories c`, sql `p.category_id = c.category_id`)
        .where(sql `ps.location_id IS NOT NULL`);
});
/**
 * SQL to create this view manually
 */
export const inventoryByLocationSQL = `
CREATE VIEW IF NOT EXISTS inventory_by_location AS
SELECT
  ps.product_id,
  ps.location_id,

  p.sku,
  p.name AS product_name,
  p.item_type,
  p.is_active,
  p.category_id,
  c.name AS category_name,

  l.name AS location_name,
  l.abbreviation AS location_abbreviation,
  l.is_shippable,
  l.is_receivable,

  ps.quantity_on_hand,
  ps.quantity_available,
  ps.quantity_reserved,
  ps.quantity_reserved_for_sales,
  ps.quantity_reserved_for_manufacturing,
  ps.quantity_reserved_for_transfers,
  ps.quantity_on_purchase_order,
  ps.quantity_on_work_order,
  ps.quantity_on_transfer_order,
  ps.quantity_picked,
  ps.quantity_in_transit,

  ps.image_small_url AS image_url

FROM product_summary ps
INNER JOIN products p ON ps.product_id = p.product_id
INNER JOIN locations l ON ps.location_id = l.location_id
LEFT JOIN categories c ON p.category_id = c.category_id
WHERE ps.location_id IS NOT NULL;
`;
//# sourceMappingURL=inventory-by-location.js.map