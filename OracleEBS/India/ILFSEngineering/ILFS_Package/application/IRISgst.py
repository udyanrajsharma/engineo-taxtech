from domain.gstDataModel import gstDataModel

class IRISgst:
    # IRIS GSTR1
    def gstr1(from_date, to_date):
        print("Inside GSTR1 Class\n")
        Header_Gstr1_data = gstDataModel.getGstr1HeaderData(from_date, to_date)       
        sval = 0.00
        txval = 0.00
        iamt = 0.00
        camt = 0.00
        samt = 0.00
        csamt = 0.00
        adval = 0.00
        total_Amount = 0.00
        for row in Header_Gstr1_data:
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
            print("IRIS Login API Called \n")
            response = gstDataModel.executeIRISLoginAPI()
            gstDataModel.initiateGstr1FilingForInvoice(payload,invoice_id,invoice_date,return_period)
            response_gstr1 = gstDataModel.fileGSTR1Data(payload,gstIn,response[0],response[1])
            gstDataModel.finishGstr1FilingForInvoice(response_gstr1[0],response_gstr1[1],invoice_id)
            print("Gstr1 Completed for a invoice")


    def gstr1_v(from_date, to_date, created_by, request_id):
        print("Inside GSTR1 Model Class\n")
        Header_Gstr1_data = gstDataModel.getGstr1HeaderData(from_date, to_date)
        print("Header Data: \n", Header_Gstr1_data)
        print("Header Data Size: ", len(Header_Gstr1_data))
        for row in Header_Gstr1_data:

            response_payload = gstDataModel.createGstr1Paylod(row)
            print("Response from create Payload : ", response_payload)
            response_login = gstDataModel.executeIRISLoginAPI()
            gstDataModel.initiateGstr1FilingForInvoice(response_payload[0],response_payload[1],response_payload[3],response_payload[4], created_by, request_id)
            response_gstr1 = gstDataModel.fileGSTR1Data(response_payload[0],response_payload[2],response_login[0],response_login[1])
            gstDataModel.finishGstr1FilingForInvoice(response_gstr1[0],response_gstr1[1],response_payload[1])
            print("Gstr1 Completed for a invoice")

    def gstr2_v(from_date, to_date, created_by, request_id):
        print("Inside GSTR2 Model Class\n")
        Header_Gstr2_data = gstDataModel.getGstr2HeaderData(from_date, to_date)
        for row in Header_Gstr2_data:
            response_payload = gstDataModel.createGstr2Paylod(row)
            # print("Response from payload : ",response_payload)
            response_login = gstDataModel.executeIRISLoginAPI()
            gstDataModel.initiateGstr2FilingForInvoice(response_payload[0],response_payload[1],response_payload[3],response_payload[4], created_by, request_id)
            response_gstr1 = gstDataModel.fileGSTR2Data(response_payload[0],response_payload[2],response_login[0],response_login[1])
            gstDataModel.finishGstr2FilingForInvoice(response_gstr1[0],response_gstr1[1],response_payload[1])
            print("Gstr2 Completed for a invoice")


    # IRIS GSTR2
    def gstr2(from_date, to_date):
        print("Inside GSTR2 Class\n")
        Header_Gstr2_data = gstDataModel.getGstr2HeaderData(from_date, to_date)
        # line_Gstr2_data = gstDataModel.getGstr2LineItemData()
        sval = 0.00
        txval = 0.00
        iamt = 0.00
        camt = 0.00
        samt = 0.00
        csamt = 0.00
        total_Amount = 0.00
        for row in Header_Gstr2_data:
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
                    "ctin": row[9],
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
                    "num": items[0],
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
            print("IRIS Login API Called \n")
            response = gstDataModel.executeIRISLoginAPI()
            gstDataModel.initiateGstr2FilingForInvoice(payload,invoice_id,invoice_date,return_period)
            response_gstr1 = gstDataModel.fileGSTR2Data(payload,gstIn,response[0],response[1])
            gstDataModel.finishGstr2FilingForInvoice(response_gstr1[0],response_gstr1[1],invoice_id)
            print("Gstr2 Completed for a invoice")


    