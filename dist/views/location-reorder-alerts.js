import { sqliteView } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
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
export const locationReorderAlerts = sqliteView('location_reorder_alerts').as((qb) => {
    return qb
        .select({
        // Product info
        productId: sql `p.product_id`.as('product_id'),
        sku: sql `p.sku`.as('sku'),
        productName: sql `p.name`.as('product_name'),
        categoryId: sql `p.category_id`.as('category_id'),
        // Location info
        locationId: sql `rs.location_id`.as('location_id'),
        locationName: sql `l.name`.as('location_name'),
        locationAbbreviation: sql `l.abbreviation`.as('location_abbreviation'),
        // Current inventory at this location
        quantityOnHand: sql `ps.quantity_on_hand`.as('quantity_on_hand'),
        quantityAvailable: sql `ps.quantity_available`.as('quantity_available'),
        quantityOnPurchaseOrder: sql `ps.quantity_on_purchase_order`.as('quantity_on_purchase_order'),
        quantityInTransit: sql `ps.quantity_in_transit`.as('quantity_in_transit'),
        // Reorder settings for this location
        reorderPoint: sql `rs.reorder_point`.as('reorder_point'),
        reorderQuantity: sql `rs.reorder_quantity`.as('reorder_quantity'),
        // Shortfall calculation
        shortfallQuantity: sql `
        CAST(rs.reorder_point AS REAL) -
        CAST(COALESCE(ps.quantity_available, '0') AS REAL)
      `.as('shortfall_quantity'),
        // Suggested order quantity
        suggestedOrderQuantity: sql `
        COALESCE(rs.reorder_quantity,
          CAST(rs.reorder_point AS REAL) -
          CAST(COALESCE(ps.quantity_available, '0') AS REAL)
        )
      `.as('suggested_order_quantity'),
        // Preferred vendor
        preferredVendorId: sql `rs.vendor_id`.as('preferred_vendor_id'),
        vendorName: sql `v.name`.as('vendor_name'),
        vendorCode: sql `v.vendor_code`.as('vendor_code'),
        // Vendor item details
        vendorItemCode: sql `vi.vendor_item_code`.as('vendor_item_code'),
        vendorCost: sql `vi.cost`.as('vendor_cost'),
        leadTimeDays: sql `vi.lead_time_days`.as('lead_time_days'),
        // Transfer source (if configured)
        fromLocationId: sql `rs.from_location_id`.as('from_location_id'),
    })
        .from(sql `products p`)
        .innerJoin(sql `reorder_settings rs`, sql `p.product_id = rs.product_id`)
        .innerJoin(sql `locations l`, sql `rs.location_id = l.location_id`)
        .leftJoin(sql `product_summary ps`, sql `p.product_id = ps.product_id AND rs.location_id = ps.location_id`)
        .leftJoin(sql `vendors v`, sql `rs.vendor_id = v.vendor_id`)
        .leftJoin(sql `vendor_items vi`, sql `rs.vendor_id = vi.vendor_id AND p.product_id = vi.product_id`)
        .where(sql `
      rs.enable_reordering = 1
      AND rs.reorder_point IS NOT NULL
      AND rs.location_id IS NOT NULL
      AND p.is_active = 1
      AND CAST(COALESCE(ps.quantity_available, '0') AS REAL) <= CAST(rs.reorder_point AS REAL)
    `);
});
/**
 * SQL to create this view manually
 */
export const locationReorderAlertsSQL = `
CREATE VIEW IF NOT EXISTS location_reorder_alerts AS
SELECT
  p.product_id,
  p.sku,
  p.name AS product_name,
  p.category_id,

  rs.location_id,
  l.name AS location_name,
  l.abbreviation AS location_abbreviation,

  ps.quantity_on_hand,
  ps.quantity_available,
  ps.quantity_on_purchase_order,
  ps.quantity_in_transit,

  rs.reorder_point,
  rs.reorder_quantity,

  CAST(rs.reorder_point AS REAL) - CAST(COALESCE(ps.quantity_available, '0') AS REAL) AS shortfall_quantity,

  COALESCE(rs.reorder_quantity,
    CAST(rs.reorder_point AS REAL) - CAST(COALESCE(ps.quantity_available, '0') AS REAL)
  ) AS suggested_order_quantity,

  rs.vendor_id AS preferred_vendor_id,
  v.name AS vendor_name,
  v.vendor_code,

  vi.vendor_item_code,
  vi.cost AS vendor_cost,
  vi.lead_time_days,

  rs.from_location_id

FROM products p
INNER JOIN reorder_settings rs ON p.product_id = rs.product_id
INNER JOIN locations l ON rs.location_id = l.location_id
LEFT JOIN product_summary ps ON p.product_id = ps.product_id AND rs.location_id = ps.location_id
LEFT JOIN vendors v ON rs.vendor_id = v.vendor_id
LEFT JOIN vendor_items vi ON rs.vendor_id = vi.vendor_id AND p.product_id = vi.product_id
WHERE rs.enable_reordering = 1
  AND rs.reorder_point IS NOT NULL
  AND rs.location_id IS NOT NULL
  AND p.is_active = 1
  AND CAST(COALESCE(ps.quantity_available, '0') AS REAL) <= CAST(rs.reorder_point AS REAL);
`;
//# sourceMappingURL=location-reorder-alerts.js.map