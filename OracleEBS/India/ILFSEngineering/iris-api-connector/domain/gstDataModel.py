from infrastructure.ILFSdatabase import database
from infrastructure.IRISapiDetails import apiDetails

class gstDataModel:

    def executeIRISLoginAPI():
        return apiDetails.InvokeIRISLoginAPI()
    
    # GSTR1
    def getGstr1HeaderData(from_date, to_date):
        print("In Header  Data")
        return database.executeGSTR1HeaderQuery(from_date, to_date)
    
    def getGstr1LineItemData(document_No):
        return database.executeGSTR1LineQuery(document_No)
    
    def initiateGstr1FilingForInvoice(payload,invoice_id,invoice_date,return_period, created_by, request_id):
        return database.persistInsertGstr1RequestInDB(payload,invoice_id,invoice_date,return_period, created_by, request_id)
    
    def fileGSTR1Data(payload,gstIn,token,companyid):
        return apiDetails.InvokeIRIS_GSTR1_API(payload,gstIn,token,companyid)
    
    def finishGstr1FilingForInvoice(response,res_status_code,invoice_id):
        return database.persistUpdateGstr1ResponseInDB(response,res_status_code,invoice_id)
    
    def createGstr1Paylod(row):
        print("In the Create Payload")

        sval = 0.00
        txval = 0.00
        iamt = 0.00
        camt = 0.00
        samt = 0.00
        csamt = 0.00
        adval = 0.00
        invoice_id = row[0]
        line_Gstr1_data = gstDataModel.getGstr1LineItemData(invoice_id)
        # gstIn = row[25]
        gstIn = "24ABCDE9876A1ZE"
        invoice_date = row[5]
        return_period = row[26]
        payload = {
            "invoices": [
                {
                "invTyp": row[1],
                "splyTy": row[2],
                "dst": row[3],
                "refnum": row[4],
                # "pdt": "",
                "ctpy": row[6],
                "ctin": row[7],
                "cname": row[8],
                "ntNum": row[9],
                "ntDt": row[10],
                "inum": row[0],               
                "idt": str(row[5]),
                "val": row[11],
                "pos": row[12],
                "rchrg": row[13],
                "fy": row[14],
                "dty": row[15],
                "rsn": row[16],
                "pgst": row[17],
                # "prs": "N",
                "odnum": None,
                "gen2": row[18],
                "gen7": row[19],
                "gen8": row[20],
                "gen10": row[21],
                "gen11": row[22],
                "gen12": row[23],
                "gen13": row[24],
                "itemDetails": [],
                # "gstin": row[25],
                "gstin": "24ABCDE9876A1ZE",
                "fp": row[26],
                "ft": "GSTR1"
                }
            ]
        }

        count = 1
        for items in line_Gstr1_data: 
            payload["invoices"][0]["itemDetails"].append  ({
                "num": count,
                "sval": items[0],
                "ty": items[1],
                "hsnSc": items[2],
                "desc": items[3],
                "uqc": items[4],
                "qty": items[5],
                "txval": items[6],
                "irt": items[7],
                "iamt": items[8],
                "crt": items[9],
                "camt": items[10],
                "srt": items[11],
                "samt": items[12],
                "csrt": items[13],
                "csamt": items[14],
                "txp": items[15],
                "disc": items[16],
                "adval": items[17],
                "rt": items[18]
            })
            # Insert Values in Variables
            count += 1
            sval += items[0]
            txval += items[6]
            iamt += items[8]
            camt += items[10]
            samt += items[12]
            csamt += items[14]
            adval += items[17]

        total_Amount_2 = txval + iamt + camt + samt + csamt + adval
        payload["invoices"][0]["val"] = round(total_Amount_2,2)
        return payload, invoice_id, gstIn, invoice_date, return_period

 
    # GSTR2    
    def getGstr2HeaderData(from_date, to_date):
        return database.executeGSTR2HeaderQuery(from_date, to_date)
    
    def getGstr2LineItemData(document_No):
        return database.executeGSTR2LineQuery(document_No)
    
    def initiateGstr2FilingForInvoice(payload,invoice_id,invoice_date,return_period, created_by, request_id):
        return database.persistInsertGstr2RequestInDB(payload,invoice_id,invoice_date,return_period, created_by, request_id)
    
    def fileGSTR2Data(payload,gstIn,token,companyid):
        return apiDetails.InvokeIRIS_GSTR2_API(payload,gstIn,token,companyid)
    
    def finishGstr2FilingForInvoice(response,res_status_code,invoice_id):
        return database.persistUpdateGstr2ResponseInDB(response,res_status_code,invoice_id)
    
    def createGstr2Paylod(row):
        print("Inside Create Payload")
        sval = 0.00
        txval = 0.00
        iamt = 0.00
        camt = 0.00
        samt = 0.00
        csamt = 0.00
        invoice_id = row[0]
        line_Gstr2_data = gstDataModel.getGstr2LineItemData(invoice_id)
        # gstIn = row[1]
        gstIn = "24ABCDE9876A1ZE"
        invoice_date = row[10]
        return_period = row[18]
        payload = {
            "invoices": [
                {
                "fp": row[18],
                "ft": "GSTR2",
                # "gstin": row[1],
                "gstin": "24ABCDE9876A1ZE",
                "dty": row[2],
                "invTyp": row[3],
                "dst": row[4],
                "splyTy": row[5],
                "ctpy": row[6],
                "rtpy": row[7],
                "ctin": row[8],
                "cname": row[9],
                "inum": row[0], 
                "idt": str(row[10]),
                "val": row[11],
                "pos": row[12],
                "rchrg": row[13],
                "fy": row[14],
                "refnum": row[15],
                "pdt": str(row[16]),
                "cptycde": row[17],
                "gen1": row[19],
                "gen2": row[20],
                "gen3": row[21],
                "gen4": row[22],
                "gen5": row[23],
                "gen6": row[24],
                "gen7": row[25],
                "gen8": row[26],
                "gen9": row[27],
                "gen10": row[28],
                "gen11": row[29],
                "itemDetails": []
                }
            ]
        }
        count = 1
        for items in line_Gstr2_data: 
            payload["invoices"][0]["itemDetails"].append  ({
                "num": count,
                "sval": items[1],
                "ty": items[2],
                "hsnSc": items[3],
                "desc": items[4],
                "uqc": items[5],
                "qty": items[6],
                "txval": items[7],
                "rt": items[8],
                "irt": items[9],
                "iamt": items[10],
                "crt": items[11],
                "camt": items[12],
                "srt": items[13],
                "samt": items[14],
                "csrt": items[15],
                "csamt": items[16],
                "elg": items[17],
                "txI": items[18],
                "txp": items[19]
            })
            # Insert Values in Variables
            count += 1
            sval += float(items[1])
            txval += float(items[7])
            iamt += float(items[10])
            camt += float(items[12])
            samt += float(items[14])
            csamt += float(items[16])

        total_Amount_2 = txval + iamt + camt + samt + csamt
        payload["invoices"][0]["val"] = round(total_Amount_2,2)
        print("PAYLOAD :",payload)
        print("\nPayload Created")
        return payload, invoice_id, gstIn, invoice_date, return_period
    
    
    