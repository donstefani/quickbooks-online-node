INSERT INTO cart_bills_bills
(qbo_account, po_id, farm_ship_date, farm_id, event_date, order_date, 
id_cart_ordered_products_invoice, invoice_status, po_product_id)
SELECT
'fiftyflowers',
cpo.po_id,
MAX(cpoh.cpoh_date_time)as date_change,
cw.warehouse_id,
co.event_date,
co.order_date_time,
copin.id_cart_ordered_products_invoice,
cpo.invoice_status,
copbp.po_product_id
FROM cart_purchase_orders cpo
INNER JOIN fiftyflowers_orders ffo
ON ffo.order_id = cpo.parent_order_id
INNER JOIN cart_orders co ON (cpo.parent_order_id = co.order_id)
INNER JOIN cart_warehouses cw ON (cpo.warehouse_id = cw.warehouse_id)
INNER JOIN cart_ordered_products cop ON (cop.order_id = co.order_id)
INNER JOIN cart_ordered_products_by_po copbp ON (copbp.po_id= cpo.po_id AND copbp.ordered_product_id=cop.ordered_product_id)
INNER JOIN  cart_purchase_orders_history cpoh ON (copbp.po_product_id = cpoh.cpoh_item_id  AND
                                                              cpoh.cpoh_po_id = cpo.po_id AND  cpoh.uahi_code = 'IMQB'  AND
                                                              cpoh.cpoh_message like 'Qb Changes - Total%')
INNER JOIN cart_ordered_products_invoice copin ON (copin.po_product_id = copbp.po_product_id)
WHERE cpoh.cpoh_date_time between ? AND ?  
AND copbp.po_product_id NOT IN (SELECT po_product_id cart_bills_bills FROM cart_bills_bills)
GROUP BY  cpoh.cpoh_item_id;
