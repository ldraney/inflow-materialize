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
export declare const inventoryByLocation: import("drizzle-orm/sqlite-core").SQLiteViewWithSelection<"inventory_by_location", false, {
    productId: import("drizzle-orm").SQL.Aliased<string>;
    locationId: import("drizzle-orm").SQL.Aliased<string>;
    sku: import("drizzle-orm").SQL.Aliased<string>;
    productName: import("drizzle-orm").SQL.Aliased<string>;
    itemType: import("drizzle-orm").SQL.Aliased<string>;
    isActive: import("drizzle-orm").SQL.Aliased<number>;
    categoryId: import("drizzle-orm").SQL.Aliased<string>;
    categoryName: import("drizzle-orm").SQL.Aliased<string>;
    locationName: import("drizzle-orm").SQL.Aliased<string>;
    locationAbbreviation: import("drizzle-orm").SQL.Aliased<string>;
    isShippable: import("drizzle-orm").SQL.Aliased<number>;
    isReceivable: import("drizzle-orm").SQL.Aliased<number>;
    quantityOnHand: import("drizzle-orm").SQL.Aliased<string>;
    quantityAvailable: import("drizzle-orm").SQL.Aliased<string>;
    quantityReserved: import("drizzle-orm").SQL.Aliased<string>;
    quantityReservedForSales: import("drizzle-orm").SQL.Aliased<string>;
    quantityReservedForManufacturing: import("drizzle-orm").SQL.Aliased<string>;
    quantityReservedForTransfers: import("drizzle-orm").SQL.Aliased<string>;
    quantityOnPurchaseOrder: import("drizzle-orm").SQL.Aliased<string>;
    quantityOnWorkOrder: import("drizzle-orm").SQL.Aliased<string>;
    quantityOnTransferOrder: import("drizzle-orm").SQL.Aliased<string>;
    quantityPicked: import("drizzle-orm").SQL.Aliased<string>;
    quantityInTransit: import("drizzle-orm").SQL.Aliased<string>;
    imageUrl: import("drizzle-orm").SQL.Aliased<string>;
}>;
/**
 * SQL to create this view manually
 */
export declare const inventoryByLocationSQL = "\nCREATE VIEW IF NOT EXISTS inventory_by_location AS\nSELECT\n  ps.product_id,\n  ps.location_id,\n\n  p.sku,\n  p.name AS product_name,\n  p.item_type,\n  p.is_active,\n  p.category_id,\n  c.name AS category_name,\n\n  l.name AS location_name,\n  l.abbreviation AS location_abbreviation,\n  l.is_shippable,\n  l.is_receivable,\n\n  ps.quantity_on_hand,\n  ps.quantity_available,\n  ps.quantity_reserved,\n  ps.quantity_reserved_for_sales,\n  ps.quantity_reserved_for_manufacturing,\n  ps.quantity_reserved_for_transfers,\n  ps.quantity_on_purchase_order,\n  ps.quantity_on_work_order,\n  ps.quantity_on_transfer_order,\n  ps.quantity_picked,\n  ps.quantity_in_transit,\n\n  ps.image_small_url AS image_url\n\nFROM product_summary ps\nINNER JOIN products p ON ps.product_id = p.product_id\nINNER JOIN locations l ON ps.location_id = l.location_id\nLEFT JOIN categories c ON p.category_id = c.category_id\nWHERE ps.location_id IS NOT NULL;\n";
//# sourceMappingURL=inventory-by-location.d.ts.map