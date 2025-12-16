/**
 * Location Stock Summary View
 *
 * Aggregate inventory metrics per location. Answers questions like:
 * - "How many SKUs are at each warehouse?"
 * - "What's the total stock count per location?"
 * - "Which location has the most inventory?"
 *
 * Aggregates: productSummary grouped by location
 */
export declare const locationStockSummary: import("drizzle-orm/sqlite-core").SQLiteViewWithSelection<"location_stock_summary", false, {
    locationId: import("drizzle-orm").SQL.Aliased<string>;
    locationName: import("drizzle-orm").SQL.Aliased<string>;
    locationAbbreviation: import("drizzle-orm").SQL.Aliased<string>;
    isShippable: import("drizzle-orm").SQL.Aliased<number>;
    isReceivable: import("drizzle-orm").SQL.Aliased<number>;
    skuCount: import("drizzle-orm").SQL.Aliased<number>;
    totalQuantityOnHand: import("drizzle-orm").SQL.Aliased<number>;
    totalQuantityAvailable: import("drizzle-orm").SQL.Aliased<number>;
    totalQuantityReserved: import("drizzle-orm").SQL.Aliased<number>;
    totalQuantityInTransit: import("drizzle-orm").SQL.Aliased<number>;
}>;
/**
 * SQL to create this view manually
 */
export declare const locationStockSummarySQL = "\nCREATE VIEW IF NOT EXISTS location_stock_summary AS\nSELECT\n  l.location_id,\n  l.name AS location_name,\n  l.abbreviation AS location_abbreviation,\n  l.is_shippable,\n  l.is_receivable,\n  COUNT(DISTINCT ps.product_id) AS sku_count,\n  SUM(CAST(COALESCE(ps.quantity_on_hand, '0') AS REAL)) AS total_quantity_on_hand,\n  SUM(CAST(COALESCE(ps.quantity_available, '0') AS REAL)) AS total_quantity_available,\n  SUM(CAST(COALESCE(ps.quantity_reserved, '0') AS REAL)) AS total_quantity_reserved,\n  SUM(CAST(COALESCE(ps.quantity_in_transit, '0') AS REAL)) AS total_quantity_in_transit\nFROM locations l\nLEFT JOIN product_summary ps ON l.location_id = ps.location_id\nWHERE l.is_active = 1\nGROUP BY l.location_id, l.name, l.abbreviation, l.is_shippable, l.is_receivable;\n";
//# sourceMappingURL=location-stock-summary.d.ts.map