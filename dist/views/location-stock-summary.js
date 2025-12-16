import { sqliteView } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
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
export const locationStockSummary = sqliteView('location_stock_summary').as((qb) => {
    return qb
        .select({
        locationId: sql `l.location_id`.as('location_id'),
        locationName: sql `l.name`.as('location_name'),
        locationAbbreviation: sql `l.abbreviation`.as('location_abbreviation'),
        isShippable: sql `l.is_shippable`.as('is_shippable'),
        isReceivable: sql `l.is_receivable`.as('is_receivable'),
        skuCount: sql `COUNT(DISTINCT ps.product_id)`.as('sku_count'),
        totalQuantityOnHand: sql `SUM(CAST(COALESCE(ps.quantity_on_hand, '0') AS REAL))`.as('total_quantity_on_hand'),
        totalQuantityAvailable: sql `SUM(CAST(COALESCE(ps.quantity_available, '0') AS REAL))`.as('total_quantity_available'),
        totalQuantityReserved: sql `SUM(CAST(COALESCE(ps.quantity_reserved, '0') AS REAL))`.as('total_quantity_reserved'),
        totalQuantityInTransit: sql `SUM(CAST(COALESCE(ps.quantity_in_transit, '0') AS REAL))`.as('total_quantity_in_transit'),
    })
        .from(sql `locations l`)
        .leftJoin(sql `product_summary ps`, sql `l.location_id = ps.location_id`)
        .where(sql `l.is_active = 1`)
        .groupBy(sql `l.location_id, l.name, l.abbreviation, l.is_shippable, l.is_receivable`);
});
/**
 * SQL to create this view manually
 */
export const locationStockSummarySQL = `
CREATE VIEW IF NOT EXISTS location_stock_summary AS
SELECT
  l.location_id,
  l.name AS location_name,
  l.abbreviation AS location_abbreviation,
  l.is_shippable,
  l.is_receivable,
  COUNT(DISTINCT ps.product_id) AS sku_count,
  SUM(CAST(COALESCE(ps.quantity_on_hand, '0') AS REAL)) AS total_quantity_on_hand,
  SUM(CAST(COALESCE(ps.quantity_available, '0') AS REAL)) AS total_quantity_available,
  SUM(CAST(COALESCE(ps.quantity_reserved, '0') AS REAL)) AS total_quantity_reserved,
  SUM(CAST(COALESCE(ps.quantity_in_transit, '0') AS REAL)) AS total_quantity_in_transit
FROM locations l
LEFT JOIN product_summary ps ON l.location_id = ps.location_id
WHERE l.is_active = 1
GROUP BY l.location_id, l.name, l.abbreviation, l.is_shippable, l.is_receivable;
`;
//# sourceMappingURL=location-stock-summary.js.map