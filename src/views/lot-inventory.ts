import { sqliteView } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

/**
 * Lot Inventory View
 *
 * Lot-tracked inventory with expiry estimation based on shelfLifeDays.
 * Only includes inventory lines that have a lot_id.
 *
 * Use cases:
 * - "What lots do we have and when do they expire?"
 * - "Which lots should we pick first (FEFO)?"
 * - "Show me inventory expiring in the next 30 days"
 * - Food/pharma/chemical compliance
 *
 * Joins: inventoryLines + products + locations
 * Note: Expiry is estimated from shelf_life_days, not a stored expiry date
 */
export const lotInventory = sqliteView('lot_inventory').as((qb) => {
  return qb
    .select({
      // Primary key
      inventoryLineId: sql<string>`il.inventory_line_id`.as('inventory_line_id'),

      // Product info
      productId: sql<string>`il.product_id`.as('product_id'),
      sku: sql<string>`p.sku`.as('sku'),
      productName: sql<string>`p.name`.as('product_name'),
      categoryId: sql<string>`p.category_id`.as('category_id'),
      categoryName: sql<string>`c.name`.as('category_name'),

      // Location info
      locationId: sql<string>`il.location_id`.as('location_id'),
      locationName: sql<string>`l.name`.as('location_name'),
      locationAbbreviation: sql<string>`l.abbreviation`.as('location_abbreviation'),
      sublocation: sql<string>`il.sublocation`.as('sublocation'),

      // Lot tracking
      lotId: sql<string>`il.lot_id`.as('lot_id'),
      quantityOnHand: sql<string>`il.quantity_on_hand`.as('quantity_on_hand'),

      // Expiry info
      shelfLifeDays: sql<number>`p.shelf_life_days`.as('shelf_life_days'),
      trackExpiry: sql<number>`p.track_expiry`.as('track_expiry'),
    })
    .from(sql`inventory_lines il`)
    .innerJoin(sql`products p`, sql`il.product_id = p.product_id`)
    .leftJoin(sql`locations l`, sql`il.location_id = l.location_id`)
    .leftJoin(sql`categories c`, sql`p.category_id = c.category_id`)
    .where(sql`il.lot_id IS NOT NULL AND il.lot_id != ''`);
});

/**
 * SQL to create this view manually
 */
export const lotInventorySQL = `
CREATE VIEW IF NOT EXISTS lot_inventory AS
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

  il.lot_id,
  il.quantity_on_hand,

  p.shelf_life_days,
  p.track_expiry

FROM inventory_lines il
INNER JOIN products p ON il.product_id = p.product_id
LEFT JOIN locations l ON il.location_id = l.location_id
LEFT JOIN categories c ON p.category_id = c.category_id
WHERE il.lot_id IS NOT NULL AND il.lot_id != '';
`;
