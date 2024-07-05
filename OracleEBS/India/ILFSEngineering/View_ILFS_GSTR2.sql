SELECT DISTINCT
	TO_CHAR(rcv.TRANSACTION_DATE,'MMYYYY') fp,
    jtl.FIRST_PARTY_PRIMARY_REG_NUM gstin,
    'RI' dty, -- Kept as default 'RI' -- TBD
    'B2B' invTyp,
    'O' dst, -- Kept as default 'O' -- Revised cases to be added
    CASE 
        WHEN SUBSTR(jtl.FIRST_PARTY_PRIMARY_REG_NUM,1,2) <> SUBSTR(jtl.THIRD_PARTY_PRIMARY_REG_NUM,1,2) THEN 'INTER'
        WHEN SUBSTR(jtl.FIRST_PARTY_PRIMARY_REG_NUM,1,2) = SUBSTR(jtl.THIRD_PARTY_PRIMARY_REG_NUM,1,2) THEN 'INTRA'
        ELSE NULL
    END splyTy,
    CASE 
        WHEN jtl.THIRD_PARTY_PRIMARY_REG_NUM IS NULL THEN 'U'
        ELSE 'R'
    END ctpy,
    'RD' rtpy, -- Kept as default 'RD', 'CD' and 'SEZ' cases to be explored
    jtl.THIRD_PARTY_PRIMARY_REG_NUM ctin,
    aps.VENDOR_NAME cname,
    NULL nt_num,    -- TBD
    NULL nt_dt,     -- TBD
    rsh.RECEIPT_NUM inum,
	to_char(rcv.TRANSACTION_DATE,'DD-MM-YYYY') idt,
    NULL sbnum,     -- Applicable only in case of Import
    NULL sbdt,      -- Applicable only in case of Import
    NULL sbpcode,   -- Applicable only in case of Import
    NULL rsn,       -- To be added in cases of CM
    'N' p_gst,      -- As no transactions are before the Pre-GSTIN regime
    0 val, -- Total Invoice Amount incl Tax
    (SELECT 
        flv.LOOKUP_CODE
     FROM 
        FND_LOOKUP_VALUES flv
     WHERE 1=1
        AND flv.LOOKUP_TYPE = 'GST STATE LOOKUP'
        AND flv.DESCRIPTION = jtdf.SHIP_TO_STATE 
    ) pos,
    CASE WHEN jr.REGIME_NAME = 'RCM' THEN 'Y'
        ELSE 'N'
    END rchrg,
    rsl.LINE_NUM num,
    jtl.LINE_AMT sval,
    0 disc,
    0 adval,
    DECODE(rsl.ITEM_ID,NULL,'SERVICES','GOODS') ty, -- 'G' for Goods, 'S' for Services
    '9954' hsn_sc, -- Construction Services hardcoded as HSN
    rsl.ITEM_DESCRIPTION description,
    rsl.UNIT_OF_MEASURE uqc,
    rsl.QUANTITY_RECEIVED qty,
    jtl.LINE_AMT txval,
    NULL rt, -- Blank as it is automatically derived by IRIS
	
	CASE 
        WHEN SUBSTR(jtl.FIRST_PARTY_PRIMARY_REG_NUM,1,2) <> SUBSTR(jtl.THIRD_PARTY_PRIMARY_REG_NUM,1,2) THEN jtl.ACTUAL_TAX_RATE
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
        AND jtt.TAX_TYPE_CODE IN ('IGST','IGST–WO')
    )iamt,
	
	CASE 
        WHEN SUBSTR(jtl.FIRST_PARTY_PRIMARY_REG_NUM,1,2) = SUBSTR(jtl.THIRD_PARTY_PRIMARY_REG_NUM,1,2) THEN jtl.ACTUAL_TAX_RATE
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
        AND jtt.TAX_TYPE_CODE IN ('CGST','CGST–WO')
    ) camt,
	
	CASE 
        WHEN SUBSTR(jtl.FIRST_PARTY_PRIMARY_REG_NUM,1,2) = SUBSTR(jtl.THIRD_PARTY_PRIMARY_REG_NUM,1,2) THEN jtl.ACTUAL_TAX_RATE
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
        AND jtt.TAX_TYPE_CODE IN ('SGST','SGST–WO')
    ) samt,
    NULL csrt, -- Applicable in case of CESS, Scenarios to be confirmed
    NULL csamt, -- Applicable in case of CESS, Scenarios to be confirmed
    'is' elg,
    NULL tx_i,
    NULL tx_c,
    NULL tx_s,
    NULL tx_cs,
    'T' txp,
    ( EXTRACT (YEAR FROM ADD_MONTHS (rsh.SHIPPED_DATE, -3))
       || '-'
       || EXTRACT (YEAR FROM ADD_MONTHS (rsh.SHIPPED_DATE, 9))
    ) fy,
    rsh.SHIPMENT_HEADER_ID refnum,
    TO_CHAR(rsh.SHIPPED_DATE,'DD-MM-YYYY') pdt, -- TBD
    NULL ivst,       -- TBD
    (SELECT 
        hp_sup.PARTY_NUMBER
    FROM 
        HZ_PARTIES hp_sup
    WHERE 
        aps.PARTY_ID = hp_sup.PARTY_ID
    ) cptycde,
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
    RCTA.INTERFACE_HEADER_ATTRIBUTE4 ERP_PROJECT
FROM  
    RA_CUSTOMER_TRX_ALL rcta,
    RCV_SHIPMENT_HEADERS rsh,
    RCV_SHIPMENT_LINES rsl,
    RCV_TRANSACTIONS rcv,
    JAI_TAX_LINES jtl,
    JAI_TAX_DET_FACTORS jtdf,
    JAI_TAX_RATES jtr,
    JAI_REGIMES jr,
    AP_SUPPLIERS aps
WHERE rsh.SHIPMENT_HEADER_ID = rsl.SHIPMENT_HEADER_ID
    AND rsl.SHIPMENT_LINE_ID= rcv.SHIPMENT_LINE_ID
    AND rcv.TRANSACTION_ID = jtl.TRX_LOC_LINE_ID
    AND jtl.DET_FACTOR_ID = jtdf.DET_FACTOR_ID
    AND jtl.TAX_RATE_ID = jtr.TAX_RATE_ID
    AND jtr.REGIME_ID = jr.REGIME_ID
    AND aps.VENDOR_ID = rcv.VENDOR_ID
    AND rcv.TRANSACTION_TYPE='DELIVER'
    AND rcv.SOURCE_DOCUMENT_CODE<>'INVENTORY'
    AND NOT EXISTS (SELECT SHIPMENT_HEADER_ID 
                    FROM APPS.RCV_TRANSACTIONS where TRANSACTION_TYPE like 'RETURN TO%' and SHIPMENT_HEADER_ID=rsh.SHIPMENT_HEADER_ID)