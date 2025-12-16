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
export declare const serialInventory: import("drizzle-orm/sqlite-core").SQLiteViewWithSelection<"serial_inventory", false, {
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
    serial: import("drizzle-orm").SQL.Aliased<string>;
    quantityOnHand: import("drizzle-orm").SQL.Aliased<string>;
    lotId: import("drizzle-orm").SQL.Aliased<string>;
}>;
/**
 * SQL to create this view manually
 */
export declare const serialInventorySQL = "\nCREATE VIEW IF NOT EXISTS serial_inventory AS\nSELECT\n  il.inventory_line_id,\n\n  il.product_id,\n  p.sku,\n  p.name AS product_name,\n  p.category_id,\n  c.name AS category_name,\n\n  il.location_id,\n  l.name AS location_name,\n  l.abbreviation AS location_abbreviation,\n  il.sublocation,\n\n  il.serial,\n  il.quantity_on_hand,\n\n  il.lot_id\n\nFROM inventory_lines il\nINNER JOIN products p ON il.product_id = p.product_id\nLEFT JOIN locations l ON il.location_id = l.location_id\nLEFT JOIN categories c ON p.category_id = c.category_id\nWHERE il.serial IS NOT NULL AND il.serial != '';\n";
//# sourceMappingURL=serial-inventory.d.ts.map