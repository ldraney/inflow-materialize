/**
 * BOM Costed View
 *
 * Bill of materials with component costs rolled up to show total manufacturing cost.
 * Includes both line-level detail and parent-level totals.
 *
 * Use cases:
 * - "What's the total cost to build this product?"
 * - "Which components are most expensive in this BOM?"
 * - "Manufacturing cost analysis"
 *
 * Joins: item_boms + products (parent & component) + vendor_items (for component costs)
 */
export declare const bomCosted: import("drizzle-orm/sqlite-core").SQLiteViewWithSelection<"bom_costed", false, {
    itemBomId: import("drizzle-orm").SQL.Aliased<string>;
    parentProductId: import("drizzle-orm").SQL.Aliased<string>;
    parentSku: import("drizzle-orm").SQL.Aliased<string>;
    parentProductName: import("drizzle-orm").SQL.Aliased<string>;
    componentProductId: import("drizzle-orm").SQL.Aliased<string>;
    componentSku: import("drizzle-orm").SQL.Aliased<string>;
    componentProductName: import("drizzle-orm").SQL.Aliased<string>;
    quantity: import("drizzle-orm").SQL.Aliased<string>;
    componentUnitCost: import("drizzle-orm").SQL.Aliased<string>;
    componentVendorId: import("drizzle-orm").SQL.Aliased<string>;
    componentVendorName: import("drizzle-orm").SQL.Aliased<string>;
    lineCost: import("drizzle-orm").SQL.Aliased<string>;
    totalBomCost: import("drizzle-orm").SQL.Aliased<string>;
    componentCount: import("drizzle-orm").SQL.Aliased<number>;
}>;
/**
 * SQL to create this view manually
 */
export declare const bomCostedSQL = "\nCREATE VIEW IF NOT EXISTS bom_costed AS\nSELECT\n  bom.item_bom_id,\n\n  bom.parent_product_id,\n  parent.sku AS parent_sku,\n  parent.name AS parent_product_name,\n\n  bom.component_product_id,\n  component.sku AS component_sku,\n  component.name AS component_product_name,\n\n  bom.quantity,\n\n  COALESCE(component_cost.cost, '0') AS component_unit_cost,\n  component_cost.vendor_id AS component_vendor_id,\n  v.name AS component_vendor_name,\n\n  CAST(CAST(bom.quantity AS REAL) * COALESCE(CAST(component_cost.cost AS REAL), 0) AS TEXT) AS line_cost,\n\n  bom_totals.total_bom_cost,\n  bom_totals.component_count\n\nFROM item_boms bom\nINNER JOIN products parent ON bom.parent_product_id = parent.product_id\nINNER JOIN products component ON bom.component_product_id = component.product_id\nLEFT JOIN (\n  SELECT\n    vi.product_id,\n    vi.vendor_id,\n    vi.cost,\n    ROW_NUMBER() OVER (\n      PARTITION BY vi.product_id\n      ORDER BY\n        CASE WHEN rs.vendor_id IS NOT NULL THEN 0 ELSE 1 END,\n        CAST(vi.cost AS REAL) ASC\n    ) AS rn\n  FROM vendor_items vi\n  LEFT JOIN reorder_settings rs ON vi.product_id = rs.product_id\n    AND vi.vendor_id = rs.vendor_id\n    AND rs.location_id IS NULL\n) component_cost ON bom.component_product_id = component_cost.product_id AND component_cost.rn = 1\nLEFT JOIN vendors v ON component_cost.vendor_id = v.vendor_id\nLEFT JOIN (\n  SELECT\n    b.parent_product_id,\n    COUNT(*) AS component_count,\n    SUM(CAST(b.quantity AS REAL) * COALESCE(CAST(vc.cost AS REAL), 0)) AS total_bom_cost\n  FROM item_boms b\n  LEFT JOIN (\n    SELECT\n      vi.product_id,\n      vi.cost,\n      ROW_NUMBER() OVER (\n        PARTITION BY vi.product_id\n        ORDER BY CAST(vi.cost AS REAL) ASC\n      ) AS rn\n    FROM vendor_items vi\n  ) vc ON b.component_product_id = vc.product_id AND vc.rn = 1\n  GROUP BY b.parent_product_id\n) bom_totals ON bom.parent_product_id = bom_totals.parent_product_id;\n";
//# sourceMappingURL=bom-costed.d.ts.map