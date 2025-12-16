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
export declare const deadStock: import("drizzle-orm/sqlite-core").SQLiteViewWithSelection<"dead_stock", false, {
    productId: import("drizzle-orm").SQL.Aliased<string>;
    sku: import("drizzle-orm").SQL.Aliased<string>;
    productName: import("drizzle-orm").SQL.Aliased<string>;
    categoryId: import("drizzle-orm").SQL.Aliased<string>;
    categoryName: import("drizzle-orm").SQL.Aliased<string>;
    locationId: import("drizzle-orm").SQL.Aliased<string>;
    locationName: import("drizzle-orm").SQL.Aliased<string>;
    quantityOnHand: import("drizzle-orm").SQL.Aliased<string>;
    unitCost: import("drizzle-orm").SQL.Aliased<string>;
    totalValue: import("drizzle-orm").SQL.Aliased<string>;
    lastMovementDate: import("drizzle-orm").SQL.Aliased<string>;
    daysSinceMovement: import("drizzle-orm").SQL.Aliased<number>;
    deadStockTier: import("drizzle-orm").SQL.Aliased<string>;
}>;
/**
 * SQL to create this view manually
 */
export declare const deadStockSQL = "\nCREATE VIEW IF NOT EXISTS dead_stock AS\nSELECT\n  inv.product_id,\n  inv.sku,\n  inv.product_name,\n  inv.category_id,\n  inv.category_name,\n  inv.location_id,\n  inv.location_name,\n  inv.quantity_on_hand,\n  inv.unit_cost,\n  CAST(\n    CAST(COALESCE(inv.quantity_on_hand, '0') AS REAL) *\n    CAST(COALESCE(inv.unit_cost, '0') AS REAL)\n    AS TEXT\n  ) AS total_value,\n  movements.last_movement_date,\n  CAST(julianday('now') - julianday(COALESCE(movements.last_movement_date, '1900-01-01')) AS INTEGER) AS days_since_movement,\n  CASE\n    WHEN julianday('now') - julianday(COALESCE(movements.last_movement_date, '1900-01-01')) >= 90 THEN '90+'\n    WHEN julianday('now') - julianday(COALESCE(movements.last_movement_date, '1900-01-01')) >= 60 THEN '60+'\n    WHEN julianday('now') - julianday(COALESCE(movements.last_movement_date, '1900-01-01')) >= 30 THEN '30+'\n    ELSE NULL\n  END AS dead_stock_tier\nFROM (\n  -- Current inventory by product/location with vendor cost\n  SELECT\n    ps.product_id,\n    p.sku,\n    p.name AS product_name,\n    p.category_id,\n    c.name AS category_name,\n    ps.location_id,\n    l.name AS location_name,\n    ps.quantity_on_hand,\n    vi.cost AS unit_cost\n  FROM product_summary ps\n  INNER JOIN products p ON ps.product_id = p.product_id\n  LEFT JOIN categories c ON p.category_id = c.category_id\n  LEFT JOIN locations l ON ps.location_id = l.location_id\n  LEFT JOIN (\n    SELECT product_id, cost,\n      ROW_NUMBER() OVER (PARTITION BY product_id ORDER BY CAST(cost AS REAL) ASC) AS rn\n    FROM vendor_items\n  ) vi ON p.product_id = vi.product_id AND vi.rn = 1\n  WHERE ps.location_id IS NOT NULL\n    AND CAST(COALESCE(ps.quantity_on_hand, '0') AS REAL) > 0\n) inv\nLEFT JOIN (\n  -- Last movement date per product/location from all movement sources\n  SELECT\n    product_id,\n    location_id,\n    MAX(movement_date) AS last_movement_date\n  FROM (\n    -- PO Receipts\n    SELECT\n      pol.product_id,\n      po.location_id,\n      po.order_date AS movement_date\n    FROM purchase_order_lines pol\n    INNER JOIN purchase_orders po ON pol.purchase_order_id = po.purchase_order_id\n    WHERE LOWER(po.status) IN ('completed', 'closed', 'fulfilled')\n      AND CAST(COALESCE(pol.quantity_received, '0') AS REAL) > 0\n\n    UNION ALL\n\n    -- SO Shipments\n    SELECT\n      sol.product_id,\n      so.location_id,\n      so.order_date AS movement_date\n    FROM sales_order_lines sol\n    INNER JOIN sales_orders so ON sol.sales_order_id = so.sales_order_id\n    WHERE LOWER(so.status) IN ('completed', 'shipped', 'closed', 'fulfilled')\n      AND CAST(COALESCE(sol.quantity_shipped, '0') AS REAL) > 0\n\n    UNION ALL\n\n    -- Transfers OUT\n    SELECT\n      stl.product_id,\n      st.from_location_id AS location_id,\n      st.transfer_date AS movement_date\n    FROM stock_transfer_lines stl\n    INNER JOIN stock_transfers st ON stl.stock_transfer_id = st.stock_transfer_id\n    WHERE LOWER(st.status) IN ('completed', 'closed')\n\n    UNION ALL\n\n    -- Transfers IN\n    SELECT\n      stl.product_id,\n      st.to_location_id AS location_id,\n      st.transfer_date AS movement_date\n    FROM stock_transfer_lines stl\n    INNER JOIN stock_transfers st ON stl.stock_transfer_id = st.stock_transfer_id\n    WHERE LOWER(st.status) IN ('completed', 'closed')\n\n    UNION ALL\n\n    -- Adjustments\n    SELECT\n      sal.product_id,\n      sa.location_id,\n      sa.adjustment_date AS movement_date\n    FROM stock_adjustment_lines sal\n    INNER JOIN stock_adjustments sa ON sal.stock_adjustment_id = sa.stock_adjustment_id\n  ) all_movements\n  GROUP BY product_id, location_id\n) movements ON inv.product_id = movements.product_id\n           AND inv.location_id = movements.location_id\nWHERE julianday('now') - julianday(COALESCE(movements.last_movement_date, '1900-01-01')) >= 30;\n";
//# sourceMappingURL=dead-stock.d.ts.map