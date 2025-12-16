import { sqliteView } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

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
export const transferPipeline = sqliteView('transfer_pipeline').as((qb) => {
  return qb
    .select({
      // Transfer header
      stockTransferId: sql<string>`st.stock_transfer_id`.as('stock_transfer_id'),
      transferNumber: sql<string>`st.transfer_number`.as('transfer_number'),
      status: sql<string>`st.status`.as('status'),
      transferDate: sql<string>`st.transfer_date`.as('transfer_date'),
      remarks: sql<string>`st.remarks`.as('remarks'),
      lastModified: sql<string>`st.last_modified_date_time`.as('last_modified'),

      // From location
      fromLocationId: sql<string>`st.from_location_id`.as('from_location_id'),
      fromLocationName: sql<string>`from_loc.name`.as('from_location_name'),
      fromLocationAbbreviation: sql<string>`from_loc.abbreviation`.as('from_location_abbreviation'),

      // To location
      toLocationId: sql<string>`st.to_location_id`.as('to_location_id'),
      toLocationName: sql<string>`to_loc.name`.as('to_location_name'),
      toLocationAbbreviation: sql<string>`to_loc.abbreviation`.as('to_location_abbreviation'),

      // Line item details
      stockTransferLineId: sql<string>`stl.stock_transfer_line_id`.as('stock_transfer_line_id'),
      lineNum: sql<number>`stl.line_num`.as('line_num'),
      productId: sql<string>`stl.product_id`.as('product_id'),
      sku: sql<string>`p.sku`.as('sku'),
      productName: sql<string>`p.name`.as('product_name'),
      quantity: sql<string>`stl.quantity`.as('quantity'),
      fromSublocation: sql<string>`stl.from_sublocation`.as('from_sublocation'),
      toSublocation: sql<string>`stl.to_sublocation`.as('to_sublocation'),
    })
    .from(sql`stock_transfers st`)
    .innerJoin(sql`stock_transfer_lines stl`, sql`st.stock_transfer_id = stl.stock_transfer_id`)
    .leftJoin(sql`products p`, sql`stl.product_id = p.product_id`)
    .leftJoin(sql`locations from_loc`, sql`st.from_location_id = from_loc.location_id`)
    .leftJoin(sql`locations to_loc`, sql`st.to_location_id = to_loc.location_id`)
    .where(sql`st.status NOT IN ('Completed', 'Cancelled', 'Closed')`);
});

/**
 * SQL to create this view manually
 */
export const transferPipelineSQL = `
CREATE VIEW IF NOT EXISTS transfer_pipeline AS
SELECT
  st.stock_transfer_id,
  st.transfer_number,
  st.status,
  st.transfer_date,
  st.remarks,
  st.last_modified_date_time AS last_modified,

  st.from_location_id,
  from_loc.name AS from_location_name,
  from_loc.abbreviation AS from_location_abbreviation,

  st.to_location_id,
  to_loc.name AS to_location_name,
  to_loc.abbreviation AS to_location_abbreviation,

  stl.stock_transfer_line_id,
  stl.line_num,
  stl.product_id,
  p.sku,
  p.name AS product_name,
  stl.quantity,
  stl.from_sublocation,
  stl.to_sublocation

FROM stock_transfers st
INNER JOIN stock_transfer_lines stl ON st.stock_transfer_id = stl.stock_transfer_id
LEFT JOIN products p ON stl.product_id = p.product_id
LEFT JOIN locations from_loc ON st.from_location_id = from_loc.location_id
LEFT JOIN locations to_loc ON st.to_location_id = to_loc.location_id
WHERE st.status NOT IN ('Completed', 'Cancelled', 'Closed');
`;
