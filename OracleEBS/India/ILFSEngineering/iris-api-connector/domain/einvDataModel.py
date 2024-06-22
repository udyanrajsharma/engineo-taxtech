from infrastructure.ILFSdatabase import database
from infrastructure.IRISapiDetails import apiDetails
import logging

servicelogger_info = logging.getLogger("IRISEWBServiceInfoLogger")
servicelogger_error = logging.getLogger("IRISEWBServiceErrorLogger")

class einvDataModel:

    def executeIRISLoginAPI():
        return apiDetails.InvokeIRISEinvLoginAPI()

    # E-INVOICE
    # E-Inv Only Prj
    def getEinvHeaderData(from_date, to_date, trx_no, gstin_state, customer_Gstin, request_id):
        return database.executeEinvHeaderQuery(from_date, to_date, trx_no, gstin_state, customer_Gstin, request_id)
    
    def testgetEinvHeaderData(from_date, to_date, trx_no):
        return database.testexecuteEinvHeaderQuery(from_date, to_date, trx_no)
    
    def testInvoiceGenerated(from_date, to_date, trx_no):
        return database.testinvoicelogrecord(from_date, to_date, trx_no)
    
    def getEinvLineItem1Data(document_No):
        return database.executeEinvLine1Query(document_No)
    
    def getEinvLineItem2Data(document_No):
        return database.executeEinvLine2Query(document_No)
    
    def getEinvLineItem3Data(document_No):
        return database.executeEinvLine3Query(document_No)
    
    def getEinvLineItem4Data(document_No):
        return database.executeEinvLine4Query(document_No)
    
    # Stock Transfer E-Inv 
    def getEinvStockTransferHeaderData(from_date, to_date, trx_no, gstin_state, customer_Gstin, request_id):
        return database.executeEinvStockTransferHeaderQuery(from_date, to_date, trx_no, gstin_state, customer_Gstin, request_id)
    
    def getEinvStockTransferLineItem1Data(document_No):
        return database.executeEinvStockTransferLine1Query(document_No)
    
    def getEinvStockTransferLineItem2Data(document_No):
        return database.executeEinvStockTransferLine2Query(document_No)
    
    def getEinvStockTransferLineItem3Data(document_No):
        return database.executeEinvStockTransferLine3Query(document_No)
    
    def getEinvStockTransferLineItem4Data(document_No):
        return database.executeEinvStockTransferLine4Query(document_No)
    
    def initiateEinvoicingProcess(payload,invoice_id,invoice_date, created_by, request_id):
        return database.persistInsertEinvRequestInDB(payload,invoice_id,invoice_date, created_by, request_id)
    

    def performEinvoicing(payload,gstIn,token,companyid):
        return apiDetails.InvokeEInvoice_IRIS_API(payload,gstIn,token,companyid)
    
    def finishEinvoicingProcess(response, res_status_code, invoice_id, gstin, token, companyid, request_id, einv_template):
        return database.persistUpdateEinvResponseInDB(response, res_status_code, invoice_id, gstin, token, companyid, request_id, einv_template)
    
    def finishEinvoicingStockTransferProcess(response, res_status_code, invoice_id, gstin, token, companyid, request_id, einv_template):
        return database.persistUpdateEinvStockTransforResponseInDB(response, res_status_code, invoice_id, gstin, token, companyid, request_id, einv_template)
    
    def initiateGeneratedEinvoiceProcess(invoice_id, invoice_date, created_by, request_id):
        return database.persistInsertEinvGeneratedInDB(invoice_id, invoice_date, created_by, request_id)

    def createEinvoicePrjPayload(row):
        try:
            print("Creation of E-Invoice Payload")
            sval = 0.00
            txval = 0.00
            iamt = 0.00
            camt = 0.00
            samt = 0.00
            csamt = 0.00
            invoice_id = row[0]
            line_einv_data_1 = einvDataModel.getEinvLineItem1Data(invoice_id)
            invOthDocDtls = einvDataModel.getEinvLineItem2Data(invoice_id)
            invRefContDtls = einvDataModel.getEinvLineItem3Data(invoice_id)
            invRefPreDtls = einvDataModel.getEinvLineItem4Data(invoice_id)
            gstIn = row[1]
            # gstIn = "24AAACI9260R002"
            invoice_date = row[9]
            
            payload = {
                "userGstin": row[1],
                # "userGstin": "24AAACI9260R002",
                "pobCode": row[2],
                # "pobCode": None,
                "supplyType": row[3],
                "ntr": row[4],
                "docType": row[5],
                "catg": row[6],
                "dst": row[7],
                "trnTyp": row[8],
                "no": row[0],
                "dt": row[9],
                "refinum": row[153],
                # "refidt": row[11], Not in Use
                "pos": row[10],
                "diffprcnt": row[11],
                "etin": row[12],
                "rchrg": row[13],
                "sgstin": row[14],
                "strdNm": row[15],
                "slglNm": row[16],
                "sbnm": row[154],
                "sflno": row[155],
                "sloc": row[156],
                "sdst": row[157],
                "sstcd": row[17],
                "spin": row[152],
                "sph": None,
                "sem": None,
                "bgstin": row[20],
                "btrdNm": row[21],
                "blglNm": row[22],
                "bbnm": row[23],
                "bflno": row[24],
                "bloc": row[25],
                "bdst": row[26],
                "bstcd": row[27],
                "bpin": row[28],
                "bph": row[29],
                "bem": row[30],
                "dgstin": row[31],
                "dtrdNm": row[32],
                "dlglNm": row[33],
                "dbnm": row[34],
                "dflno": row[35],
                "dloc": row[36],
                "ddst": row[37],
                "dstcd": row[38],
                "dpin": row[39],
                "dph": row[40],
                "dem": row[41],
                "togstin": row[42],
                "totrdNm": row[43],
                "tolglNm": row[44],
                "tobnm": row[45],
                "toflno": row[46],
                "toloc": row[47],
                "todst": row[48],
                "tostcd": row[49],
                "topin": row[50],
                "toph": row[51],
                "toem": row[52],
                "sbnum": row[53],
                "sbdt": row[54],
                "port": row[55],
                "expduty": row[56],
                "cntcd": row[57],
                "forCur": row[58],
                "invForCur": row[59],
                "taxSch": "GST",
                "totinvval": row[61],
                "totdisc": row[62],
                "totfrt": row[63],
                "totins": row[64],
                "totpkg": row[65],
                "totothchrg": row[66],
                "tottxval": row[67],
                "totiamt": row[68],
                "totcamt": row[69],
                "totsamt": row[70],
                "totcsamt": row[71],
                "totstcsamt": row[72],
                "rndOffAmt": row[73],
                "sec7act": row[74],
                "invStDt": row[75],
                "invEndDt": row[76],
                "invRmk": row[77],
                "omon": row[78],
                "odty": row[79],
                "oinvtyp": row[80],
                "octin": row[81],
                "userIRN": row[82],
                "payNm": row[83],
                "acctdet": row[84],
                "pa":row[85],
                "ifsc": row[86],
                "payTerm": row[87],
                "payInstr": row[88],
                "crTrn": row[89],
                "dirDr": row[90],
                "crDay": row[91],
                "balAmt": row[92],
                "paidAmt": row[93],
                "payDueDt": row[94],
                "transId": row[95],
                "subSplyTyp": row[96],
                "subSplyDes": row[97],
                "kdrefinum": row[98],
                "kdrefidt": row[99],
                "transMode": row[100],
                "vehTyp": row[101],
                "transDist": row[102],
                "transName": row[103],
                "transDocNo": row[104],
                "transDocDate": row[105],
                "vehNo": row[106],
                "clmrfnd": None,
                "rfndelg": row[108],
                "boef": row[109],
                "fy": row[110],
                "refnum": row[111],
                "pdt": row[112],
                "ivst": row[113],
                "cptycde": row[114],
                "gen1": row[115],
                "gen2": row[116],
                "gen3": row[117],
                "gen4": row[118],
                "gen5": row[119],
                "gen6": row[120],
                "gen7": row[121],
                "gen8": row[122],
                "gen9": row[123],
                "gen10": row[124],
                "gen11": row[125],
                "gen12": row[126],
                "gen13": row[127],
                "gen14": row[128],
                "gen15": row[129],
                "gen16": row[130],
                "gen17": row[131],
                "gen18": row[132],
                "gen19": row[133],
                "gen20": row[134],
                "gen21": row[135],
                "gen22": row[136],
                "gen23": row[137],
                "gen24": row[138],
                "gen25": row[139],
                "gen26": row[140],
                "gen27": row[141],
                "gen28": row[142],
                "gen29": row[143],
                "gen30": row[144],
                "pobewb": row[145],
                "pobret": row[146],
                "tcsrt": row[147],
                "tcsamt": row[148],
                "pretcs": row[149],
                # "genIrn": row[150],
                "genIrn": "true",
                "genewb": "N",
                # "signedDataReq": row[159],
                "itemList": [],
                "invOthDocDtls": [],
                "invRefContDtls": [],
                "invRefPreDtls": []
            }

            count = 1
            iamt2 = 0
            camt2 = 0
            samt2 = 0
            csamt2 = 0
            txval_2 = 0
            for item1 in line_einv_data_1: 
                iamt2 = float(item1[13])
                camt2 = float(item1[4])
                samt2 = float(item1[37])
                csamt2 = float(item1[8])
                txval_2 = float(item1[43])
                total_amount = iamt2 + camt2 + samt2 +  csamt2 + txval_2
                payload["itemList"].append  ({
                    "barcde": item1[0],
                    "bchExpDt": item1[1],
                    "bchWrDt": item1[2],
                    "bchnm": item1[3],
                    "camt": item1[4],
                    "cesNonAdval": item1[5],
                    "stCesNonAdvl": item1[6],
                    "crt": item1[7],
                    "csamt": item1[8],
                    "csrt": item1[9],
                    "disc": item1[10],
                    "freeQty": item1[11],
                    "hsnCd": item1[12],
                    "iamt": item1[13],
                    "irt": item1[14],
                    "isServc": item1[15],
                    "itmgen1": item1[16],
                    "itmgen2": item1[17],
                    "itmgen3": item1[18],
                    "itmgen4": item1[19],
                    "itmgen5": item1[20],
                    "itmgen6": item1[21],
                    "itmgen7": item1[22],
                    "itmgen8": item1[23],
                    "itmgen9": item1[24],
                    "itmgen10": item1[25],
                    "itmVal": round(total_amount, 2),
                    "num": count,
                    "ordLineRef": item1[28],
                    "orgCntry": item1[29],
                    "othchrg": item1[30],
                    "prdDesc": item1[31],
                    "prdNm": item1[32],
                    "prdSlNo": item1[33],
                    "preTaxVal": item1[34],
                    "qty": item1[35],
                    "rt": item1[36],
                    "samt": item1[37],
                    "srt": item1[38],
                    "stcsamt": item1[39],
                    "stcsrt": item1[40],
                    "sval": item1[41],
                    "txp": item1[42],
                    "txval": item1[43],
                    "unit": item1[44],
                    "unitPrice": item1[45],
                    "invItmOtherDtls": [{
                        "attNm": None,
                        "attVal": None
                        }]
                })
                count +=1
                # Insert Values in Variables
                sval += float(item1[41])
                txval += float(item1[43])
                iamt += float(item1[13])
                camt += float(item1[4])
                samt += float(item1[37])
                csamt += float(item1[8])

            for item2 in invOthDocDtls:
                payload["invOthDocDtls"].append  ({
                    "url": item2[0],
                    "docs": item2[1],
                    "infoDtls": item2[2]
                })
            for item3 in invRefContDtls:
                payload["invRefContDtls"].append  ({
                    "raref": item3[0],
                    "radt": item3[1],
                    "tendref": item3[2],
                    "contref": item3[3],
                    "extref": item3[4],
                    "projref": item3[5],
                    "poref": item3[6],
                    "porefdt": item3[7]
                })
            for item4 in invRefPreDtls:
                payload["invRefPreDtls"].append  ({
                    "oinum": item4[0],
                    "oidt": item4[1],
                    "othRefNo": item4[2]
                })

            total_iamt = iamt
            total_camt = camt
            total_samt = samt
            total_csamt = csamt
            total_txval = txval
            payload["totiamt"] = round(total_iamt,2)
            payload["totcamt"] = round(total_camt,2)
            payload["totsamt"] = round(total_samt,2)
            payload["totcsamt"] = round(total_csamt,2)
            payload["tottxval"] = round(total_txval,2)
            total_Amount_2 = txval + iamt + camt + samt + csamt
            payload["totinvval"] = round(total_Amount_2,2)
            print("\nPayload Created", payload)
            servicelogger_info.info(f"Payload created for Invoice No: {row[0]}")
            return payload, invoice_id, gstIn, invoice_date
        except Exception as e:
            servicelogger_error.exception(f"Exception occured in creating payload for Invoice No: {row[0]}")
        
    # Stock Transfer E-Invoice Payload 
    def createEinvoiceStockTransferPayload(row):
        try:
            print("Creation of E-Invoice Stock Transfer Payload")
            sval = 0.00
            txval = 0.00
            iamt = 0.00
            camt = 0.00
            samt = 0.00
            csamt = 0.00
            invoice_id = row[0]
            line_einv_data_1 = einvDataModel.getEinvStockTransferLineItem1Data(invoice_id)
            invOthDocDtls = einvDataModel.getEinvStockTransferLineItem2Data(invoice_id)
            invRefContDtls = einvDataModel.getEinvStockTransferLineItem3Data(invoice_id)
            invRefPreDtls = einvDataModel.getEinvStockTransferLineItem4Data(invoice_id)
            gstIn = row[1]
            # gstIn = "24AAACI9260R002"
            invoice_date = row[9]
            
            payload = {
                "userGstin": row[1],
                # "userGstin": "24AAACI9260R002",
                "pobCode": row[2],
                # "pobCode": None,
                "supplyType": row[3],
                "ntr": row[4],
                "docType": row[5],
                "catg": row[6],
                "dst": row[7],
                "trnTyp": row[8],
                "no": row[0],
                "dt": row[9],
                "refinum": row[153],
                # "refidt": row[11], Not in Use
                "pos": row[10],
                "diffprcnt": row[11],
                "etin": row[12],
                "rchrg": row[13],
                "sgstin": row[14],
                # "sgstin": "24AAACI9260R002",
                "strdNm": row[15],
                "slglNm": row[16],
                "sbnm": row[154],
                "sflno": row[155],
                "sloc": row[156],
                "sdst": row[157],
                "sstcd": row[17],
                # "sstcd": "24",
                "spin": row[152],
                # "spin": "320008",
                "sph": None,
                "sem": None,
                "bgstin": row[20],
                "btrdNm": row[21],
                "blglNm": row[22],
                "bbnm": row[23],
                "bflno": row[24],
                "bloc": row[25],
                "bdst": row[26],
                "bstcd": row[27],
                "bpin": row[28],
                # "bpin": "380006",
                "bph": row[29],
                "bem": row[30],
                "dgstin": row[31],
                "dtrdNm": row[32],
                "dlglNm": row[33],
                "dbnm": row[34],
                "dflno": row[35],
                "dloc": row[36],
                "ddst": row[37],
                "dstcd": row[38],
                "dpin": row[39],
                "dph": row[40],
                "dem": row[41],
                "togstin": row[42],
                "totrdNm": row[43],
                "tolglNm": row[44],
                "tobnm": row[45],
                "toflno": row[46],
                "toloc": row[47],
                "todst": row[48],
                "tostcd": row[49],
                "topin": row[50],
                "toph": row[51],
                "toem": row[52],
                "sbnum": row[53],
                "sbdt": row[54],
                "port": row[55],
                "expduty": row[56],
                "cntcd": row[57],
                "forCur": row[58],
                "invForCur": row[59],
                # "taxSch": row[60],
                "taxSch": "GST",
                "totinvval": row[61],
                "totdisc": row[62],
                "totfrt": row[63],
                "totins": row[64],
                "totpkg": row[65],
                "totothchrg": row[66],
                "tottxval": row[67],
                "totiamt": row[68],
                "totcamt": row[69],
                "totsamt": row[70],
                "totcsamt": row[71],
                "totstcsamt": row[72],
                "rndOffAmt": row[73],
                "sec7act": row[74],
                "invStDt": row[75],
                "invEndDt": row[76],
                "invRmk": row[77],
                "omon": row[78],
                "odty": row[79],
                "oinvtyp": row[80],
                "octin": row[81],
                "userIRN": row[82],
                "payNm": row[83],
                "acctdet": row[84],
                "pa":row[85],
                "ifsc": row[86],
                "payTerm": row[87],
                "payInstr": row[88],
                "crTrn": row[89],
                "dirDr": row[90],
                "crDay": row[91],
                "balAmt": row[92],
                "paidAmt": row[93],
                "payDueDt": row[94],
                "transId": row[95],
                "subSplyTyp": row[96],
                "subSplyDes": row[97],
                "kdrefinum": row[98],
                "kdrefidt": row[99],
                "transMode": row[100],
                "vehTyp": row[101],
                "transDist": row[102],
                "transName": row[103],
                "transDocNo": row[104],
                "transDocDate": row[105],
                "vehNo": row[106],
                "clmrfnd": None,
                "rfndelg": row[108],
                "boef": row[109],
                "fy": row[110],
                "refnum": row[111],
                "pdt": row[112],
                "ivst": row[113],
                "cptycde": row[114],
                "gen1": row[115],
                "gen2": row[116],
                "gen3": row[117],
                "gen4": row[118],
                "gen5": row[119],
                "gen6": row[120],
                "gen7": row[121],
                "gen8": row[122],
                "gen9": row[123],
                "gen10": row[124],
                "gen11": row[125],
                "gen12": row[126],
                "gen13": row[127],
                "gen14": row[128],
                "gen15": row[129],
                "gen16": row[130],
                "gen17": row[131],
                "gen18": row[132],
                "gen19": row[133],
                "gen20": row[134],
                "gen21": row[135],
                "gen22": row[136],
                "gen23": row[137],
                "gen24": row[138],
                "gen25": row[139],
                "gen26": row[140],
                "gen27": row[141],
                "gen28": row[142],
                "gen29": row[143],
                "gen30": row[144],
                "pobewb": row[145],
                "pobret": row[146],
                "tcsrt": row[147],
                "tcsamt": row[148],
                "pretcs": row[149],
                # "genIrn": row[150],
                "genIrn": "true",
                "genewb": "Y",
                # "signedDataReq": row[159],
                "itemList": [],
                "invOthDocDtls": [],
                "invRefContDtls": [],
                "invRefPreDtls": []
            }       
            count = 1
            iamt2 = 0.00
            camt2 = 0.00
            samt2 = 0.00
            csamt2 = 0.00
            txval_2 = 0.00
            for item1 in line_einv_data_1: 
                iamt2 = float(item1[13])
                camt2 = float(item1[4])
                samt2 = float(item1[37])
                csamt2 = float(item1[8])
                txval_2 = float(item1[43])
                total_amount = iamt2 + camt2 + samt2 +  csamt2 + txval_2
                payload["itemList"].append  ({
                    "barcde": item1[0],
                    "bchExpDt": item1[1],
                    "bchWrDt": item1[2],
                    "bchnm": item1[3],
                    "camt": item1[4],
                    "cesNonAdval": item1[5],
                    "stCesNonAdvl": item1[6],
                    "crt": item1[7],
                    "csamt": item1[8],
                    "csrt": item1[9],
                    "disc": item1[10],
                    "freeQty": item1[11],
                    "hsnCd": item1[12],
                    "iamt": item1[13],
                    "irt": item1[14],
                    "isServc": "N",
                    "itmgen1": item1[16],
                    "itmgen2": item1[17],
                    "itmgen3": item1[18],
                    "itmgen4": item1[19],
                    "itmgen5": item1[20],
                    "itmgen6": item1[21],
                    "itmgen7": item1[22],
                    "itmgen8": item1[23],
                    "itmgen9": item1[24],
                    "itmgen10": item1[25],
                    "itmVal": round(total_amount, 2),
                    "num": count,
                    "ordLineRef": item1[28],
                    "orgCntry": item1[29],
                    "othchrg": item1[30],
                    "prdDesc": item1[31],
                    "prdNm": item1[32],
                    "prdSlNo": item1[33],
                    "preTaxVal": item1[34],
                    "qty": item1[35],
                    "rt": item1[36],
                    "samt": item1[37],
                    "srt": item1[38],
                    "stcsamt": item1[39],
                    "stcsrt": item1[40],
                    "sval": item1[41],
                    "txp": item1[42],
                    "txval": item1[43],
                    "unit": item1[44],
                    "unitPrice": item1[45],
                    "invItmOtherDtls": [{
                        "attNm": None,
                        "attVal": None
                    }]
                })
                count +=1
                # Insert Values in Variables
                sval += float(item1[41])
                txval += float(item1[43])
                iamt += float(item1[13])
                camt += float(item1[4])
                samt += float(item1[37])
                csamt += float(item1[8])

            for item2 in invOthDocDtls:
                payload["invOthDocDtls"].append  ({
                    "url": item2[0],
                    "docs": item2[1],
                    "infoDtls": item2[2]
                })
            for item3 in invRefContDtls:
                payload["invRefContDtls"].append  ({
                    "raref": item3[0],
                    "radt": item3[1],
                    "tendref": item3[2],
                    "contref": item3[3],
                    "extref": item3[4],
                    "projref": item3[5],
                    "poref": item3[6],
                    "porefdt": item3[7]
                })
            for item4 in invRefPreDtls:
                payload["invRefPreDtls"].append  ({
                    "oinum": item4[0],
                    "oidt": item4[1],
                    "othRefNo": item4[2]
                })
            total_iamt = iamt
            total_camt = camt
            total_samt = samt
            total_csamt = csamt
            total_txval = txval
            payload["totiamt"] = round(total_iamt,2)
            payload["totcamt"] = round(total_camt,2)
            payload["totsamt"] = round(total_samt,2)
            payload["totcsamt"] = round(total_csamt,2)
            payload["tottxval"] = round(total_txval,2)
            total_Amount_2 = txval + iamt + camt + samt + csamt
            payload["totinvval"] = round(total_Amount_2,2)
            # print("\nPayload Created", payload)
            servicelogger_info.info(f"Payload created for Invoice No: {row[0]}")
            return payload, invoice_id, gstIn, invoice_date
        except Exception as e:
            servicelogger_error.exception(f"Exception occured in creating Stock transfer payload for Invoice No: {row[0]}")

    # CANCEL IRN
    def getCancelirnQuery(invoice_id):
        return database.CancelInvoiceQuery(invoice_id)
    
    def iniateCancelIrnProcess(payload, invoice_id, invoice_date, created_by, request_id):
        return database.persistInsertCancelIrnRequestInDB(payload, invoice_id, invoice_date, created_by, request_id)
    
    def performCancelIrn(companyId,token,payload):
        return apiDetails.InvokecancelIrn(companyId,token,payload)
    
    def finishCancelIrnProcess(response, res_status_code, invoice_id, request_id, iris_id, companyId, token):
        return database.persistUpdateCancelIrnResponseInDB(response, res_status_code, invoice_id, request_id, iris_id, companyId, token)

    # Cancel IRN Payload
    def cancelIRNpayload(irn, userGstin, cancel_reason, cancel_remark):
        try:
            payload = {
                "irn": irn,
                "cnlRsn": cancel_reason,
                "cnlRem": cancel_remark,
                "userGstin": userGstin
            }
            servicelogger_info.info("Payload creted for Cancel Invoice")
            return payload
        except Exception as e:
            servicelogger_error.exception(f"Exception occured in creating payload for Cancel Invoice ")
    
    # Cancel EWB
    def performCancelEwb(companyId,token,payload):
        return apiDetails.InvokecancelEWB(companyId,token,payload)

    # Cancel EWB Payload
    def cancelEWBpayload(ewbNo, userGstin):
        payload = {
            "ewbNo": ewbNo,
            "cnlRsn": "2",
            "cnlRem": "Cancelled the order",
            "userGstin": userGstin
        }
        servicelogger_info.info(f"Payload creted for cancel E-Way Bill No: {ewbNo}")
        return payload
    
    # generate EWB Non-IRN
    def ewbNonIRNpayload(row):
        try:
            print("Creation of E-Way Bill Payload ")
            documentNo = row[0]
            ewblineItem = einvDataModel.getEwbLineItemData(documentNo)
            txval = 0.00
            samt = 0.00
            camt = 0.00
            iamt = 0.00
            csamt = 0.00
            transDate = row[27]
            transDocDate = transDate.replace("-", "/")
            payload = {
                "supplyType": row[1],
                "subSupplyType": row[2],
                "docType": row[3],
                "docNo": row[0],
                "invType": row[4],
                "docDate": row[5],
                "transactionType": row[6],
                "referencInum": None,
                "referenceIdt": None,
                # "fromGstin": row[7],
                "fromGstin": "05AAAAU1183B1Z0",
                "fromTrdName": row[8],
                "dispatchFromGstin": row[9],
                "dispatchFromTradeName": row[10],
                "fromAddr1": row[11],
                "fromAddr2": row[12],
                "fromPlace": row[13],
                # "fromStateCode": row[14],
                "fromStateCode": "05",
                # "fromPincode": row[15],
                "fromPincode": "248001",
                # "toGstin": row[16],
                "toGstin": "08ACSPJ8289N1ZE",
                "toTrdName": row[17],
                "shipToGstin": row[18],
                "shipToTradeName": row[19],
                "toAddr1": row[20],
                "toAddr2": row[21],
                "toPlace": row[22],
                # "toPincode": row[23],
                "toPincode": "302001",
                # "toStateCode": row[24],
                "toStateCode": "08",
                "totInvValue": "",
                "totalValue": "",
                "cgstValue": "",
                "sgstValue": "",
                "igstValue": "",
                "cessValue": "",
                "cessNonAdvolValue": "",
                "otherValue": None,
                "transMode": row[25],
                "transDistance": row[26],
                "transDocDate": row[27],
                "transDocDate": transDocDate,
                # "transDocNo": row[28],
                "transporterId": row[29],
                "transporterName": row[30],
                "vehicleNo": row[31],
                "actFromStateCode": None,
                "actToStateCode": None,
                "vehicleType": row[32],
                "itemList": [   
                ],
                "companyId": None,
                "userGstin": "05AAAAU1183B1Z0",
                # "userGstin": row[33],
                "forceDuplicateCheck": None
                }
            
            for item in ewblineItem:
                payload["itemList"].append  ({
                    "productName": item[0],
                    "productDesc": item[1],
                    "hsnCode": item[2],
                    "quantity": item[3],
                    "qtyUnit": None,
                    "taxableAmount": item[4],
                    "sgstRate": item[5],
                    "cgstRate": item[6],
                    "igstRate": item[7],
                    "cessRate": item[8],
                    "cessNonAdvol": item[13],
                    "txp": item[14]
                })
                txval += float(item[4])
                samt += float(item[9])
                camt += float(item[10])
                iamt += float(item[11])
                csamt += float(item[12])   

            tot_txval = txval
            tot_samt = samt
            tot_camt = camt
            tot_iamt = iamt
            tot_csamt = csamt
            tot_Invval = tot_txval + tot_samt + tot_camt + tot_iamt + tot_csamt 
            payload["totInvValue"] = round(tot_Invval,2)
            payload["totalValue"] = round(tot_txval,2)
            payload["cgstValue"] = round(tot_camt,2)
            payload["sgstValue"] = round(tot_samt,2)
            payload["igstValue"] = round(tot_iamt,2)
            payload["cessValue"] = round(tot_csamt,2)
            servicelogger_info.info(f"Payload creted for E-Way Bill No: {row[0]}")
            print(f"Payload creted for E-Way Bill No: {row[0]}")
            return payload
        except Exception as e:
            servicelogger_info.exception(f"Exception Occured during payload creadtion for E-Way Bill for Document No: {row[0]}")

    # E-Way Bill   
    def executeIRISTopazLoginAPI():
        return apiDetails.InvokeIRISEwbLoginAPI()

    def getEwbHeaderData(document_No):
        return database.executeEwbHeaderQuery(document_No)
    
    def getEwbLineItemData(document_No):
        return database.executeEwbLineQuery(document_No)
    
    def performEwbnonIrn(companyId,token,payload):
        return apiDetails.InvokeEwbNonIrn(companyId,token,payload)
    
    def initiateEwbProcess(payload, doc_no, createdBy, requestId, docDate):
        return database.persistInsertEWBRequestInDB(payload, doc_no, createdBy, requestId, docDate)
    
    def finishEwbNonIrnProcess(response_data, res_status_code, invoice_id, companyid, token, request_id):
        return database.persistUpdateEWBResponseInDB(response_data, res_status_code, invoice_id, companyid, token, request_id)