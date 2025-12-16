/**
 * Vendor Scorecard View
 *
 * Complete vendor profile with product catalog and PO history metrics.
 * Shows products supplied, total spend, and PO performance.
 *
 * Use cases:
 * - "Who are my top vendors by spend?"
 * - "How many products does this vendor supply?"
 * - "Vendor lead time analysis"
 *
 * Joins: vendors + vendor_items (aggregated) + purchase_orders (aggregated)
 */
export declare const vendorScorecard: import("drizzle-orm/sqlite-core").SQLiteViewWithSelection<"vendor_scorecard", false, {
    vendorId: import("drizzle-orm").SQL.Aliased<string>;
    vendorName: import("drizzle-orm").SQL.Aliased<string>;
    vendorCode: import("drizzle-orm").SQL.Aliased<string>;
    email: import("drizzle-orm").SQL.Aliased<string>;
    phone: import("drizzle-orm").SQL.Aliased<string>;
    isActive: import("drizzle-orm").SQL.Aliased<number>;
    paymentTermsId: import("drizzle-orm").SQL.Aliased<string>;
    paymentTermsName: import("drizzle-orm").SQL.Aliased<string>;
    productsSupplied: import("drizzle-orm").SQL.Aliased<number>;
    avgLeadTimeDays: import("drizzle-orm").SQL.Aliased<number>;
    totalPOs: import("drizzle-orm").SQL.Aliased<number>;
    completedPOs: import("drizzle-orm").SQL.Aliased<number>;
    cancelledPOs: import("drizzle-orm").SQL.Aliased<number>;
    openPOs: import("drizzle-orm").SQL.Aliased<number>;
    totalSpend: import("drizzle-orm").SQL.Aliased<string>;
    averagePOValue: import("drizzle-orm").SQL.Aliased<string>;
    openPOsValue: import("drizzle-orm").SQL.Aliased<string>;
    firstPODate: import("drizzle-orm").SQL.Aliased<string>;
    lastPODate: import("drizzle-orm").SQL.Aliased<string>;
}>;
/**
 * SQL to create this view manually
 */
export declare const vendorScorecardSQL = "\nCREATE VIEW IF NOT EXISTS vendor_scorecard AS\nSELECT\n  v.vendor_id,\n  v.name AS vendor_name,\n  v.vendor_code,\n  v.email,\n  v.phone,\n  v.is_active,\n\n  v.payment_terms_id,\n  pt.name AS payment_terms_name,\n\n  COALESCE(product_stats.products_supplied, 0) AS products_supplied,\n  product_stats.avg_lead_time_days,\n\n  COALESCE(po_stats.total_pos, 0) AS total_pos,\n  COALESCE(po_stats.completed_pos, 0) AS completed_pos,\n  COALESCE(po_stats.cancelled_pos, 0) AS cancelled_pos,\n  COALESCE(po_stats.open_pos, 0) AS open_pos,\n\n  COALESCE(po_stats.total_spend, '0') AS total_spend,\n  CASE\n    WHEN COALESCE(po_stats.completed_pos, 0) > 0\n    THEN CAST(CAST(COALESCE(po_stats.total_spend, '0') AS REAL) / po_stats.completed_pos AS TEXT)\n    ELSE '0'\n  END AS average_po_value,\n  COALESCE(po_stats.open_pos_value, '0') AS open_pos_value,\n\n  po_stats.first_po_date,\n  po_stats.last_po_date\n\nFROM vendors v\nLEFT JOIN payment_terms pt ON v.payment_terms_id = pt.payment_terms_id\nLEFT JOIN (\n  SELECT\n    vendor_id,\n    COUNT(DISTINCT product_id) AS products_supplied,\n    AVG(lead_time_days) AS avg_lead_time_days\n  FROM vendor_items\n  GROUP BY vendor_id\n) product_stats ON v.vendor_id = product_stats.vendor_id\nLEFT JOIN (\n  SELECT\n    vendor_id,\n    COUNT(*) AS total_pos,\n    SUM(CASE WHEN status IN ('Completed', 'Closed') THEN 1 ELSE 0 END) AS completed_pos,\n    SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END) AS cancelled_pos,\n    SUM(CASE WHEN status NOT IN ('Completed', 'Closed', 'Cancelled') THEN 1 ELSE 0 END) AS open_pos,\n    SUM(CASE WHEN status IN ('Completed', 'Closed') THEN CAST(COALESCE(total, '0') AS REAL) ELSE 0 END) AS total_spend,\n    SUM(CASE WHEN status NOT IN ('Completed', 'Closed', 'Cancelled') THEN CAST(COALESCE(total, '0') AS REAL) ELSE 0 END) AS open_pos_value,\n    MIN(order_date) AS first_po_date,\n    MAX(order_date) AS last_po_date\n  FROM purchase_orders\n  GROUP BY vendor_id\n) po_stats ON v.vendor_id = po_stats.vendor_id;\n";
//# sourceMappingURL=vendor-scorecard.d.ts.map