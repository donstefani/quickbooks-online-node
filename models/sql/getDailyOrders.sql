CREATE TEMPORARY TABLE good_orders
SELECT DISTINCT co.order_id
FROM cart_orders co
INNER JOIN cart_purchase_orders pos
ON co.order_id = pos.parent_order_id
WHERE pos.invoice_status IN ( 'Ship And Farm Billed' , 'Farm & Ship and Handling Billed' );

CREATE TEMPORARY TABLE bad_orders
SELECT DISTINCT co.order_id
FROM cart_orders co
INNER JOIN cart_purchase_orders pos
ON co.order_id = pos.parent_order_id
WHERE pos.invoice_status NOT IN ( 'Ship And Farm Billed' , 'Farm & Ship and Handling Billed' )
ORDER BY co.order_id DESC
LIMIT 2000;

SELECT g.order_id
FROM good_orders g
LEFT OUTER JOIN bad_orders b
ON b.order_id = g.order_id
WHERE b.order_id IS NULL;

DROP TEMPORARY TABLE good_orders;
DROP TEMPORARY TABLE bad_orders;