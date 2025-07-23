--asdaskdjaskdaks
SELECT
	image_pict,
	DATALENGTH ( image_pict ) AS image_size 
FROM
	tbl_mg_images 
WHERE
	image_id = {0}