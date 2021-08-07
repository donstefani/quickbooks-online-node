'use strict';

const mysql = require('./index');

module.exports = {
  updateWarehouseQbId: async (id, vendorId) => {
    try {
      await mysql.query({
        sql: `UPDATE cart_warehouses SET qbo_vendor_id = ?
        WHERE vendor_code = ?`,
        timeout: 600000,
        values: [id, vendorId],
      });
      await mysql.end();
      return true;
    } catch (error) {
      console.log('Update Warehouse QBO id fail', error);
      throw new Error('Update Warehouse QBO id fail', error);
    }
  }
};
