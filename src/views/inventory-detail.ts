import { sqliteView } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

/**
 * Inventory Detail View
 *
 * Full granularity inventory lines with product and location names.
 * Shows sublocation, serial, and lot for warehouse operations.
 *
 * Use cases:
 * - "What's in bin A-01-02?"
 * - "Find serial number XYZ"
 * - "What lots do we have for this product?"
 * - Physical inventory counts
 *
 * Joins: inventoryLines + products + locations + categories
 */
export const inventoryDetail = sqliteView('inventory_detail').as((qb) => {
  return qb
    .select({
      // Primary key
      inventoryLineId: sql<string>`il.inventory_line_id`.as('inventory_line_id'),

      // Product info
      productId: sql<string>`il.product_id`.as('product_id'),
      sku: sql<string>`p.sku`.as('sku'),
      productName: sql<string>`p.name`.as('product_name'),
      itemType: sql<string>`p.item_type`.as('item_type'),
      categoryId: sql<string>`p.category_id`.as('category_id'),
      categoryName: sql<string>`c.name`.as('category_name'),

      // Location info
      locationId: sql<string>`il.location_id`.as('location_id'),
      locationName: sql<string>`l.name`.as('location_name'),
      locationAbbreviation: sql<string>`l.abbreviation`.as('location_abbreviation'),

      // Granular location
      sublocation: sql<string>`il.sublocation`.as('sublocation'),

      // Tracking
      serial: sql<string>`il.serial`.as('serial'),
      lotId: sql<string>`il.lot_id`.as('lot_id'),

      // Quantity
      quantityOnHand: sql<string>`il.quantity_on_hand`.as('quantity_on_hand'),

      // Tracking flags (from product)
      trackSerials: sql<number>`p.track_serials`.as('track_serials'),
      trackLots: sql<number>`p.track_lots`.as('track_lots'),
      trackExpiry: sql<number>`p.track_expiry`.as('track_expiry'),
      shelfLifeDays: sql<number>`p.shelf_life_days`.as('shelf_life_days'),
    })
    .from(sql`inventory_lines il`)
    .innerJoin(sql`products p`, sql`il.product_id = p.product_id`)
    .leftJoin(sql`locations l`, sql`il.location_id = l.location_id`)
    .leftJoin(sql`categories c`, sql`p.category_id = c.category_id`);
});

/**
 * SQL to create this view manually
 */
export const inventoryDetailSQL = `
CREATE VIEW IF NOT EXISTS inventory_detail AS
SELECT
  il.inventory_line_id,

  il.product_id,
  p.sku,
  p.name AS product_name,
  p.item_type,
  p.category_id,
  c.name AS category_name,

  il.location_id,
  l.name AS location_name,
  l.abbreviation AS location_abbreviation,

  il.sublocation,

  il.serial,
  il.lot_id,

  il.quantity_on_hand,

  p.track_serials,
  p.track_lots,
  p.track_expiry,
  p.shelf_life_days

FROM inventory_lines il
INNER JOIN products p ON il.product_id = p.product_id
LEFT JOIN locations l ON il.location_id = l.location_id
LEFT JOIN categories c ON p.category_id = c.category_id;
`;
