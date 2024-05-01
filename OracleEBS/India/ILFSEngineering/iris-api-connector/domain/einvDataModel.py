from infrastructure.ILFSdatabase import database
from infrastructure.IRISapiDetails import apiDetails

class einvDataModel:

    def executeIRISLoginAPI():
        return apiDetails.InvokeIRISLoginAPI()

    # E-INVOICE
    def getEinvHeaderData():
        return database.executeEinvHeaderQuery()
    
    def getEinvLineItemData(document_No):
        return database.executeEinvHeaderQuery(document_No)
    
    def initiateEinvoiceFilingForInvoice(payload,invoice_id,invoice_date,return_period):
        return database.persistInsertEinvRequestInDB(payload,invoice_id,invoice_date,return_period)

    def fileEinvData(payload,gstIn,token,companyid):
        return apiDetails.InvokeEInvoice_IRIS_API(payload,gstIn,token,companyid)
    
    def finishEinvFilingForInvoice(response,res_status_code,invoice_id):
        return database.persistUpdateEinvResponseInDB(response,res_status_code,invoice_id)
    
    def createEinvoicePayload(row):
        print("Inside Create E-Invoice Payload")
        sval = 0.00
        txval = 0.00
        iamt = 0.00
        camt = 0.00
        samt = 0.00
        csamt = 0.00
        adval = 0.00
        invoice_id = row[0]
        line_einv_data = einvDataModel.getEinvLineItemData(invoice_id)
        # gstIn = row[28]
        gstIn = "33ABCDE9876A1ZE"
        invoice_date = row[11]
        return_period = row[29]
        payload = {
            "invoices": [
            {
                "invTyp": row[1],
                "splyTy": row[2],
                "dst": row[3],
                "refnum": row[4],
                "pdt": row[5],
                "ctpy": row[6],
                "ctin": row[7],
                "cname": row[8],
                "ntNum": row[9],
                "ntDt": row[10],
                "inum": row[0],
                "idt": str(row[11]),
                "val": row[12],
                "pos": row[13],
                "rchrg": row[14],
                "fy": row[15],
                "dty": row[16],
                "rsn": row[17],
                "pgst": row[18],
                "prs": row[19],
                "odnum": row[20],
                "gen2": row[21],
                "gen7": row[22],
                "gen8": row[23],
                "gen10": row[24],
                "gen11": row[25],
                "gen12": row[26],
                "gen13": row[27],
                "itemDetails": [
                ],
                "gstin": "33ABCDE9876A1ZE",
                # "gstin": row[28],
                "fp": row[29],
                "ft": row[30]
            }
            ]
        }
        count = 1
        for items in line_einv_data: 
            payload["invoices"][0]["itemDetails"].append  ({
                "num": "1",
                "sval": items[1],
                "ty": items[2],
                "hsnSc": items[3],
                "desc": items[4],
                "uqc": items[5],
                "qty": items[6],
                "txval": items[7],
                "irt": items[8],
                "iamt": items[9],
                "crt": items[10],
                "camt": items[11],
                "srt": items[12],
                "samt": items[13],
                "csrt": items[14],
                "csamt": items[15],
                "txp": items[16],
                "disc": items[17],
                "adval": items[18],
                "rt": items[19]
            })
            # Insert Values in Variables
            count += 1
            sval += items[1]
            txval += items[7]
            iamt += items[9]
            camt += items[11]
            samt += items[13]
            csamt += items[15]
            adval += items[18]

        total_Amount_2 = txval + iamt + camt + samt + csamt + adval
        payload["invoices"][0]["val"] = round(total_Amount_2,2)
        print("\nPayload Created")
        return payload, invoice_id, gstIn, invoice_date, return_period