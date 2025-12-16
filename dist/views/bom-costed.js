import { sqliteView } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
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
export const bomCosted = sqliteView('bom_costed').as((qb) => {
    return qb
        .select({
        // BOM line info
        itemBomId: sql `bom.item_bom_id`.as('item_bom_id'),
        // Parent product (the assembled product)
        parentProductId: sql `bom.parent_product_id`.as('parent_product_id'),
        parentSku: sql `parent.sku`.as('parent_sku'),
        parentProductName: sql `parent.name`.as('parent_product_name'),
        // Component product
        componentProductId: sql `bom.component_product_id`.as('component_product_id'),
        componentSku: sql `component.sku`.as('component_sku'),
        componentProductName: sql `component.name`.as('component_product_name'),
        // BOM quantity
        quantity: sql `bom.quantity`.as('quantity'),
        // Component cost (from preferred vendor or lowest cost)
        componentUnitCost: sql `COALESCE(component_cost.cost, '0')`.as('component_unit_cost'),
        componentVendorId: sql `component_cost.vendor_id`.as('component_vendor_id'),
        componentVendorName: sql `v.name`.as('component_vendor_name'),
        // Extended cost for this line (quantity * unit cost)
        lineCost: sql `
        CAST(CAST(bom.quantity AS REAL) * COALESCE(CAST(component_cost.cost AS REAL), 0) AS TEXT)
      `.as('line_cost'),
        // Total BOM cost for the parent product (sum of all component line costs)
        totalBomCost: sql `bom_totals.total_bom_cost`.as('total_bom_cost'),
        componentCount: sql `bom_totals.component_count`.as('component_count'),
    })
        .from(sql `item_boms bom`)
        .innerJoin(sql `products parent`, sql `bom.parent_product_id = parent.product_id`)
        .innerJoin(sql `products component`, sql `bom.component_product_id = component.product_id`)
        .leftJoin(sql `(
        SELECT
          vi.product_id,
          vi.vendor_id,
          vi.cost,
          ROW_NUMBER() OVER (
            PARTITION BY vi.product_id
            ORDER BY
              CASE WHEN rs.vendor_id IS NOT NULL THEN 0 ELSE 1 END,
              CAST(vi.cost AS REAL) ASC
          ) AS rn
        FROM vendor_items vi
        LEFT JOIN reorder_settings rs ON vi.product_id = rs.product_id
          AND vi.vendor_id = rs.vendor_id
          AND rs.location_id IS NULL
      ) component_cost`, sql `bom.component_product_id = component_cost.product_id AND component_cost.rn = 1`)
        .leftJoin(sql `vendors v`, sql `component_cost.vendor_id = v.vendor_id`)
        .leftJoin(sql `(
        SELECT
          b.parent_product_id,
          COUNT(*) AS component_count,
          SUM(CAST(b.quantity AS REAL) * COALESCE(CAST(vc.cost AS REAL), 0)) AS total_bom_cost
        FROM item_boms b
        LEFT JOIN (
          SELECT
            vi.product_id,
            vi.cost,
            ROW_NUMBER() OVER (
              PARTITION BY vi.product_id
              ORDER BY CAST(vi.cost AS REAL) ASC
            ) AS rn
          FROM vendor_items vi
        ) vc ON b.component_product_id = vc.product_id AND vc.rn = 1
        GROUP BY b.parent_product_id
      ) bom_totals`, sql `bom.parent_product_id = bom_totals.parent_product_id`);
});
/**
 * SQL to create this view manually
 */
export const bomCostedSQL = `
CREATE VIEW IF NOT EXISTS bom_costed AS
SELECT
  bom.item_bom_id,

  bom.parent_product_id,
  parent.sku AS parent_sku,
  parent.name AS parent_product_name,

  bom.component_product_id,
  component.sku AS component_sku,
  component.name AS component_product_name,

  bom.quantity,

  COALESCE(component_cost.cost, '0') AS component_unit_cost,
  component_cost.vendor_id AS component_vendor_id,
  v.name AS component_vendor_name,

  CAST(CAST(bom.quantity AS REAL) * COALESCE(CAST(component_cost.cost AS REAL), 0) AS TEXT) AS line_cost,

  bom_totals.total_bom_cost,
  bom_totals.component_count

FROM item_boms bom
INNER JOIN products parent ON bom.parent_product_id = parent.product_id
INNER JOIN products component ON bom.component_product_id = component.product_id
LEFT JOIN (
  SELECT
    vi.product_id,
    vi.vendor_id,
    vi.cost,
    ROW_NUMBER() OVER (
      PARTITION BY vi.product_id
      ORDER BY
        CASE WHEN rs.vendor_id IS NOT NULL THEN 0 ELSE 1 END,
        CAST(vi.cost AS REAL) ASC
    ) AS rn
  FROM vendor_items vi
  LEFT JOIN reorder_settings rs ON vi.product_id = rs.product_id
    AND vi.vendor_id = rs.vendor_id
    AND rs.location_id IS NULL
) component_cost ON bom.component_product_id = component_cost.product_id AND component_cost.rn = 1
LEFT JOIN vendors v ON component_cost.vendor_id = v.vendor_id
LEFT JOIN (
  SELECT
    b.parent_product_id,
    COUNT(*) AS component_count,
    SUM(CAST(b.quantity AS REAL) * COALESCE(CAST(vc.cost AS REAL), 0)) AS total_bom_cost
  FROM item_boms b
  LEFT JOIN (
    SELECT
      vi.product_id,
      vi.cost,
      ROW_NUMBER() OVER (
        PARTITION BY vi.product_id
        ORDER BY CAST(vi.cost AS REAL) ASC
      ) AS rn
    FROM vendor_items vi
  ) vc ON b.component_product_id = vc.product_id AND vc.rn = 1
  GROUP BY b.parent_product_id
) bom_totals ON bom.parent_product_id = bom_totals.parent_product_id;
`;
//# sourceMappingURL=bom-costed.js.map