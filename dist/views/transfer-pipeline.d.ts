/**
 * Transfer Pipeline View
 *
 * Open stock transfers between locations with line item details.
 * Shows what's in transit and pending between warehouses.
 *
 * Use cases:
 * - "What transfers are pending?"
 * - "What's coming to Warehouse B?"
 * - "Track inter-location movement"
 *
 * Joins: stockTransfers + stockTransferLines + locations (from/to) + products
 */
export declare const transferPipeline: import("drizzle-orm/sqlite-core").SQLiteViewWithSelection<"transfer_pipeline", false, {
    stockTransferId: import("drizzle-orm").SQL.Aliased<string>;
    transferNumber: import("drizzle-orm").SQL.Aliased<string>;
    status: import("drizzle-orm").SQL.Aliased<string>;
    transferDate: import("drizzle-orm").SQL.Aliased<string>;
    remarks: import("drizzle-orm").SQL.Aliased<string>;
    lastModified: import("drizzle-orm").SQL.Aliased<string>;
    fromLocationId: import("drizzle-orm").SQL.Aliased<string>;
    fromLocationName: import("drizzle-orm").SQL.Aliased<string>;
    fromLocationAbbreviation: import("drizzle-orm").SQL.Aliased<string>;
    toLocationId: import("drizzle-orm").SQL.Aliased<string>;
    toLocationName: import("drizzle-orm").SQL.Aliased<string>;
    toLocationAbbreviation: import("drizzle-orm").SQL.Aliased<string>;
    stockTransferLineId: import("drizzle-orm").SQL.Aliased<string>;
    lineNum: import("drizzle-orm").SQL.Aliased<number>;
    productId: import("drizzle-orm").SQL.Aliased<string>;
    sku: import("drizzle-orm").SQL.Aliased<string>;
    productName: import("drizzle-orm").SQL.Aliased<string>;
    quantity: import("drizzle-orm").SQL.Aliased<string>;
    fromSublocation: import("drizzle-orm").SQL.Aliased<string>;
    toSublocation: import("drizzle-orm").SQL.Aliased<string>;
}>;
/**
 * SQL to create this view manually
 */
export declare const transferPipelineSQL = "\nCREATE VIEW IF NOT EXISTS transfer_pipeline AS\nSELECT\n  st.stock_transfer_id,\n  st.transfer_number,\n  st.status,\n  st.transfer_date,\n  st.remarks,\n  st.last_modified_date_time AS last_modified,\n\n  st.from_location_id,\n  from_loc.name AS from_location_name,\n  from_loc.abbreviation AS from_location_abbreviation,\n\n  st.to_location_id,\n  to_loc.name AS to_location_name,\n  to_loc.abbreviation AS to_location_abbreviation,\n\n  stl.stock_transfer_line_id,\n  stl.line_num,\n  stl.product_id,\n  p.sku,\n  p.name AS product_name,\n  stl.quantity,\n  stl.from_sublocation,\n  stl.to_sublocation\n\nFROM stock_transfers st\nINNER JOIN stock_transfer_lines stl ON st.stock_transfer_id = stl.stock_transfer_id\nLEFT JOIN products p ON stl.product_id = p.product_id\nLEFT JOIN locations from_loc ON st.from_location_id = from_loc.location_id\nLEFT JOIN locations to_loc ON st.to_location_id = to_loc.location_id\nWHERE st.status NOT IN ('Completed', 'Cancelled', 'Closed');\n";
//# sourceMappingURL=transfer-pipeline.d.ts.map