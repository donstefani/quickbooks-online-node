'use strict';

const fs = require('fs');
const path = require('path');
const mysql = require('./index');

const fiftyflowersSqlFile = path.join(__dirname, 'sql/farmBIllUpdateFf.sql');
const flowerfixSqlFile = path.join(__dirname, 'sql/farmBIllUpdateFlrfx.sql');

module.exports = {
  updateBillsBillsSql: async (fromDate, toDate, account) => {
    // console.log('UPDATE', fromDate, toDate);
    const sqlFile = (account === 'fiftyflowers') ? fiftyflowersSqlFile : flowerfixSqlFile;
    try {
      const sqlStmt = fs.readFileSync(sqlFile);
      await mysql.query({
        sql: sqlStmt,
        timeout: 500000,
        values: [fromDate, toDate],
      });
      await mysql.end();
      return true;
    } catch (error) {
      console.log('SQL UPDATE ERROR', error);
      throw new Error('Update farm_bills error: ', error);
    }
  },

  getQbChangesHistorySql: async (poId, poProductId) => {
    try {
      const results = await mysql.query({
        sql: `SELECT *
          FROM cart_purchase_orders_history
          WHERE cpoh_po_id = ?
          AND  uahi_code = 'IMQB'  
          AND cpoh_message like 'Qb Changes - Total%'
          AND cpoh_item_id = ?
          order by cpoh_date_time DESC LIMIT 1`,
        timeout: 500000,
        values: [poId, poProductId],
      });
      await mysql.end();
      return results;
    } catch (error) {
      throw new Error('get QB changes history Error', error);
    }
  },

  getBillsReportSql: async (fromDate, toDate, account) => {
    try {
      const results = await mysql.query({
        sql: `SELECT cbb.cart_bills_bills_id,
        cbb.po_id,
        cbb.farm_ship_date,
        cw.warehouse_id AS farm_id,
        cw.name as farm_name,
        cw.qbo_ff_id,
        cw.qbo_flrfx_id,
        copin.extra_charges,
        copin.total as total_bill,
        copin.ship_cost,
        copin.invoice_number AS farm_invoice,
        copin.handling_invoice,
        copin.handling_charges,
        cbb.event_date,
        cbb.order_date,
        cbb.po_product_id,
        cbb.invoice_status,
        cpo.leave_farm_date
        FROM cart_bills_bills cbb
        INNER JOIN cart_warehouses cw ON (cw.warehouse_id = cbb.farm_id)
        INNER JOIN cart_ordered_products_invoice copin ON (copin.id_cart_ordered_products_invoice = cbb.id_cart_ordered_products_invoice)
        INNER JOIN cart_purchase_orders cpo ON (cpo.po_id = cbb.po_id)
        WHERE 1 = 1 
        AND ((cbb.farm_ship_date BETWEEN ? AND ?))
        AND qbo_account LIKE ?
        ORDER BY cbb.farm_ship_date desc`,
        timeout: 500000,
        values: [fromDate, toDate, account],
      });
      await mysql.end();
      return results;
    } catch (error) {
      throw new Error('Get bills report failed', error);
    }
  }
};
