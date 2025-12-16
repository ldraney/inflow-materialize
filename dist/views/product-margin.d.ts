/**
 * Product Margin View
 *
 * Product profitability analysis comparing selling prices to vendor costs.
 * Shows margin as both absolute value and percentage.
 *
 * Use cases:
 * - "What's our margin on this product?"
 * - "Which products have the highest/lowest margins?"
 * - "Pricing optimization analysis"
 *
 * Joins: products + product_prices (default) + vendor_items (preferred vendor cost)
 */
export declare const productMargin: import("drizzle-orm/sqlite-core").SQLiteViewWithSelection<"product_margin", false, {
    productId: import("drizzle-orm").SQL.Aliased<string>;
    sku: import("drizzle-orm").SQL.Aliased<string>;
    productName: import("drizzle-orm").SQL.Aliased<string>;
    categoryId: import("drizzle-orm").SQL.Aliased<string>;
    categoryName: import("drizzle-orm").SQL.Aliased<string>;
    itemType: import("drizzle-orm").SQL.Aliased<string>;
    isActive: import("drizzle-orm").SQL.Aliased<number>;
    defaultSellPrice: import("drizzle-orm").SQL.Aliased<string>;
    pricingSchemeId: import("drizzle-orm").SQL.Aliased<string>;
    pricingSchemeName: import("drizzle-orm").SQL.Aliased<string>;
    vendorCost: import("drizzle-orm").SQL.Aliased<string>;
    preferredVendorId: import("drizzle-orm").SQL.Aliased<string>;
    preferredVendorName: import("drizzle-orm").SQL.Aliased<string>;
    marginAmount: import("drizzle-orm").SQL.Aliased<string>;
    marginPercent: import("drizzle-orm").SQL.Aliased<string>;
    markupPercent: import("drizzle-orm").SQL.Aliased<string>;
}>;
/**
 * SQL to create this view manually
 */
export declare const productMarginSQL = "\nCREATE VIEW IF NOT EXISTS product_margin AS\nSELECT\n  p.product_id,\n  p.sku,\n  p.name AS product_name,\n  p.category_id,\n  c.name AS category_name,\n  p.item_type,\n  p.is_active,\n\n  pp.price AS default_sell_price,\n  pp.pricing_scheme_id,\n  ps.name AS pricing_scheme_name,\n\n  vendor_cost.cost AS vendor_cost,\n  vendor_cost.vendor_id AS preferred_vendor_id,\n  v.name AS preferred_vendor_name,\n\n  CAST(COALESCE(CAST(pp.price AS REAL), 0) - COALESCE(CAST(vendor_cost.cost AS REAL), 0) AS TEXT) AS margin_amount,\n\n  CASE\n    WHEN COALESCE(CAST(pp.price AS REAL), 0) > 0\n    THEN CAST(\n      ((COALESCE(CAST(pp.price AS REAL), 0) - COALESCE(CAST(vendor_cost.cost AS REAL), 0)) / CAST(pp.price AS REAL)) * 100\n      AS TEXT\n    )\n    ELSE NULL\n  END AS margin_percent,\n\n  CASE\n    WHEN COALESCE(CAST(vendor_cost.cost AS REAL), 0) > 0\n    THEN CAST(\n      ((COALESCE(CAST(pp.price AS REAL), 0) - COALESCE(CAST(vendor_cost.cost AS REAL), 0)) / CAST(vendor_cost.cost AS REAL)) * 100\n      AS TEXT\n    )\n    ELSE NULL\n  END AS markup_percent\n\nFROM products p\nLEFT JOIN categories c ON p.category_id = c.category_id\nLEFT JOIN product_prices pp ON p.product_id = pp.product_id\nLEFT JOIN pricing_schemes ps ON pp.pricing_scheme_id = ps.pricing_scheme_id\nLEFT JOIN (\n  SELECT\n    vi.product_id,\n    vi.vendor_id,\n    vi.cost,\n    ROW_NUMBER() OVER (\n      PARTITION BY vi.product_id\n      ORDER BY\n        CASE WHEN rs.vendor_id IS NOT NULL THEN 0 ELSE 1 END,\n        CAST(vi.cost AS REAL) ASC\n    ) AS rn\n  FROM vendor_items vi\n  LEFT JOIN reorder_settings rs ON vi.product_id = rs.product_id\n    AND vi.vendor_id = rs.vendor_id\n    AND rs.location_id IS NULL\n) vendor_cost ON p.product_id = vendor_cost.product_id AND vendor_cost.rn = 1\nLEFT JOIN vendors v ON vendor_cost.vendor_id = v.vendor_id\nWHERE pp.pricing_scheme_id IS NULL OR ps.is_default = 1;\n";
//# sourceMappingURL=product-margin.d.ts.map