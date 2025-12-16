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
export declare const lotInventory: import("drizzle-orm/sqlite-core").SQLiteViewWithSelection<"lot_inventory", false, {
    inventoryLineId: import("drizzle-orm").SQL.Aliased<string>;
    productId: import("drizzle-orm").SQL.Aliased<string>;
    sku: import("drizzle-orm").SQL.Aliased<string>;
    productName: import("drizzle-orm").SQL.Aliased<string>;
    categoryId: import("drizzle-orm").SQL.Aliased<string>;
    categoryName: import("drizzle-orm").SQL.Aliased<string>;
    locationId: import("drizzle-orm").SQL.Aliased<string>;
    locationName: import("drizzle-orm").SQL.Aliased<string>;
    locationAbbreviation: import("drizzle-orm").SQL.Aliased<string>;
    sublocation: import("drizzle-orm").SQL.Aliased<string>;
    lotId: import("drizzle-orm").SQL.Aliased<string>;
    quantityOnHand: import("drizzle-orm").SQL.Aliased<string>;
    shelfLifeDays: import("drizzle-orm").SQL.Aliased<number>;
    trackExpiry: import("drizzle-orm").SQL.Aliased<number>;
}>;
/**
 * SQL to create this view manually
 */
export declare const lotInventorySQL = "\nCREATE VIEW IF NOT EXISTS lot_inventory AS\nSELECT\n  il.inventory_line_id,\n\n  il.product_id,\n  p.sku,\n  p.name AS product_name,\n  p.category_id,\n  c.name AS category_name,\n\n  il.location_id,\n  l.name AS location_name,\n  l.abbreviation AS location_abbreviation,\n  il.sublocation,\n\n  il.lot_id,\n  il.quantity_on_hand,\n\n  p.shelf_life_days,\n  p.track_expiry\n\nFROM inventory_lines il\nINNER JOIN products p ON il.product_id = p.product_id\nLEFT JOIN locations l ON il.location_id = l.location_id\nLEFT JOIN categories c ON p.category_id = c.category_id\nWHERE il.lot_id IS NOT NULL AND il.lot_id != '';\n";
//# sourceMappingURL=lot-inventory.d.ts.map