/**
 * Product Inventory Status View
 *
 * The "product card" essentials - everything you need to display a product's
 * current inventory position in one row.
 *
 * Joins: products + categories + productSummary (global) + reorderSettings
 */
export declare const productInventoryStatus: import("drizzle-orm/sqlite-core").SQLiteViewWithSelection<"product_inventory_status", false, {
    productId: import("drizzle-orm").SQL.Aliased<string>;
    sku: import("drizzle-orm").SQL.Aliased<string>;
    name: import("drizzle-orm").SQL.Aliased<string>;
    description: import("drizzle-orm").SQL.Aliased<string>;
    itemType: import("drizzle-orm").SQL.Aliased<string>;
    isActive: import("drizzle-orm").SQL.Aliased<number>;
    categoryId: import("drizzle-orm").SQL.Aliased<string>;
    categoryName: import("drizzle-orm").SQL.Aliased<string>;
    quantityOnHand: import("drizzle-orm").SQL.Aliased<string>;
    quantityAvailable: import("drizzle-orm").SQL.Aliased<string>;
    quantityReserved: import("drizzle-orm").SQL.Aliased<string>;
    quantityOnPurchaseOrder: import("drizzle-orm").SQL.Aliased<string>;
    quantityOnWorkOrder: import("drizzle-orm").SQL.Aliased<string>;
    quantityInTransit: import("drizzle-orm").SQL.Aliased<string>;
    quantityBuildable: import("drizzle-orm").SQL.Aliased<string>;
    reorderPoint: import("drizzle-orm").SQL.Aliased<string>;
    reorderQuantity: import("drizzle-orm").SQL.Aliased<string>;
    enableReordering: import("drizzle-orm").SQL.Aliased<number>;
    preferredVendorId: import("drizzle-orm").SQL.Aliased<string>;
    isBelowReorder: import("drizzle-orm").SQL.Aliased<number>;
    imageUrl: import("drizzle-orm").SQL.Aliased<string>;
}>;
/**
 * SQL to create this view manually (for reference or direct execution)
 */
export declare const productInventoryStatusSQL = "\nCREATE VIEW IF NOT EXISTS product_inventory_status AS\nSELECT\n  p.product_id,\n  p.sku,\n  p.name,\n  p.description,\n  p.item_type,\n  p.is_active,\n\n  p.category_id,\n  c.name AS category_name,\n\n  ps.quantity_on_hand,\n  ps.quantity_available,\n  ps.quantity_reserved,\n  ps.quantity_on_purchase_order,\n  ps.quantity_on_work_order,\n  ps.quantity_in_transit,\n  ps.quantity_buildable,\n\n  rs.reorder_point,\n  rs.reorder_quantity,\n  rs.enable_reordering,\n  rs.vendor_id AS preferred_vendor_id,\n\n  CASE\n    WHEN rs.enable_reordering = 1\n      AND rs.reorder_point IS NOT NULL\n      AND CAST(COALESCE(ps.quantity_available, '0') AS REAL) <= CAST(rs.reorder_point AS REAL)\n    THEN 1\n    ELSE 0\n  END AS is_below_reorder,\n\n  ps.image_small_url AS image_url\n\nFROM products p\nLEFT JOIN categories c ON p.category_id = c.category_id\nLEFT JOIN product_summary ps ON p.product_id = ps.product_id AND ps.location_id IS NULL\nLEFT JOIN reorder_settings rs ON p.product_id = rs.product_id AND rs.location_id IS NULL;\n";
//# sourceMappingURL=product-inventory-status.d.ts.map