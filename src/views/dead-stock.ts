import { sqliteView } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

/**
 * Dead Stock View
 *
 * Identifies inventory that hasn't moved in 30+ days, tiered by age.
 * Helps identify working capital tied up in slow-moving inventory.
 *
 * Use cases:
 * - "What inventory hasn't moved in 90 days?"
 * - Working capital analysis
 * - Markdown/liquidation candidates
 * - Warehouse space optimization
 *
 * Tiers: 30+, 60+, 90+ days since last movement
 * Only includes products where days_since_movement >= 30
 *
 * Note: Uses stock_movement_ledger data sources to find last movement.
 * Per-location granularity shows exactly where dead stock is sitting.
 */
export const deadStock = sqliteView('dead_stock').as((qb) => {
  return qb.select({
    productId: sql<string>`product_id`.as('product_id'),
    sku: sql<string>`sku`.as('sku'),
    productName: sql<string>`product_name`.as('product_name'),
    categoryId: sql<string>`category_id`.as('category_id'),
    categoryName: sql<string>`category_name`.as('category_name'),
    locationId: sql<string>`location_id`.as('location_id'),
    locationName: sql<string>`location_name`.as('location_name'),
    quantityOnHand: sql<string>`quantity_on_hand`.as('quantity_on_hand'),
    unitCost: sql<string>`unit_cost`.as('unit_cost'),
    totalValue: sql<string>`total_value`.as('total_value'),
    lastMovementDate: sql<string>`last_movement_date`.as('last_movement_date'),
    daysSinceMovement: sql<number>`days_since_movement`.as('days_since_movement'),
    deadStockTier: sql<string>`dead_stock_tier`.as('dead_stock_tier'),
  }).from(sql`(
    SELECT
      inv.product_id,
      inv.sku,
      inv.product_name,
      inv.category_id,
      inv.category_name,
      inv.location_id,
      inv.location_name,
      inv.quantity_on_hand,
      inv.unit_cost,
      CAST(
        CAST(COALESCE(inv.quantity_on_hand, '0') AS REAL) *
        CAST(COALESCE(inv.unit_cost, '0') AS REAL)
        AS TEXT
      ) AS total_value,
      movements.last_movement_date,
      CAST(julianday('now') - julianday(COALESCE(movements.last_movement_date, '1900-01-01')) AS INTEGER) AS days_since_movement,
      CASE
        WHEN julianday('now') - julianday(COALESCE(movements.last_movement_date, '1900-01-01')) >= 90 THEN '90+'
        WHEN julianday('now') - julianday(COALESCE(movements.last_movement_date, '1900-01-01')) >= 60 THEN '60+'
        WHEN julianday('now') - julianday(COALESCE(movements.last_movement_date, '1900-01-01')) >= 30 THEN '30+'
        ELSE NULL
      END AS dead_stock_tier
    FROM (
      -- Current inventory by product/location
      SELECT
        ps.product_id,
        p.sku,
        p.name AS product_name,
        p.category_id,
        c.name AS category_name,
        ps.location_id,
        l.name AS location_name,
        ps.quantity_on_hand,
        p.cost AS unit_cost
      FROM product_summary ps
      INNER JOIN products p ON ps.product_id = p.product_id
      LEFT JOIN categories c ON p.category_id = c.category_id
      LEFT JOIN locations l ON ps.location_id = l.location_id
      WHERE ps.location_id IS NOT NULL
        AND CAST(COALESCE(ps.quantity_on_hand, '0') AS REAL) > 0
    ) inv
    LEFT JOIN (
      -- Last movement date per product/location from all movement sources
      SELECT
        product_id,
        location_id,
        MAX(movement_date) AS last_movement_date
      FROM (
        -- PO Receipts
        SELECT
          pol.product_id,
          po.location_id,
          po.order_date AS movement_date
        FROM purchase_order_lines pol
        INNER JOIN purchase_orders po ON pol.purchase_order_id = po.purchase_order_id
        WHERE po.status IN ('Completed', 'Closed')
          AND CAST(COALESCE(pol.quantity_received, '0') AS REAL) > 0

        UNION ALL

        -- SO Shipments
        SELECT
          sol.product_id,
          so.location_id,
          so.order_date AS movement_date
        FROM sales_order_lines sol
        INNER JOIN sales_orders so ON sol.sales_order_id = so.sales_order_id
        WHERE so.status IN ('Completed', 'Shipped', 'Closed')
          AND CAST(COALESCE(sol.quantity_shipped, '0') AS REAL) > 0

        UNION ALL

        -- Transfers OUT
        SELECT
          stl.product_id,
          st.from_location_id AS location_id,
          st.transfer_date AS movement_date
        FROM stock_transfer_lines stl
        INNER JOIN stock_transfers st ON stl.stock_transfer_id = st.stock_transfer_id
        WHERE st.status IN ('Completed', 'Closed')

        UNION ALL

        -- Transfers IN
        SELECT
          stl.product_id,
          st.to_location_id AS location_id,
          st.transfer_date AS movement_date
        FROM stock_transfer_lines stl
        INNER JOIN stock_transfers st ON stl.stock_transfer_id = st.stock_transfer_id
        WHERE st.status IN ('Completed', 'Closed')

        UNION ALL

        -- Adjustments
        SELECT
          sal.product_id,
          sa.location_id,
          sa.adjustment_date AS movement_date
        FROM stock_adjustment_lines sal
        INNER JOIN stock_adjustments sa ON sal.stock_adjustment_id = sa.stock_adjustment_id
      ) all_movements
      GROUP BY product_id, location_id
    ) movements ON inv.product_id = movements.product_id
               AND inv.location_id = movements.location_id
    WHERE julianday('now') - julianday(COALESCE(movements.last_movement_date, '1900-01-01')) >= 30
  )`);
});

/**
 * SQL to create this view manually
 */
export const deadStockSQL = `
CREATE VIEW IF NOT EXISTS dead_stock AS
SELECT
  inv.product_id,
  inv.sku,
  inv.product_name,
  inv.category_id,
  inv.category_name,
  inv.location_id,
  inv.location_name,
  inv.quantity_on_hand,
  inv.unit_cost,
  CAST(
    CAST(COALESCE(inv.quantity_on_hand, '0') AS REAL) *
    CAST(COALESCE(inv.unit_cost, '0') AS REAL)
    AS TEXT
  ) AS total_value,
  movements.last_movement_date,
  CAST(julianday('now') - julianday(COALESCE(movements.last_movement_date, '1900-01-01')) AS INTEGER) AS days_since_movement,
  CASE
    WHEN julianday('now') - julianday(COALESCE(movements.last_movement_date, '1900-01-01')) >= 90 THEN '90+'
    WHEN julianday('now') - julianday(COALESCE(movements.last_movement_date, '1900-01-01')) >= 60 THEN '60+'
    WHEN julianday('now') - julianday(COALESCE(movements.last_movement_date, '1900-01-01')) >= 30 THEN '30+'
    ELSE NULL
  END AS dead_stock_tier
FROM (
  -- Current inventory by product/location
  SELECT
    ps.product_id,
    p.sku,
    p.name AS product_name,
    p.category_id,
    c.name AS category_name,
    ps.location_id,
    l.name AS location_name,
    ps.quantity_on_hand,
    p.cost AS unit_cost
  FROM product_summary ps
  INNER JOIN products p ON ps.product_id = p.product_id
  LEFT JOIN categories c ON p.category_id = c.category_id
  LEFT JOIN locations l ON ps.location_id = l.location_id
  WHERE ps.location_id IS NOT NULL
    AND CAST(COALESCE(ps.quantity_on_hand, '0') AS REAL) > 0
) inv
LEFT JOIN (
  -- Last movement date per product/location from all movement sources
  SELECT
    product_id,
    location_id,
    MAX(movement_date) AS last_movement_date
  FROM (
    -- PO Receipts
    SELECT
      pol.product_id,
      po.location_id,
      po.order_date AS movement_date
    FROM purchase_order_lines pol
    INNER JOIN purchase_orders po ON pol.purchase_order_id = po.purchase_order_id
    WHERE po.status IN ('Completed', 'Closed')
      AND CAST(COALESCE(pol.quantity_received, '0') AS REAL) > 0

    UNION ALL

    -- SO Shipments
    SELECT
      sol.product_id,
      so.location_id,
      so.order_date AS movement_date
    FROM sales_order_lines sol
    INNER JOIN sales_orders so ON sol.sales_order_id = so.sales_order_id
    WHERE so.status IN ('Completed', 'Shipped', 'Closed')
      AND CAST(COALESCE(sol.quantity_shipped, '0') AS REAL) > 0

    UNION ALL

    -- Transfers OUT
    SELECT
      stl.product_id,
      st.from_location_id AS location_id,
      st.transfer_date AS movement_date
    FROM stock_transfer_lines stl
    INNER JOIN stock_transfers st ON stl.stock_transfer_id = st.stock_transfer_id
    WHERE st.status IN ('Completed', 'Closed')

    UNION ALL

    -- Transfers IN
    SELECT
      stl.product_id,
      st.to_location_id AS location_id,
      st.transfer_date AS movement_date
    FROM stock_transfer_lines stl
    INNER JOIN stock_transfers st ON stl.stock_transfer_id = st.stock_transfer_id
    WHERE st.status IN ('Completed', 'Closed')

    UNION ALL

    -- Adjustments
    SELECT
      sal.product_id,
      sa.location_id,
      sa.adjustment_date AS movement_date
    FROM stock_adjustment_lines sal
    INNER JOIN stock_adjustments sa ON sal.stock_adjustment_id = sa.stock_adjustment_id
  ) all_movements
  GROUP BY product_id, location_id
) movements ON inv.product_id = movements.product_id
           AND inv.location_id = movements.location_id
WHERE julianday('now') - julianday(COALESCE(movements.last_movement_date, '1900-01-01')) >= 30;
`;
