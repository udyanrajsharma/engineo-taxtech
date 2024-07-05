SELECT DISTINCT
    'PROJECT_INVOICE' ilfsTxnMethod,
    'EINV_ONLY' apiCatg,
    jtl.FIRST_PARTY_PRIMARY_REG_NUM userGstin,
    NULL pobCode,
    'O' supplyType, -- O = Outward, for E-invoicing, I = Inward, Only for EWB purpose
    CASE 
        WHEN SUBSTR(jtl.FIRST_PARTY_PRIMARY_REG_NUM,0,2) <> SUBSTR(jtl.THIRD_PARTY_PRIMARY_REG_NUM,0,2) THEN 'INTER'
        WHEN SUBSTR(jtl.FIRST_PARTY_PRIMARY_REG_NUM,0,2) = SUBSTR(jtl.THIRD_PARTY_PRIMARY_REG_NUM,0,2) THEN 'INTRA'
        ELSE 'INTER'
    END ntr,
    CASE 
        WHEN rctta.TYPE = 'INV' THEN 'RI'
        WHEN rctta.TYPE = 'CM' THEN 'C'
        WHEN rctta.TYPE = 'DM' THEN 'D'
        ELSE 'NA' -- To capture other types and to be added later.
    END docType,
    'INV' ewbDocType,
    'B2B' catg,
    CASE 
        WHEN rctta.TYPE = 'INV' THEN 'O'
        WHEN rctta.TYPE IN ('CM','DM') THEN 'R'
    END dst,
    'REG' trnTyp,
    rcta.TRX_NUMBER no,
    TO_CHAR(rcta.TRX_DATE,'DD-MM-YYYY') dt,
    (SELECT 
        LISTAGG(rcta2.TRX_NUMBER,',') WITHIN GROUP (ORDER BY rcta2.TRX_NUMBER)
    FROM 
        AR_RECEIVABLE_APPLICATIONS_ALL araa,
        RA_CUSTOMER_TRX_ALL rcta2
    WHERE 
        rcta.CUSTOMER_TRX_ID = araa.CUSTOMER_TRX_ID
        AND araa.APPLIED_CUSTOMER_TRX_ID = rcta2.CUSTOMER_TRX_ID
        AND araa.APPLICATION_TYPE = 'CM'
        AND araa.STATUS = 'APP'
        AND araa.DISPLAY = 'Y'
    ) refinum,
--    refidt
    CASE WHEN jr.REGIME_NAME = 'RCM' THEN 'Y'
        ELSE 'N'
    END rchrg,
    (SELECT 
        flv.LOOKUP_CODE
     FROM 
        FND_LOOKUP_VALUES flv
     WHERE 1=1
        AND flv.LOOKUP_TYPE = 'GST STATE LOOKUP'
        AND flv.LOOKUP_CODE = SUBSTR(jtl.FIRST_PARTY_PRIMARY_REG_NUM,0,2) 
    )pos,
    NULL diffprcnt,
    NULL etin,
    jtl.FIRST_PARTY_PRIMARY_REG_NUM sgstin,
    'IECCL' strdNm,
    hrou.NAME slglNm,
    seller_dtls.ADDRESS1 sbnm,
    seller_dtls.ADDRESS2 sflno,
    seller_dtls.CITY sloc,
    seller_dtls.CITY sdst,
    (SELECT 
        flv.LOOKUP_CODE
     FROM 
        FND_LOOKUP_VALUES flv
     WHERE 1=1
        AND flv.LOOKUP_TYPE = 'GST STATE LOOKUP'
        AND flv.LOOKUP_CODE = SUBSTR(jtl.FIRST_PARTY_PRIMARY_REG_NUM,0,2) 
    ) sstcd,
    REGEXP_REPLACE(seller_dtls.POSTAL_CODE, '[^0-9]', '') spin,
--    NULL sph,
--    NULL sem,
    jtl.THIRD_PARTY_PRIMARY_REG_NUM bgstin,
    hp_cust.PARTY_NAME btrdNm,
    hp_cust.PARTY_NAME blglNm,
    hp_cust.ADDRESS1 bbnm,
    hp_cust.ADDRESS2 bflno,
    hp_cust.CITY bloc,
    hp_cust.STATE bdst,
    SUBSTR(jtl.THIRD_PARTY_PRIMARY_REG_NUM,0,2) bstcd,
    REGEXP_REPLACE(hp_cust.POSTAL_CODE, '[^0-9]', '') bpin,
    NULL bph,
    NULL bem,
    NULL dgstin,
    NULL dtrdNm,
    NULL dlglNm,
    NULL dbnm,
    NULL dflno,
    NULL dloc,
    NULL ddst,
    NULL dstcd,
    NULL dpin,
    NULL dph,
    NULL dem,
    NULL togstin,
    NULL totrdNm,
    NULL tolglNm,
    NULL tobnm,
    NULL toflno,
    NULL toloc,
    NULL todst,
    NULL tostcd,
    NULL topin,
    NULL toph,
    NULL toem,
    NULL sbnum,
    NULL sbdt,
    NULL port,
    NULL cntcd,
    NULL forCur,
    NULL invForCur,
    0 totinvval, -- Being calculated as a sum of the line amounts during API Payload preparation
    0 totdisc,
    0 totfrt,
    0 totins,
    0 totpkg,
    0 totothchrg,
    0 tottxval, -- Being calculated as a sum of the line amounts during API Payload preparation
    0 totiamt,  -- Being calculated as a sum of the line amounts during API Payload preparation
    0 totcamt,  -- Being calculated as a sum of the line amounts during API Payload preparation
    0 totsamt,  -- Being calculated as a sum of the line amounts during API Payload preparation
    0 totcsamt,  -- Being calculated as a sum of the line amounts during API Payload preparation
    0 totstcsamt,    -- Being calculated as a sum of the line amounts during API Payload preparation
    0 rndOffAmt,     -- Being calculated as a sum of the line amounts during API Payload preparation
    rctla.LINE_NUMBER num,
    NULL prdNm,
    rctla.DESCRIPTION prdDesc,
    9954 hsnCd, -- Construction Services hardcoded as HSN
    NULL barcde,
    rctla.QUANTITY_INVOICED qty,
    NULL freeQty,
    'NOS' unit,
    rctla.UNIT_SELLING_PRICE unitPrice,
    (rctla.UNIT_SELLING_PRICE * rctla.QUANTITY_INVOICED) sval,
    0 disc,
    0 othchrg,
    (rctla.UNIT_SELLING_PRICE * rctla.QUANTITY_INVOICED) txval,
    NULL rt, -- Blank as it is automatically derived by IRIS
    CASE 
        WHEN substr(jtl.FIRST_PARTY_PRIMARY_REG_NUM,0,2) <> substr(jtl.THIRD_PARTY_PRIMARY_REG_NUM,0,2) THEN jtl.ACTUAL_TAX_RATE
        ELSE NULL
    END irt,
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
        AND jtt.TAX_TYPE_CODE LIKE '%IGST%'
    )iamt,
    CASE 
        WHEN substr(jtl.FIRST_PARTY_PRIMARY_REG_NUM,0,2) = substr(jtl.THIRD_PARTY_PRIMARY_REG_NUM,0,2) THEN jtl.ACTUAL_TAX_RATE
        ELSE NULL
    END crt,
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
        AND jtt.TAX_TYPE_CODE LIKE '%CGST%'
    ) camt,
    CASE 
        WHEN substr(jtl.FIRST_PARTY_PRIMARY_REG_NUM,0,2) = substr(jtl.THIRD_PARTY_PRIMARY_REG_NUM,0,2) THEN jtl.ACTUAL_TAX_RATE
        ELSE NULL
    END srt,
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
        AND jtt.TAX_TYPE_CODE LIKE '%SGST%'
    ) samt,
    NULL csrt,
    NULL csamt,
    NULL stcsrt,
    NULL stcsamt,
    NULL cesNonAdval,
    NULL stCesNonAdvl,
    NULL itmVal, -- Being calculated as a sum of the line amounts during API Payload preparation
    'T' txp,
    NULL bchnm,
    NULL bchExpDt,
    NULL bchWrDt,
    'Y' isServc,
    NULL preTaxVal,
    NULL ordLineRef,
    NULL orgCntry,
    NULL prdSlNo,
    NULL attNm,
    NULL attVal,
    NULL itmgen1,
    NULL itmgen2,
    NULL itmgen3,
    NULL itmgen4,
    NULL itmgen5,
    NULL itmgen6,
    NULL itmgen7,
    NULL itmgen8,
    NULL itmgen9,
    NULL itmgen10,
    NULL invRmk,
    NULL invStDt,
    NULL invEndDt,
    NULL oinum,
    NULL oidt,
    NULL othRefNo,
    NULL raref,
    NULL radt,
    NULL tendref,
    NULL contref,
    NULL extref,
    NULL projref,
    NULL poref,
    NULL porefdt,
    NULL payNm,
    NULL acctdet,
    NULL pay_mode,
    NULL ifsc,
    NULL payTerm,
    NULL payInstr,
    NULL crTrn,
    NULL dirDr,
    NULL crDay,
    NULL balAmt,
    NULL paidAmt,
    NULL payDueDt,
    rcta.ATTRIBUTE8 transId,
    'Job Work' subSplyTyp,
    NULL subSplyDes,
    NULL kdrefinum,
    NULL kdrefidt,
    rcta.ATTRIBUTE14 transMode,
    rcta.ATTRIBUTE13 vehTyp,
    rcta.ATTRIBUTE9 transDist,
    NULL transName,
    rcta.ATTRIBUTE12 transDocNo,
    rcta.ATTRIBUTE11 transDocDate,
    rcta.ATTRIBUTE10 vehNo,
    NULL url,
    NULL docs,
    NULL infoDtls,
    NULL omon,
    NULL odty,
    NULL oinvtyp,
    NULL octin,
    NULL sec7act,
    NULL clmrfnd,
    NULL rfndelg,
    NULL boef,
    NULL taxSch,
    NULL userIRN,
    NULL genIrn,
    NULL fy,
    NULL refnum,
    NULL pdt,
    NULL ivst,
    NULL cptycde,
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
    NULL gen21,
    NULL gen22,
    NULL gen23,
    NULL gen24,
    NULL gen25,
    NULL gen26,
    NULL gen27,
    NULL gen28,
    NULL gen29,
    NULL gen30,
    NULL genewb,
    NULL pobewb,
    NULL pobret,
    NULL tcsrt,
    NULL tcsamt,
    NULL pretcs,
    NULL expduty,
    NULL templateName,
    NULL pa,
    NULL paymode,
    NULL trid,
    NULL rapd,
    NULL mc,
-- ,jtl.EVENT_CLASS_CODE
    rcta.ORG_ID seller_org_id,
    hca.PARTY_ID buyer_org_id
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
    HZ_PARTIES hp_cust,
    (SELECT
        hrl.LOCATION_ID,
        hrl.ADDRESS_LINE_1 ADDRESS1,
        hrl.ADDRESS_LINE_2 ADDRESS2,
        hrl.LOC_INFORMATION15 CITY,
        hrl.LOC_INFORMATION16 STATE,
        hrl.POSTAL_CODE
    FROM
        HR_LOCATIONS hrl
    WHERE 1 = 1
        ) seller_dtls
WHERE 1=1
--    AND rcta.TRX_DATE BETWEEN TO_DATE(:p_from_date,'DD-MON-YYYY') AND TO_DATE(:p_to_date,'DD-MON-YYYY')
--    AND rctta.TYPE = 'CM'
--    AND rcta.TRX_NUMBER = 'CR/NMR/23-24/001'
    AND rcta.ORG_ID = hrou.ORGANIZATION_ID
    AND hrou.NAME = 'ILFS India OU'
    AND rcta.CUSTOMER_TRX_ID = rctla.CUSTOMER_TRX_ID
    AND rctla.LINE_TYPE = 'LINE'
    AND rcta.CUST_TRX_TYPE_ID = rctta.CUST_TRX_TYPE_ID
    AND rcta.ORG_ID = rctta.ORG_ID
    AND rcta.CUSTOMER_TRX_ID = jtl.TRX_ID
    AND rctla.CUSTOMER_TRX_LINE_ID = jtl.TRX_LINE_ID
    AND jtl.ENTITY_CODE = 'TRANSACTIONS'
    AND jtl.EVENT_CLASS_CODE IN ('INVOICE','CREDIT_MEMO','DEBIT_MEMO')
    AND jtl.FIRST_PARTY_PRIMARY_REG_NUM IS NOT NULL
    AND jtl.DET_FACTOR_ID = jtdf.DET_FACTOR_ID
    AND jtl.TAX_RATE_ID = jtr.TAX_RATE_ID
    AND jtr.REGIME_ID = jr.REGIME_ID
    AND rcta.BILL_TO_CUSTOMER_ID = hca.CUST_ACCOUNT_ID
    AND hca.PARTY_ID = hp_cust.PARTY_ID
    AND jtl.LOCATION_ID = seller_dtls.LOCATION_ID