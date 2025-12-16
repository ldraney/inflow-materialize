import { sqliteView } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
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
export const productMargin = sqliteView('product_margin').as((qb) => {
    return qb
        .select({
        // Product info
        productId: sql `p.product_id`.as('product_id'),
        sku: sql `p.sku`.as('sku'),
        productName: sql `p.name`.as('product_name'),
        categoryId: sql `p.category_id`.as('category_id'),
        categoryName: sql `c.name`.as('category_name'),
        itemType: sql `p.item_type`.as('item_type'),
        isActive: sql `p.is_active`.as('is_active'),
        // Default sell price (from product_prices with default pricing scheme)
        defaultSellPrice: sql `pp.price`.as('default_sell_price'),
        pricingSchemeId: sql `pp.pricing_scheme_id`.as('pricing_scheme_id'),
        pricingSchemeName: sql `ps.name`.as('pricing_scheme_name'),
        // Vendor cost (from preferred vendor or lowest cost vendor)
        vendorCost: sql `vendor_cost.cost`.as('vendor_cost'),
        preferredVendorId: sql `vendor_cost.vendor_id`.as('preferred_vendor_id'),
        preferredVendorName: sql `v.name`.as('preferred_vendor_name'),
        // Margin calculations
        marginAmount: sql `
        CAST(COALESCE(CAST(pp.price AS REAL), 0) - COALESCE(CAST(vendor_cost.cost AS REAL), 0) AS TEXT)
      `.as('margin_amount'),
        marginPercent: sql `
        CASE
          WHEN COALESCE(CAST(pp.price AS REAL), 0) > 0
          THEN CAST(
            ((COALESCE(CAST(pp.price AS REAL), 0) - COALESCE(CAST(vendor_cost.cost AS REAL), 0)) / CAST(pp.price AS REAL)) * 100
            AS TEXT
          )
          ELSE NULL
        END
      `.as('margin_percent'),
        // Markup (cost-based margin)
        markupPercent: sql `
        CASE
          WHEN COALESCE(CAST(vendor_cost.cost AS REAL), 0) > 0
          THEN CAST(
            ((COALESCE(CAST(pp.price AS REAL), 0) - COALESCE(CAST(vendor_cost.cost AS REAL), 0)) / CAST(vendor_cost.cost AS REAL)) * 100
            AS TEXT
          )
          ELSE NULL
        END
      `.as('markup_percent'),
    })
        .from(sql `products p`)
        .leftJoin(sql `categories c`, sql `p.category_id = c.category_id`)
        .leftJoin(sql `product_prices pp`, sql `p.product_id = pp.product_id`)
        .leftJoin(sql `pricing_schemes ps`, sql `pp.pricing_scheme_id = ps.pricing_scheme_id`)
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
      ) vendor_cost`, sql `p.product_id = vendor_cost.product_id AND vendor_cost.rn = 1`)
        .leftJoin(sql `vendors v`, sql `vendor_cost.vendor_id = v.vendor_id`)
        .where(sql `pp.pricing_scheme_id IS NULL OR ps.is_default = 1`);
});
/**
 * SQL to create this view manually
 */
export const productMarginSQL = `
CREATE VIEW IF NOT EXISTS product_margin AS
SELECT
  p.product_id,
  p.sku,
  p.name AS product_name,
  p.category_id,
  c.name AS category_name,
  p.item_type,
  p.is_active,

  pp.price AS default_sell_price,
  pp.pricing_scheme_id,
  ps.name AS pricing_scheme_name,

  vendor_cost.cost AS vendor_cost,
  vendor_cost.vendor_id AS preferred_vendor_id,
  v.name AS preferred_vendor_name,

  CAST(COALESCE(CAST(pp.price AS REAL), 0) - COALESCE(CAST(vendor_cost.cost AS REAL), 0) AS TEXT) AS margin_amount,

  CASE
    WHEN COALESCE(CAST(pp.price AS REAL), 0) > 0
    THEN CAST(
      ((COALESCE(CAST(pp.price AS REAL), 0) - COALESCE(CAST(vendor_cost.cost AS REAL), 0)) / CAST(pp.price AS REAL)) * 100
      AS TEXT
    )
    ELSE NULL
  END AS margin_percent,

  CASE
    WHEN COALESCE(CAST(vendor_cost.cost AS REAL), 0) > 0
    THEN CAST(
      ((COALESCE(CAST(pp.price AS REAL), 0) - COALESCE(CAST(vendor_cost.cost AS REAL), 0)) / CAST(vendor_cost.cost AS REAL)) * 100
      AS TEXT
    )
    ELSE NULL
  END AS markup_percent

FROM products p
LEFT JOIN categories c ON p.category_id = c.category_id
LEFT JOIN product_prices pp ON p.product_id = pp.product_id
LEFT JOIN pricing_schemes ps ON pp.pricing_scheme_id = ps.pricing_scheme_id
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
) vendor_cost ON p.product_id = vendor_cost.product_id AND vendor_cost.rn = 1
LEFT JOIN vendors v ON vendor_cost.vendor_id = v.vendor_id
WHERE pp.pricing_scheme_id IS NULL OR ps.is_default = 1;
`;
//# sourceMappingURL=product-margin.js.map