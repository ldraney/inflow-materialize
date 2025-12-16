/**
 * Location Reorder Alerts View
 *
 * Products below reorder point at specific locations (not just global).
 * Critical for multi-warehouse operations where each location has its own
 * reorder thresholds.
 *
 * Use cases:
 * - "What needs reordering at Warehouse A?"
 * - "Location-specific purchasing decisions"
 * - "Transfer suggestions between locations"
 *
 * Joins: products + productSummary + reorderSettings (per location) + vendors
 */
export declare const locationReorderAlerts: import("drizzle-orm/sqlite-core").SQLiteViewWithSelection<"location_reorder_alerts", false, {
    productId: import("drizzle-orm").SQL.Aliased<string>;
    sku: import("drizzle-orm").SQL.Aliased<string>;
    productName: import("drizzle-orm").SQL.Aliased<string>;
    categoryId: import("drizzle-orm").SQL.Aliased<string>;
    locationId: import("drizzle-orm").SQL.Aliased<string>;
    locationName: import("drizzle-orm").SQL.Aliased<string>;
    locationAbbreviation: import("drizzle-orm").SQL.Aliased<string>;
    quantityOnHand: import("drizzle-orm").SQL.Aliased<string>;
    quantityAvailable: import("drizzle-orm").SQL.Aliased<string>;
    quantityOnPurchaseOrder: import("drizzle-orm").SQL.Aliased<string>;
    quantityInTransit: import("drizzle-orm").SQL.Aliased<string>;
    reorderPoint: import("drizzle-orm").SQL.Aliased<string>;
    reorderQuantity: import("drizzle-orm").SQL.Aliased<string>;
    shortfallQuantity: import("drizzle-orm").SQL.Aliased<number>;
    suggestedOrderQuantity: import("drizzle-orm").SQL.Aliased<number>;
    preferredVendorId: import("drizzle-orm").SQL.Aliased<string>;
    vendorName: import("drizzle-orm").SQL.Aliased<string>;
    vendorCode: import("drizzle-orm").SQL.Aliased<string>;
    vendorItemCode: import("drizzle-orm").SQL.Aliased<string>;
    vendorCost: import("drizzle-orm").SQL.Aliased<string>;
    leadTimeDays: import("drizzle-orm").SQL.Aliased<number>;
    fromLocationId: import("drizzle-orm").SQL.Aliased<string>;
}>;
/**
 * SQL to create this view manually
 */
export declare const locationReorderAlertsSQL = "\nCREATE VIEW IF NOT EXISTS location_reorder_alerts AS\nSELECT\n  p.product_id,\n  p.sku,\n  p.name AS product_name,\n  p.category_id,\n\n  rs.location_id,\n  l.name AS location_name,\n  l.abbreviation AS location_abbreviation,\n\n  ps.quantity_on_hand,\n  ps.quantity_available,\n  ps.quantity_on_purchase_order,\n  ps.quantity_in_transit,\n\n  rs.reorder_point,\n  rs.reorder_quantity,\n\n  CAST(rs.reorder_point AS REAL) - CAST(COALESCE(ps.quantity_available, '0') AS REAL) AS shortfall_quantity,\n\n  COALESCE(rs.reorder_quantity,\n    CAST(rs.reorder_point AS REAL) - CAST(COALESCE(ps.quantity_available, '0') AS REAL)\n  ) AS suggested_order_quantity,\n\n  rs.vendor_id AS preferred_vendor_id,\n  v.name AS vendor_name,\n  v.vendor_code,\n\n  vi.vendor_item_code,\n  vi.cost AS vendor_cost,\n  vi.lead_time_days,\n\n  rs.from_location_id\n\nFROM products p\nINNER JOIN reorder_settings rs ON p.product_id = rs.product_id\nINNER JOIN locations l ON rs.location_id = l.location_id\nLEFT JOIN product_summary ps ON p.product_id = ps.product_id AND rs.location_id = ps.location_id\nLEFT JOIN vendors v ON rs.vendor_id = v.vendor_id\nLEFT JOIN vendor_items vi ON rs.vendor_id = vi.vendor_id AND p.product_id = vi.product_id\nWHERE rs.enable_reordering = 1\n  AND rs.reorder_point IS NOT NULL\n  AND rs.location_id IS NOT NULL\n  AND p.is_active = 1\n  AND CAST(COALESCE(ps.quantity_available, '0') AS REAL) <= CAST(rs.reorder_point AS REAL);\n";
//# sourceMappingURL=location-reorder-alerts.d.ts.map