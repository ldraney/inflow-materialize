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
export declare const inventoryDetail: import("drizzle-orm/sqlite-core").SQLiteViewWithSelection<"inventory_detail", false, {
    inventoryLineId: import("drizzle-orm").SQL.Aliased<string>;
    productId: import("drizzle-orm").SQL.Aliased<string>;
    sku: import("drizzle-orm").SQL.Aliased<string>;
    productName: import("drizzle-orm").SQL.Aliased<string>;
    itemType: import("drizzle-orm").SQL.Aliased<string>;
    categoryId: import("drizzle-orm").SQL.Aliased<string>;
    categoryName: import("drizzle-orm").SQL.Aliased<string>;
    locationId: import("drizzle-orm").SQL.Aliased<string>;
    locationName: import("drizzle-orm").SQL.Aliased<string>;
    locationAbbreviation: import("drizzle-orm").SQL.Aliased<string>;
    sublocation: import("drizzle-orm").SQL.Aliased<string>;
    serial: import("drizzle-orm").SQL.Aliased<string>;
    lotId: import("drizzle-orm").SQL.Aliased<string>;
    quantityOnHand: import("drizzle-orm").SQL.Aliased<string>;
    trackSerials: import("drizzle-orm").SQL.Aliased<number>;
    trackLots: import("drizzle-orm").SQL.Aliased<number>;
    trackExpiry: import("drizzle-orm").SQL.Aliased<number>;
    shelfLifeDays: import("drizzle-orm").SQL.Aliased<number>;
}>;
/**
 * SQL to create this view manually
 */
export declare const inventoryDetailSQL = "\nCREATE VIEW IF NOT EXISTS inventory_detail AS\nSELECT\n  il.inventory_line_id,\n\n  il.product_id,\n  p.sku,\n  p.name AS product_name,\n  p.item_type,\n  p.category_id,\n  c.name AS category_name,\n\n  il.location_id,\n  l.name AS location_name,\n  l.abbreviation AS location_abbreviation,\n\n  il.sublocation,\n\n  il.serial,\n  il.lot_id,\n\n  il.quantity_on_hand,\n\n  p.track_serials,\n  p.track_lots,\n  p.track_expiry,\n  p.shelf_life_days\n\nFROM inventory_lines il\nINNER JOIN products p ON il.product_id = p.product_id\nLEFT JOIN locations l ON il.location_id = l.location_id\nLEFT JOIN categories c ON p.category_id = c.category_id;\n";
//# sourceMappingURL=inventory-detail.d.ts.map