from domain.ewbDatamodel import ewbDatamodel

class ClearTaxEWBwithoutIRN:

    # Generate EWB
    def EWBwithoutIRN():
        print("Inside Service Class\n")
        Header_data = ewbDatamodel.getHeaderData()
        # print("Header Data: ",Header_data)
        for row in Header_data:
            document_No = row[0]
            LineItem_data = ewbDatamodel.getLineItemData(document_No) # Get the line item data
            total_assessable_Amount = 0.00
            total_Invoice_Amount = 0.00
            cgst_amount = 0.00
            sgst_amount = 0.00
            igst_amount = 0.00
            cess_amount = 0.00
            cess_NonAdvol_amount = 0.00

            # gstIn = row[14]
            gstIn = "27AAFCD5862R013"
            payload = {
            "DocumentNumber": row[0],
            "DocumentType": row[2],
            # "DocumentDate": row[1],
            "DocumentDate": "22/04/2024",
            "SupplyType": row[3],
            "SubSupplyType": row[4],
            "SubSupplyTypeDesc": row[5],
            "TransactionType": row[6],
            "BuyerDtls": {
                "Gstin": row[7],
                "LglNm": row[8],
                "TrdNm": "",
                "Addr1": row[9],
                "Addr2": row[10],
                "Loc": row[11],
                "Pin": row[12],
                "Stcd": row[13]
            },
            "SellerDtls": {
                # "Gstin": row[14],
                "Gstin": "27AAFCD5862R013",
                "LglNm": row[15],
                "TrdNm": "",
                "Addr1": row[16],
                "Addr2": row[17],
                "Loc": row[18],
                "Pin": row[19],
                "Stcd": row[20]
            },
            "ExpShipDtls": {
                "LglNm": "",
                "Addr1": "",
                "Addr2": "",
                "Loc": "",
                "Pin": "",
                "Stcd": ""
            },
            "DispDtls": {
                # "Nm": row[21],
                # "Addr1": row[22],
                # "Addr2": row[23],
                # "Loc": row[24],
                # "Pin": row[25],
                # "Stcd": row[26]
                "Nm": "",
                "Addr1": "",
                "Addr2": "",
                "Loc": "",
                "Pin": "",
                "Stcd": ""
            },
            "ItemList": [   
            ],
            "TotalInvoiceAmount": "",
            "TotalCgstAmount": "",
            "TotalSgstAmount": "",
            "TotalIgstAmount": "",
            "TotalCessAmount": "",
            "TotalCessNonAdvolAmount": "",
            "TotalAssessableAmount": "",
            "OtherAmount": "",
            "OtherTcsAmount": "",
            "TransId": row[27],
            "TransName": row[28],
            "TransMode": row[29],
            "Distance": row[30],
            "TransDocNo": row[31],
            "TransDocDt": row[32],
            "VehNo": row[33],
            "VehType": row[34]
            }
            for items in LineItem_data:
                total_assessable_Amount += float(items[5])
                cgst_amount += float(items[7])
                sgst_amount += float(items[9])
                igst_amount += float(items[11])
                cess_amount += float(items[13])
                cess_NonAdvol_amount += float(items[15])
                total_Invoice_Amount += total_assessable_Amount + cgst_amount + sgst_amount + igst_amount + cess_amount + cess_NonAdvol_amount
                
                payload["ItemList"].append  ({
                    "ProdName": items[0],
                    "ProdDesc": items[1],
                    "HsnCd": items[2],
                    "Qty": items[3],
                    "Unit": items[4],
                    "AssAmt": items[5],
                    "CgstRt": items[6],
                    "CgstAmt": items[7],
                    "SgstRt": items[8],
                    "SgstAmt": items[9],
                    "IgstRt": items[10],
                    "IgstAmt": items[11],
                    "CesRt": items[12],
                    "CesAmt": items[13],
                    "OthChrg": items[14],
                    "CesNonAdvAmt": items[15]
            })
            payload["TotalInvoiceAmount"] = total_Invoice_Amount
            payload["TotalCgstAmount"] = cgst_amount
            payload["TotalSgstAmount"] = sgst_amount
            payload["TotalIgstAmount"] = igst_amount
            payload["TotalCessAmount"] = cess_amount
            payload["TotalCessNonAdvolAmount"] = cess_NonAdvol_amount
            payload["TotalAssessableAmount"] = total_assessable_Amount

            print("Clear Tax API Called \n")
            response = ewbDatamodel.executeClearTaxEWBapi(payload, gstIn) # Calling Clear Tax EWB API
            print("Response From Clear Tax API: ",response)
            ewbDatamodel.saveResponse(response[0], response[1])

    # Cancel E-Way Bill
    def cancelEWB():
        Header_date = ewbDatamodel.getCancelEWBHeaderData()
        for row in Header_date:
            # gstIn = row[1]
            gstIn = "27AAFCD5862R013"
            cancelEWBpayload = {
                "ewbNo": row[0],
                "cancelRsnCode": row[2],
                "cancelRmrk" : row[3]
            }
        print("Payload for Cancel EWB: \n",cancelEWBpayload)
        # Clear Tax API Called
        response = ewbDatamodel.executeCancelEWBClearTaxEWBapi(cancelEWBpayload,gstIn)
        ewbDatamodel.cancelEWBsaveResponse(response[0], response[1])

    # Update E-Way Bill
    def updateEWB():
        Header_date = ewbDatamodel.getUpdateEWBHeaderData()
        for row in Header_date:
            # gstIn = row[1]
            gstIn = "27AAFCD5862R013"
            updateEWBpayload = {
                "EwbNumber": row[0],
                "FromPlace": row[2],
                "FromState": row[3],
                "ReasonCode": row[4],
                "ReasonRemark": row[5],
                "TransDocNo": row[6],
                "TransDocDt": row[7],
                "TransMode": row[8],
                "DocumentNumber": row[9],
                "DocumentType": row[10],
                "DocumentDate": row[11],
                "VehicleType": row[12],
                "VehNo": row[13]
            }
        print("Payload for Update EWB: \n",updateEWBpayload)
        # Clear Tax API Called
        response = ewbDatamodel.executeUpdateEWBClearTaxEWBapi(updateEWBpayload,gstIn)
        # Response save in Database
        ewbDatamodel.saveResponseUpdateEWB(response[0], response[1])

   
