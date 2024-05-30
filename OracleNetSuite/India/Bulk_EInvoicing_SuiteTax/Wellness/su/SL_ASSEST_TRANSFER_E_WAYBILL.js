/**
 * @NApiVersion 2.0
 * @NScriptType Suitelet
 * @NModuleScope Public
 */
define(['N/record', 'N/runtime', 'N/search', 'N/ui/serverWidget', 'N/encode', 'N/file', "N/https", "N/url", 'N/task', 'N/redirect','N/format'],
    /**
     * @param {record} record
     * @param {runtime} runtime
     * @param {search} search
     */
    function(record, runtime, search, serverWidget, encode, file, https, url, task, redirect,format) {

        function onRequest(context) {
            try {
                var jvId = context.request.parameters.objId;
                log.debug('jvId', jvId);
                var headerObj = new Array();
                var sessionobj = runtime.getCurrentSession();
                var scriptObj = runtime.getCurrentScript();
                var userObj = runtime.getCurrentUser();
                var bulk_tax_url = scriptObj.getParameter('custscript_api_url');
                var Token_Details = '1.87b7ac42-4823-44c7-bee7-25ab14051d9f_9f52d359777bfc85385b914a309228e390c31e17cb4dd93a223b7de74095c908'

                var objJVRec = record.load({
                    type: 'journalentry',
                    id: jvId
                });
                var gstin_valText = objJVRec.getText({
                    fieldId: 'subsidiarytaxregnum'
                });
                log.debug('gstin_valText', gstin_valText);
                var match = gstin_valText.match(/[A-Z0-9]+/);

                // Extract the matched string
                var gstin_val = match ? match[0] : null;
                log.debug('gstin_val', gstin_val);
                var documentNumber = objJVRec.getValue({
                    fieldId: 'tranid'
                });
                log.debug('documentNumber', documentNumber);
                var trandate = objJVRec.getText({
                    fieldId: 'trandate'
                });
                var subsidiaryText = objJVRec.getText({
                    fieldId: 'subsidiary'
                });
                log.debug('subsidiaryText', subsidiaryText);
                log.debug('trandate', trandate);
                log.debug('trandate', trandate);
                var transport_dist = objJVRec.getValue({
                    fieldId: 'custbody_in_eway_transport_dist'
                });
                var transport_name = objJVRec.getValue({
                    fieldId: 'custbody_in_eway_transport_name'
                });
                var transport_id = objJVRec.getValue({
                    fieldId: 'custbody_in_eway_transport_id'
                });

                var vehicle_no = objJVRec.getValue({
                    fieldId: 'custbody_in_eway_vehicle_no'
                });
                var vehicle_type = objJVRec.getValue({
                    fieldId: 'custbody_in_eway_vehicle_type'
                });
                var transport_mode = objJVRec.getValue({
                    fieldId: 'custbody_in_eway_transport_mode'
                });
				var itemName =  objJVRec.getText({
                    fieldId: 'custbody_assest_item'
                });
				var itemId =  objJVRec.getValue({
                    fieldId: 'custbody_assest_item'
                });
				

				var itemHSNCodeId = objJVRec.getValue({
                    fieldId: 'custbody_assest_item_hsn_or_sac_code'
                });
				
				var objHsnRec = record.load({
					type : 'customrecord_in_gst_hsn_code_for_service',
					id : itemHSNCodeId
				});
				var itemHSNCode = objHsnRec.getValue({
					fieldId : 'custrecord_in_gst_hsn_code'
				}) 
				var sellerLocation;
				var jvAmount;
var accountingtransactionSearchObj = search.create({
   type: "accountingtransaction",
   settings:[{"name":"includeperiodendtransactions","value":"F"}],
   filters:
   [
      ["type","anyof","Journal"], 
      "AND", 
      ["bookspecifictransaction","is","T"], 
      "AND", 
      ["internalid","anyof",jvId], 
      "AND", 
      ["transaction.memo","is","Asset Transfer Out (FAM)"]
   ],
   columns:
   [
      search.createColumn({
         name: "memo",
         join: "transaction",
         label: "Memo"
      }),
      search.createColumn({
         name: "location",
         join: "transaction",
         label: "Location"
      }),
	  search.createColumn({
         name: "creditamount",
         label: "Amount (Credit)"
      })
	  
   ]
});
var searchResultCount = accountingtransactionSearchObj.runPaged().count;
log.debug("accountingtransactionSearchObj result count",searchResultCount);
accountingtransactionSearchObj.run().each(function(result){
   sellerLocation = result.getValue({
	   name: "location",
         join: "transaction"
   });
   jvAmount= result.getValue({
	    name: "creditamount"
   })
   
   return true;
});
var buyerLocation;
var accountingtransactionSearchObjBuyer = search.create({
   type: "accountingtransaction",
   settings:[{"name":"includeperiodendtransactions","value":"F"}],
   filters:
   [
      ["type","anyof","Journal"], 
      "AND", 
      ["bookspecifictransaction","is","T"], 
      "AND", 
      ["internalid","anyof",jvId], 
      "AND", 
      ["transaction.memo","is","Asset Transfer In (FAM)"]
   ],
   columns:
   [
      search.createColumn({
         name: "memo",
         join: "transaction",
         label: "Memo"
      }),
      search.createColumn({
         name: "location",
         join: "transaction",
         label: "Location"
      })
   ]
});
var searchResultCount = accountingtransactionSearchObjBuyer.runPaged().count;
log.debug("accountingtransactionSearchObjBuyer result count",searchResultCount);
accountingtransactionSearchObjBuyer.run().each(function(result){
   buyerLocation = result.getValue({
	   name: "location",
         join: "transaction"
   })
   return true;
});
var sellerName;
var sellerState;
var sellerAddress1;
var sellerAddress2;
var sellerZip;
var sellerCity;
var locationSearchObj = search.create({
   type: "location",
   filters:
   [
      ["internalid","anyof",sellerLocation]
   ],
   columns:
   [
      search.createColumn({name: "name", label: "Name"}),
      search.createColumn({name: "city", label: "City"}),
      search.createColumn({name: "state", label: "State/Province"}),
      search.createColumn({name: "address1", label: "Address 1"}),
      search.createColumn({name: "address2", label: "Address 2"}),
      search.createColumn({name: "zip", label: "Zip"})
   ]
});
var searchResultCount = locationSearchObj.runPaged().count;
log.debug("locationSearchObj result count",searchResultCount);
locationSearchObj.run().each(function(result){
   sellerName= result.getValue({
	   name: "name"
   })
   var sellerStateCode = result.getValue({
	   name: "state"
   });
   var spliting = sellerStateCode.split("-")
   sellerState = spliting[0]
   sellerAddress1 =  result.getValue({
	   name: "address1"
   });
    sellerAddress2 =  result.getValue({
	   name: "address2"
   });
   sellerZip =  result.getValue({
	   name: "zip"
   });
   sellerCity  =  result.getValue({
	   name: "city"
   });
   return true;
});
var buyerName;
var buyerState;
var buyerAddress1;
var buyerAddress2;
var buyerZip;
var buyerCity;
var locationSearchObjBuyer = search.create({
   type: "location",
   filters:
   [
      ["internalid","anyof",buyerLocation]
   ],
   columns:
   [
      search.createColumn({name: "name", label: "Name"}),
      search.createColumn({name: "city", label: "City"}),
      search.createColumn({name: "state", label: "State/Province"}),
      search.createColumn({name: "address1", label: "Address 1"}),
      search.createColumn({name: "address2", label: "Address 2"}),
      search.createColumn({name: "zip", label: "Zip"})
   ]
});
var searchResultCount = locationSearchObjBuyer.runPaged().count;
log.debug("locationSearchObjBuyer result count",searchResultCount);
locationSearchObjBuyer.run().each(function(result){
   buyerName = result.getValue({
	   name: "name"
   })
   buyerStateCode = result.getValue({
	   name: "state"
   });
   var splitingCode = buyerStateCode.split("-")
   buyerState = splitingCode[0]
   buyerAddress1 =  result.getValue({
	   name: "address1"
   });
    buyerAddress2 =  result.getValue({
	   name: "address2"
   });
   buyerZip =  result.getValue({
	   name: "zip"
   });
   buyerCity  =  result.getValue({
	   name: "city"
   });
   return true;
});




                var url_new = bulk_tax_url;

                headerObj['X-Cleartax-Auth-Token'] = Token_Details;
                headerObj['Content-Type'] = 'application/json';
                headerObj['Accept'] = 'application/json';
                headerObj['gstin'] = gstin_val;

                var jsonRequest = {
                    "DocumentNumber": documentNumber,
                    "DocumentType": "OTH",
                    "DocumentDate": trandate,
                    "SupplyType": "Outward",
                    "SubSupplyType": "OTH",
                    "SubSupplyTypeDesc": "Assest Transfer",
                    "TransactionType": "Regular",
                    "BuyerDtls": {
                        "Gstin": gstin_val,
                        "LglNm": buyerName,
                        "TrdNm": buyerName,
                        "Addr1": buyerAddress1,
                        "Addr2": buyerAddress2,
                        "Loc": buyerCity,
                        "Pin": buyerZip,
                        "Stcd": buyerState
                    },
                    "SellerDtls": {
                        "Gstin": gstin_val,
                        "LglNm": sellerName,
                        "TrdNm": sellerName,
                        "Addr1": sellerAddress1,
                        "Addr2": sellerAddress2,
                        "Loc": sellerCity,
                        "Pin": sellerZip,
                        "Stcd": sellerState
                    },
                    "ItemList": [{
                        "ProdName": itemName,
                        "ProdDesc": itemName,
                        "HsnCd": itemHSNCode,
                        "Qty": 1,
                        "Unit": "OTH",
                        "AssAmt":jvAmount,
                        "IgstRt": 0,
                        "CgstRt": 0,
                        "SgstRt": 0,
                        "IgstAmt": 0,
                        "CesRt": 0,
                        "CesAmt": 0,
                        "OthChrg": 0

                    }],
                    "TotalInvoiceAmount": jvAmount,
                    "TotalCgstAmount": 0,
                    "TotalSgstAmount": 0,
                    "TotalIgstAmount": 0,
                    "TotalCessAmount": 0,
                    "TotalCessNonAdvolAmount": 0,
                    "TotalAssessableAmount": jvAmount,
                    "OtherAmount": 0,
                    "OtherTcsAmount": 0,
                    "TransId": transport_id,
                    "TransName": transport_name,
                    "TransMode": transport_mode,
                    "Distance": transport_dist,
                    "VehNo": vehicle_no,
                    "VehType": "REGULAR"
                }
				log.debug('jsonRequest',jsonRequest);
                var response = https.put({
                    url: url_new,
                    body: JSON.stringify(jsonRequest),
                    headers: headerObj
                });
                log.debug('response', response);
                var body_data = JSON.parse(response.body);
                log.debug('json_obj values', JSON.stringify(response));
                log.debug('json_obj values body', JSON.parse(response.body));
                log.debug('json_obj values body govt_response', JSON.stringify(body_data.govt_response));

                var is_success = body_data.govt_response.Success;


                if (is_success == 'Y') {
                    var success_msg = 'Success';
                    error_msg = "";
                    var EwbNo = (body_data.govt_response.EwbNo).toString();
                    objJVRec.setValue({
                        fieldId: 'custbody_in_eway_bill_no',
                        value: EwbNo
                    });
					log.debug('body_data.govt_response.EwbDt',body_data.govt_response.EwbDt);					 
					objJVRec.setValue({ fieldId: 'custbody_eway_bill_date', value:body_data.govt_response.EwbDt});
				objJVRec.setValue({ fieldId: 'custbody_eway_bill_valid_untill', value: body_data.govt_response.EwbValidTill});
				objJVRec.setValue({ fieldId: 'custbody_eway_bill_error', value: error_msg });
				objJVRec.setValue({ fieldId: 'custbody_in_eway_export_status', value: 2 });
                   
                }
				else{
			
					objJVRec.setValue({ fieldId: 'custbody_eway_bill_error', value: JSON.stringify(body_data.govt_response.ErrorDetails) });						
					
				}
				 objJVRec.save();
                redirect.toRecord({
                    type: 'journalentry',
                    id: jvId
                });
                log.debug('response', response);


            } catch (e) {
				context.response.write(e.message);
                log.error('e,message', (e.message));
            }


        }




        return {
            onRequest: onRequest
        };

    });