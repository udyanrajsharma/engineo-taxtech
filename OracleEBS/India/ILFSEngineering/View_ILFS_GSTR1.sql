SELECT DISTINCT
    TO_CHAR(rcta.TRX_DATE,'MMYYYY') fp,
    jtl.FIRST_PARTY_PRIMARY_REG_NUM gstin,
    CASE 
        WHEN rctta.TYPE = 'INV' THEN 'RI'
        WHEN rctta.TYPE = 'CM' THEN 'C'
        WHEN rctta.TYPE = 'DM' THEN 'D'
        ELSE 'NA' -- To capture other types and to be added later.
    END dty, -- TBD     
    'B2B' invTyp,
    CASE 
        WHEN rctta.TYPE = 'INV' THEN 'O'
        WHEN rctta.TYPE IN ('CM','DM') THEN 'R'
    END dst,
	
    CASE 
        WHEN jtdf.SHIP_FROM_STATE <> jtdf.BILL_TO_STATE THEN 'INTER'
        WHEN jtdf.SHIP_FROM_STATE = jtdf.BILL_TO_STATE THEN 'INTRA'
        ELSE NULL
    END splyTy,
	
    CASE 
        WHEN jtl.THIRD_PARTY_PRIMARY_REG_NUM IS NULL THEN 'U'
        ELSE 'R' 
    END ctpy,
--    (SELECT e.REGISTRATION_NUMBER
--    FROM 
--        JAI_PARTY_REGS d,
--        JAI_PARTY_REG_LINES e
--    WHERE 1=1
--        AND d.PARTY_REG_ID = e.PARTY_REG_ID
--        AND e.REGISTRATION_TYPE_CODE='GST'
--        AND e.EFFECTIVE_TO IS NULL
--        AND D.ORG_ID = rcta.ORG_ID
--        and d.PARTY_ID = rcta.BILL_TO_CUSTOMER_ID
--    )
    jtl.THIRD_PARTY_PRIMARY_REG_NUM ctin,
    hp_cust.PARTY_NAME cname,
    NULL ntnum, -- TBD
    NULL ntdt, -- TBD
    rcta.TRX_NUMBER inum,
    NULL rsn, -- reason for CM, DM -- TDB
    'N' p_gst, -- Hardcoded as no pre-gst regime invoice to be considered
    NULL omon, -- Applicable only for Lease transactions, Cases yet to be identified
    NULL ont_num, -- TDB
    NULL ont_dt, -- TBD
    NULL oinum, -- TBD
    NULL oidt, -- TBD
    NULL octin, -- TBD
    0 val, -- Total Invoice Amount incl Tax
    (SELECT 
        flv.LOOKUP_CODE
     FROM 
        FND_LOOKUP_VALUES flv
     WHERE 1=1
        AND flv.LOOKUP_TYPE = 'GST STATE LOOKUP'
        AND flv.DESCRIPTION = jtdf.BILL_TO_STATE 
    ) pos,
    CASE WHEN jr.REGIME_NAME = 'RCM' THEN 'Y'
        ELSE 'N'
    END rchrg,
    NULL etin, -- Null as E-Commerce scenarios do not exist
    NULL sbdt, -- Only one export case found for the ILFS India OU, hence this will added if required later.
    NULL sbpcode, -- Only one export case found for the ILFS India OU, hence this will added if required later.
    rctla.LINE_NUMBER num,
    abs(jtl.LINE_AMT) sval,
    0 disc,
    0 adval,
    'S' ty, -- 'G' for Goods, 'S' for Services
    '9954' hsn_sc, -- Construction Services hardcoded as HSN
    rctla.DESCRIPTION description,
    'NOS' uqc, --Hardcoded as per past GSTIN returns in ILFS
    rctla.QUANTITY_INVOICED qty,
    jtl.UNROUND_TAXABLE_AMT_TRX_CURR txval,
    NULL rt, -- Blank as it is automatically derived by IRIS
	
	CASE 
        WHEN jtdf.SHIP_FROM_STATE <> jtdf.BILL_TO_STATE THEN jtl.ACTUAL_TAX_RATE
        ELSE NULL
    END irt,
    --jtl.ACTUAL_TAX_RATE irt,
	
    (SELECT 
        SUM(ABS(jtl2.UNROUND_TAX_AMT_FUN_CURR))
    FROM 
        JAI_TAX_LINES jtl2,
        JAI_TAX_RATES jtr2,
        JAI_TAX_TYPES jtt
    WHERE 1=1
        AND jtl.TRX_LINE_ID = jtl2.TRX_LINE_ID
        AND jtl2.TAX_RATE_ID = jtr2.TAX_RATE_ID
        AND jtr2.TAX_TYPE_ID = jtt.TAX_TYPE_ID
        AND jtt.TAX_TYPE_CODE IN ('IGST','IGSTâ€“WO')
    )iamt,
	
	CASE 
        WHEN jtdf.SHIP_FROM_STATE = jtdf.BILL_TO_STATE THEN jtl.ACTUAL_TAX_RATE
        ELSE NULL
    END crt,
	
    --jtl.ACTUAL_TAX_RATE crt,
	
    (SELECT 
        SUM(ABS(jtl2.UNROUND_TAX_AMT_FUN_CURR))
    FROM 
        JAI_TAX_LINES jtl2,
        JAI_TAX_RATES jtr2,
        JAI_TAX_TYPES jtt
    WHERE 1=1
        AND jtl.TRX_LINE_ID = jtl2.TRX_LINE_ID
        AND jtl2.TAX_RATE_ID = jtr2.TAX_RATE_ID
        AND jtr2.TAX_TYPE_ID = jtt.TAX_TYPE_ID
        AND jtt.TAX_TYPE_CODE IN ('CGST','CGSTâ€“WO')
    ) camt,
	
	CASE 
        WHEN jtdf.SHIP_FROM_STATE = jtdf.BILL_TO_STATE THEN jtl.ACTUAL_TAX_RATE
        ELSE NULL
    END srt,
	
    --jtl.ACTUAL_TAX_RATE srt,
	
    (SELECT 
        SUM(ABS(jtl2.UNROUND_TAX_AMT_FUN_CURR))
    FROM 
        JAI_TAX_LINES jtl2,
        JAI_TAX_RATES jtr2,
        JAI_TAX_TYPES jtt
    WHERE 1=1
        AND jtl.TRX_LINE_ID = jtl2.TRX_LINE_ID
        AND jtl2.TAX_RATE_ID = jtr2.TAX_RATE_ID
        AND jtr2.TAX_TYPE_ID = jtt.TAX_TYPE_ID
        AND jtt.TAX_TYPE_CODE IN ('SGST','SGSTâ€“WO')
    ) samt,
    NULL csrt, -- Applicable in case of CESS, Scenarios to be confirmed
    NULL csamt, -- Applicable in case of CESS, Scenarios to be confirmed
    'T' txp,
    ( EXTRACT (YEAR FROM ADD_MONTHS (rcta.TRX_DATE, -3))
       || '-'
       || EXTRACT (YEAR FROM ADD_MONTHS (rcta.TRX_DATE, 9))
    ) fy,
    rcta.CUSTOMER_TRX_ID refnum,
    TO_CHAR(rcta.TRX_DATE,'DD-MM-YYYY') idt,
    NULL ivst,
    hp_cust.PARTY_NUMBER cptycde,
    NULL gen1,
    NULL gen2,
    NULL gen3,
    NULL gen4,
    NULL gen5,
    NULL gen6,
    NULL gen7,
    NULL gen8,
    NULL gen9,
    NULL gen10,
    NULL gen11,
    NULL gen12,
    NULL gen13,
    NULL gen14,
    NULL gen15,
    NULL gen16,
    NULL gen17,
    NULL gen18,
    NULL gen19,
    NULL gen20,
    NULL ival,
    RCTA.INTERFACE_HEADER_ATTRIBUTE4 ERP_PROJECT
FROM
    RA_CUSTOMER_TRX_ALL rcta,
    HR_ALL_ORGANIZATION_UNITS hrou,
    RA_CUST_TRX_TYPES_ALL rctta,
    RA_CUSTOMER_TRX_LINES_ALL rctla,
    JAI_TAX_LINES_ALL jtl,
    JAI_TAX_DET_FACTORS jtdf,
    JAI_TAX_RATES jtr,
    JAI_REGIMES jr,
    HZ_CUST_ACCOUNTS hca,
    HZ_PARTIES hp_cust
WHERE 1=1
    AND rcta.ORG_ID = hrou.ORGANIZATION_ID
    AND hrou.NAME = 'ILFS India OU'
    AND rcta.CUSTOMER_TRX_ID = rctla.CUSTOMER_TRX_ID
    AND rctla.LINE_TYPE = 'LINE'
    AND rcta.CUST_TRX_TYPE_ID = rctta.CUST_TRX_TYPE_ID
    AND rcta.ORG_ID = rctta.ORG_ID
    AND rcta.CUSTOMER_TRX_ID = jtl.TRX_ID
    AND rctla.CUSTOMER_TRX_LINE_ID = jtl.TRX_LINE_ID
    AND jtl.ENTITY_CODE = 'TRANSACTIONS'
    AND jtl.EVENT_CLASS_CODE = 'INVOICE'
    AND jtl.DET_FACTOR_ID = jtdf.DET_FACTOR_ID
    AND jtl.TAX_RATE_ID = jtr.TAX_RATE_ID
    AND jtr.REGIME_ID = jr.REGIME_ID
    AND rcta.BILL_TO_CUSTOMER_ID = hca.CUST_ACCOUNT_ID
    AND hca.PARTY_ID = hp_cust.PARTY_ID