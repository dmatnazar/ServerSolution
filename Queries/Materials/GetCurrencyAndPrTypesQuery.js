const GetCurrencyQuery = `select lower(currency_id_guid) as currency_guid,
                    currency_name as currency_code, currency_descriptions
                    as currency_name from tbl_mg_currency`;

const GetPrTypesQuery = `select lower(p.price_type_id_guid) as price_type_guid,
                p.price_type_name, (select lower(currency_id_guid)
                from tbl_mg_currency where currency_name like '%T%M%')
                as pt_currency_guid, case when price_type_id in (1,3) then 0
                when price_type_id in (2,4) then 1 end as pt_used_in_sale
                from tbl_mg_price_type p`;

module.exports = { GetCurrencyQuery, GetPrTypesQuery };