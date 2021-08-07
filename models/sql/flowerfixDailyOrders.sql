CREATE TEMPORARY TABLE orders_a

SELECT  co.order_id, 
        COUNT(`pos`.`po_id`) AS `total_pos_status`,
        (
			SELECT COUNT(`cart_purchase_orders`.`po_id`) 
			FROM  `cart_purchase_orders` 
			WHERE  (`cart_purchase_orders`.`parent_order_id` = `co`.`order_id`)
		) AS `total_pos`
FROM cart_orders co
INNER JOIN flowerfix_tag_orders ffto
ON ffto.order_id = co.order_id
INNER JOIN cart_purchase_orders pos
ON co.order_id = pos.parent_order_id

-- get first po invoice status & po status
WHERE pos.invoice_status IN ( 'Ship And Farm Billed', 'Farm & Ship and Handling Billed' )
AND pos.status IN ('Farm Confirmed', 'Cancelled', 'Cancel Complete', 'Claim', 'Claim nobody','Claim farm request', 'Claim farm no', 'Claim farm approved', 'Claim farm denied', 'Claim farm done', 'Claim shipper', 'Claim shipper sent', 'Claim shipper refund', 'Claim shipper denied')
AND pos.delivery_date BETWEEN ? AND ?

-- now we check for this unique status combination
OR pos.invoice_status = 'Invoice Need'
AND pos.status = 'Cancel Complete'
AND pos.delivery_date BETWEEN ? AND ?

-- now find the orders that are 0.00 amount and not "not finalized"
OR pos.invoice_status IN ( 'Ship And Farm Billed', 'Farm & Ship and Handling Billed' )
AND pos.status IN ('Farm Confirmed', 'Cancelled', 'Cancel Complete', 'Claim', 'Claim nobody','Claim farm request', 'Claim farm no', 'Claim farm approved', 'Claim farm denied', 'Claim farm done', 'Claim shipper', 'Claim shipper sent', 'Claim shipper refund', 'Claim shipper denied')
AND pos.delivery_date BETWEEN ? AND ?
AND co.order_total = 0.00
GROUP BY `co`.`order_id`
HAVING (`total_pos_status` = `total_pos`)
-- LIMIT is only for testing
ORDER BY co.order_id;

CREATE TEMPORARY TABLE orders_b
-- now we query the first temp table that is created for po invoice status that we don't want
-- and create a table to hold that data
SELECT DISTINCT oa.order_id
FROM orders_a oa
INNER JOIN cart_purchase_orders pos
ON oa.order_id = pos.parent_order_id
WHERE pos.invoice_status IN ('Invoiced', 'Farm Bill', 'Ship Bill Need Farm', 'Farm Bill Need Ship & Handling', 'Ship Bill Need Farm & Handling', 'Handling Bill Need Farm & Ship' , 'Farm and Ship bill Need Handling', 'Ship & Handling Bill Need Farm', 'Farm and Handling Bill Need Ship');

-- now we query the 2 tables and find the ones we want
SELECT DISTINCT a.order_id
FROM orders_a a
LEFT OUTER JOIN orders_b b
ON b.order_id = a.order_id
WHERE b.order_id IS NULL
ORDER BY a.order_id ASC;

-- clean up
DROP TEMPORARY TABLE orders_a;
DROP TEMPORARY TABLE orders_b;
