from domain.ewbDatamodel import ewbDatamodel
import logging

servicelogger_info = logging.getLogger("ClearTaxEWBServiceLogger")
servicelogger_error = logging.getLogger("ClearTaxEWBErrorLogger")

class ClearTaxEWBwithoutIRN:

    # Generate EWB
    def EWBwithoutIRN():
        try:
            Header_data = ewbDatamodel.getHeaderData()
            for row in Header_data:
                try:
                    documentNo = row[0]
                    ewbPayload = ewbDatamodel.preparedEWBNonIRNpayload(row)
                    # Clear Tax API Called
                    response = ewbDatamodel.executeClearTaxEWBapi(ewbPayload[0], ewbPayload[1]) 
                    ewbDatamodel.saveResponse(response[0], response[1], ewbPayload[0], ewbPayload[1])
                except Exception as e:
                    message = str(e)
                    ewbDatamodel.payloadCreationEWBNonIRNexceptionFailureResponse(documentNo, message)
                    servicelogger_error.exception(f"\nException Occured in Payload Creation for generate EWB for Document No: {documentNo}\n ")  
        except Exception as e:
            servicelogger_error.exception("\nException Occured during EWB Without IRN Method:\n ")

    # Cancel E-Way Bill
    def cancelEWB():
        try:
            Header_data = ewbDatamodel.getCancelEWBHeaderData()
            for row in Header_data:
                try:
                    ewbNo = row[0]
                    cancelEwbpayload = ewbDatamodel.preparedCancelEWBpayload(row)
                    # Clear Tax API Called
                    response = ewbDatamodel.executeCancelEWBClearTaxEWBapi(cancelEwbpayload[0], cancelEwbpayload[1])
                    ewbDatamodel.cancelEWBsaveResponse(response[0], response[1], cancelEwbpayload[0], cancelEwbpayload[2])
                except Exception as e:
                    message = str(e)
                    ewbDatamodel.payloadCreationCancelEWBNonIRNexceptionFailureResponse(ewbNo, message)
                    servicelogger_error.exception(f"\nException Occured in Payload Creation for Cancel EWB for EWB No: {cancelEwbpayload[2]}\n ")
        except Exception as e:
            servicelogger_error.exception("\nException Occured in Payload Creation for Cancel EWB :\n ")

    # Update E-Way Bill
    def updateEWB():
        try:
            Header_date = ewbDatamodel.getUpdateEWBHeaderData()
            for row in Header_date:
                try:
                    ewbNo = row[0]
                    updateEWBpayload = ewbDatamodel.preparedUpdateEWbPayload(row)
                    # Clear Tax API Called
                    response = ewbDatamodel.executeUpdateEWBClearTaxEWBapi(updateEWBpayload[0], updateEWBpayload[1])
                    ewbDatamodel.saveResponseUpdateEWB(response[0], response[1], updateEWBpayload[0], updateEWBpayload[2], updateEWBpayload[1], updateEWBpayload[3])
                except Exception as e:
                    message = str(e)
                    ewbDatamodel.payloadCreationUpdateEWBNonIRNexceptionFailureResponse(ewbNo, message)
                    servicelogger_error.exception(f"\nException Occured in Payload Creation for Update EWB for EWB No: {updateEWBpayload[2]}\n ")
        except Exception as e:
            servicelogger_error.exception("\nException Occured in Payload Creation for update EWB :\n ")

