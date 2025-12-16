import { sqliteView } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
/**
 * Serial Inventory View
 *
 * Serial number tracked inventory with current location.
 * Only includes inventory lines that have a serial number.
 * Each serial number should have quantity = 1.
 *
 * Use cases:
 * - "Where is serial number XYZ?"
 * - "List all serial numbers for product ABC"
 * - "Which serials are at Warehouse A?"
 * - Warranty tracking, asset management
 *
 * Joins: inventoryLines + products + locations
 */
export const serialInventory = sqliteView('serial_inventory').as((qb) => {
    return qb
        .select({
        // Primary key
        inventoryLineId: sql `il.inventory_line_id`.as('inventory_line_id'),
        // Product info
        productId: sql `il.product_id`.as('product_id'),
        sku: sql `p.sku`.as('sku'),
        productName: sql `p.name`.as('product_name'),
        categoryId: sql `p.category_id`.as('category_id'),
        categoryName: sql `c.name`.as('category_name'),
        // Location info
        locationId: sql `il.location_id`.as('location_id'),
        locationName: sql `l.name`.as('location_name'),
        locationAbbreviation: sql `l.abbreviation`.as('location_abbreviation'),
        sublocation: sql `il.sublocation`.as('sublocation'),
        // Serial tracking
        serial: sql `il.serial`.as('serial'),
        quantityOnHand: sql `il.quantity_on_hand`.as('quantity_on_hand'),
        // May also have lot
        lotId: sql `il.lot_id`.as('lot_id'),
    })
        .from(sql `inventory_lines il`)
        .innerJoin(sql `products p`, sql `il.product_id = p.product_id`)
        .leftJoin(sql `locations l`, sql `il.location_id = l.location_id`)
        .leftJoin(sql `categories c`, sql `p.category_id = c.category_id`)
        .where(sql `il.serial IS NOT NULL AND il.serial != ''`);
});
/**
 * SQL to create this view manually
 */
export const serialInventorySQL = `
CREATE VIEW IF NOT EXISTS serial_inventory AS
SELECT
  il.inventory_line_id,

  il.product_id,
  p.sku,
  p.name AS product_name,
  p.category_id,
  c.name AS category_name,

  il.location_id,
  l.name AS location_name,
  l.abbreviation AS location_abbreviation,
  il.sublocation,

  il.serial,
  il.quantity_on_hand,

  il.lot_id

FROM inventory_lines il
INNER JOIN products p ON il.product_id = p.product_id
LEFT JOIN locations l ON il.location_id = l.location_id
LEFT JOIN categories c ON p.category_id = c.category_id
WHERE il.serial IS NOT NULL AND il.serial != '';
`;
//# sourceMappingURL=serial-inventory.js.map