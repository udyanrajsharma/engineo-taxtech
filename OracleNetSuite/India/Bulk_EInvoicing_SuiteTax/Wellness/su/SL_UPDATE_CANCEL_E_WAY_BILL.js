/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope Public
 */
define(['N/record', 'N/runtime', 'N/search', 'N/ui/serverWidget', 'N/encode', 'N/file', "N/https", "N/url", 'N/task','N/ui/message'],
    /**
     * @param {record} record
     * @param {runtime} runtime
     * @param {search} search
     */
    function(record, runtime, search, serverWidget, encode, file, https, url, task,message) {

        var itemDetailsMapObject = {};
        /**
         * Definition of the Suitelet script trigger point.
         *
         * @param {Object} context
         * @param {ServerRequest} context.request - Encapsulation of the incoming request
         * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
         * @Since 2015.2
         */
        function onRequest(context) {
            var request = context.request;
            var response = context.response;

            if (request.method == 'GET') {

                var Form = serverWidget.createForm({
                    title: 'Cancel/Update E-Way Bill',
                    hideNavBar: true
                });
                Form.clientScriptModulePath = 'SuiteScripts/CS_CANCEL_UPDATE_E_WAY_BILL.js';
                var update_cancelOption = Form.addField({
                    id: 'custpage_update_cancel_reason',
                    type: serverWidget.FieldType.SELECT,
                    label: 'Update/Cancel'

                });
                update_cancelOption.addSelectOption({
                    value: '',
                    text: 'Select'
                });
                update_cancelOption.addSelectOption({
                    value: '1',
                    text: 'Cancel'
                });
                update_cancelOption.addSelectOption({
                    value: '2',
                    text: 'Update'
                });
                var inv_data = GetInvoiceToCancel();
                var select_invoice_cancel = Form.addField({
                    id: 'custpage_select_invoice',
                    type: serverWidget.FieldType.SELECT,
                    label: 'Cancel E-way Transaction#'

                });

                select_invoice_cancel.addSelectOption({
                    value: '',
                    text: 'Select'
                });
                for (var k = 0; k < inv_data.length; k++) {
                    var internalid = inv_data[k].recId;
                    var tranid = inv_data[k].documentNumber;
                    select_invoice_cancel.addSelectOption({
                        value: internalid,
                        text: tranid
                    });
                }
                var select_invoice_update = Form.addField({
                    id: 'custpage_select_invoice_update',
                    type: serverWidget.FieldType.SELECT,
                    label: 'Update E-way Transaction#'
                });
				select_invoice_update.addSelectOption({
                    value: '',
                    text: 'Select'
                });
				 var updateapi = updateApiData();
				 for (var count = 0; count < updateapi.length; count++) {
                    var internalid = updateapi[count].recId;
                    var tranid = updateapi[count].documentNumber;
                    select_invoice_update.addSelectOption({
                        value: internalid,
                        text: tranid
                    });
                }
                var updateApi = Form.addField({
                    id: 'custpage_update_api',
                    type: serverWidget.FieldType.SELECT,
                    label: 'Update Method'
                });
                updateApi.addSelectOption({
                    value: '',
                    text: 'Select'
                });
                updateApi.addSelectOption({
                    value: '1',
                    text: 'Update E-Waybill Transporter ID'
                });
             
                updateApi.addSelectOption({
                    value: '2',
                    text: 'Extend E-Waybill Validity'
                });

                var cancel_reason = Form.addField({
                    id: 'custpage_cancel_reason',
                    type: serverWidget.FieldType.SELECT,
                    label: 'Cancel Reason'

                });
                cancel_reason.addSelectOption({
                    value: '',
                    text: 'Select'
                });
                cancel_reason.addSelectOption({
                    value: '1',
                    text: 'Duplicate'
                });
                cancel_reason.addSelectOption({
                    value: '2',
                    text: 'Data entry mistake'
                });
                cancel_reason.addSelectOption({
                    value: '3',
                    text: 'Order Cancelled'
                });
                cancel_reason.addSelectOption({
                    value: '4',
                    text: 'Others'
                });

 var transporter_doc_no = Form.addField({
                    id: 'custpage_transporter_doc_no',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Transporter Document Number'

                });
 var transporter_doc_date = Form.addField({
                    id: 'custpage_transporter_doc_date',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Transporter Document Date'

                });
                var cancel_remark = Form.addField({
                    id: 'custpage_cancel_remark',
                    type: serverWidget.FieldType.LONGTEXT,
                    label: 'Cancel Remark'

                });
                cancel_remark.defaultValue = '';

                cancel_remark.setHelpText({
                    help: "Add Remark with in 100 char",
                    showInlineForAssistant: true
                });

                var e_way_bill_no = Form.addField({
                    id: 'custpage_e_way_bill_no',
                    type: serverWidget.FieldType.TEXT,
                    label: 'E-Way Bill Number'
                });
                var vehicleNumber = Form.addField({
                    id: 'custpage_vehicle_number',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Vehicle Number'
                });
                var transporter_id = Form.addField({
                    id: 'custpage_transporterid',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Transporter Id'
                });
				var remainDistance = Form.addField({
                    id: 'custpage_remaindistance',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Reamining Distance'
                });
				
               
               
                var update_remark = Form.addField({
                    id: 'custpage_update_remark',
                    type: serverWidget.FieldType.LONGTEXT,
                    label: 'Update Remark'

                });
                update_remark.defaultValue = '';
                update_remark.setHelpText({
                    help: "Add Remark with in 100 char",
                    showInlineForAssistant: true
                });
                var from_place = Form.addField({
                    id: 'custpage_from_place',
                    type: serverWidget.FieldType.TEXT,
                    label: 'FromPlace'

                });
                var from_state = Form.addField({
                    id: 'custpage_from_state',
                    type: serverWidget.FieldType.TEXT,
                    label: 'FromState'

                });
				var documentDate = Form.addField({
                    id: 'custpage_document_date',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Document Date'

                });
                var validaity_update_reason = Form.addField({
                    id: 'custpage_validaity_update_reason',
                    type: serverWidget.FieldType.SELECT,
                    label: 'Validity Update Reason'
                });
                validaity_update_reason.addSelectOption({
                    value: '',
                    text: 'Select'
                });
                validaity_update_reason.addSelectOption({
                    value: '1',
                    text: 'NATURAL_CALAMITY'
                });
                validaity_update_reason.addSelectOption({
                    value: '2',
                    text: 'TRANSSHIPMENT'
                });
                validaity_update_reason.addSelectOption({
                    value: '3',
                    text: 'OTHERS'
                });
                validaity_update_reason.addSelectOption({
                    value: '4',
                    text: 'ACCIDENT'
                });
                validaity_update_reason.addSelectOption({
                    value: '5',
                    text: 'LAW_ORDER_SITUATION'
                });
              

                var from_pincode = Form.addField({
                    id: 'custpage_from_pincode',
                    type: serverWidget.FieldType.TEXT,
                    label: 'From PinCode'
                });


               
                var transport_mode = Form.addField({
                    id: 'custpage_transport_mode',
                    type: serverWidget.FieldType.SELECT,
                    label: 'TransPort Mode'
                });
                transport_mode.addSelectOption({
                    value: '',
                    text: 'Select'
                });
                transport_mode.addSelectOption({
                    value: '1',
                    text: 'ROAD'
                });
                transport_mode.addSelectOption({
                    value: '2',
                    text: 'RAIL'
                });
                transport_mode.addSelectOption({
                    value: '3',
                    text: 'AIR'
                });
                transport_mode.addSelectOption({
                    value: '4',
                    text: 'SHIP'
                });
                transport_mode.addSelectOption({
                    value: '5',
                    text: 'IN_TRANSIT'
                });



                Form.addSubmitButton({
                    label: 'Submit'
                });




                response.writePage(Form);

            } else {

                try {
                    var Form = serverWidget.createForm({
                        title: 'Cancel/Update E-Way Bill',
                        hideNavBar: false
                    });
                    Form.clientScriptModulePath = 'SuiteScripts/CS_CANCEL_UPDATE_GO_BACK.js';
					var errorMessageFld = Form.addField({
						id : 'custpage_emailmessage',
						type : serverWidget.FieldType.TEXTAREA,
						label : 'Error Message'
					});
                  errorMessageFld.updateDisplayType({
    displayType: serverWidget.FieldDisplayType.DISABLED
});
					var errorMessage = '';
					Form.addButton({
                        id: 'goBack',
                        label: 'Go Back',
                        functionName: "goBack"
                    });
                    var parameters = request.parameters;
					log.debug('parameters',parameters);
                    var actionType = parameters.custpage_update_cancel_reason;
                    log.debug('actionType', actionType);
                    if (actionType == 1) {
                        var cancel_reason;
                        var cancel_reason_value = parameters.custpage_cancel_reason;
                        if (cancel_reason_value == 1) {
                            cancel_reason = 'DUPLICATE'
                        }
                        if (cancel_reason_value == 2) {
                            cancel_reason = 'DATA_ENTRY_MISTAKE'
                        }
                        if (cancel_reason_value == 3) {
                            cancel_reason = 'ORDER_CANCELLED'
                        }
                        if (cancel_reason_value == 4) {
                            cancel_reason = 'OTHERS'
                        }

                        var cancel_remark = parameters.custpage_cancel_remark;
                        var recordId = parameters.custpage_select_invoice;
                        var recType;
                        var transactionSearchObj = search.create({
                            type: "transaction",
                            settings: [{
                                "name": "includeperiodendtransactions",
                                "value": "F"
                            }],
                            filters: [
                                ["internalid", "anyof", recordId],
                                "AND",
                                ["mainline", "is", "T"]
                            ],
                            columns: [
                                search.createColumn({
                                    name: "type",
                                    summary: "GROUP",
                                    label: "Type"
                                }),
                                search.createColumn({
                                    name: "internalid",
                                    summary: "GROUP",
                                    label: "Internal ID"
                                }),
                                search.createColumn({
                                    name: "custbody_in_eway_bill_no",
                                    summary: "GROUP",
                                    label: "E-Way Bill No."
                                })
                            ]
                        });
                        var searchResultCount = transactionSearchObj.runPaged().count;
                        log.debug("transactionSearchObj result count", searchResultCount);
                        transactionSearchObj.run().each(function(result) {
                            recType = result.getText({
                                name: "type",
                                summary: "GROUP"
                            });
                            log.debug('recType', recType);
                            EwayBill = result.getValue({
                                name: "custbody_in_eway_bill_no",
                                summary: "GROUP"
                            });
                            log.debug('EwayBill', EwayBill);
                            return true;
                        });
                        var recordType;
                        if (recType == 'Journal') {
                            recordType = 'journalentry'
                        }
                        if (recType == 'Invoice') {
                            recordType = 'invoice'
                        }
                        var objRecord = record.load({
                            type: recordType,
                            id: recordId
                        })
                        var nexus = objRecord.getValue({
                            fieldId: 'nexus'
                        });
                        var subsidiary = objRecord.getValue({
                            fieldId: 'subsidiary'
                        });
                        var ewayNo = objRecord.getValue({
                            fieldId: 'custbody_in_eway_bill_no'
                        });
                        var Seller_Details = GetSellerDetails(subsidiary, nexus);
                        log.debug('Seller_Details', Seller_Details);
                        var Api_Token = GetApiToken(Seller_Details[0].taxregistrationnumber);
                        log.debug('Api_Token', Api_Token);
                        var token_val = Api_Token[0].Token_Details;
                        log.debug('token_val', token_val);
                        var gstin_val = Seller_Details[0].taxregistrationnumber;
                        log.debug('gstin_val', gstin_val);
						
                        var headerObj = new Array();
                        headerObj['X-Cleartax-Auth-Token'] = token_val.toString();
                        headerObj['Content-Type'] = 'application/json';
                        headerObj['Accept'] = 'application/json';
                        headerObj['gstin'] = gstin_val;

                        //	var url_new = 'https://api.clear.in/einv/v2/eInvoice/cancel';
                        var url_new = 'https://api.clear.in/einv/v2/eInvoice/ewaybill/cancel';
                        log.debug('url_new url_new', JSON.stringify(url_new));


                        var psg_ei_content = {
                            "ewbNo": parseInt(ewayNo),
                            "cancelRsnCode": cancel_reason,
                            "cancelRmrk": cancel_remark
                        }


                        log.debug('json_obj psg_ei_content', JSON.stringify(psg_ei_content));

                        var response = https.post({
                            url: url_new,
                            body: JSON.stringify(psg_ei_content),
                            headers: headerObj
                        });
                        log.debug('response', response);
                        log.debug('json_obj response', JSON.stringify(response.body));
                        var body_val = JSON.parse(response.body);
						log.debug('body_val',body_val);
                        var is_success = body_val.ewbStatus;
                        log.debug('is_success', is_success);
                        if (is_success == 'CANCELLED') {
							log.debug('check canceled condition')
                            objRecord.setValue({
                                    fieldId: 'custbody_e_way_bill_status',
                                    value: 4
                                });
								errorMessage = 'E-way Bill CANCELLED Succesfully'
                        } 
						else {
                            objRecord.setValue({
                                fieldId: 'custbody_eway_bill_error',
                                value: body_val.errorDetails.error_message
                            });
							errorMessage = body_val.errorDetails.error_message
                        }

                        var recordId = objRecord.save();
                        log.debug('recordId', recordId);
						if(recordId){
							//context.response.write('Action Performed Succesfully!')
						}
                    }
                    if (actionType == 2) {

                        var recordId = parameters.custpage_select_invoice_update;
                        var recType;
                        var EwayBill;
                        var updateAPi = parameters.custpage_update_api;
                        var transactionSearchObj = search.create({
                            type: "transaction",
                            settings: [{
                                "name": "includeperiodendtransactions",
                                "value": "F"
                            }],
                            filters: [
                                ["internalid", "anyof", recordId],
                                "AND",
                                ["mainline", "is", "T"]
                            ],
                            columns: [
                                search.createColumn({
                                    name: "type",
                                    summary: "GROUP",
                                    label: "Type"
                                }),
                                search.createColumn({
                                    name: "internalid",
                                    summary: "GROUP",
                                    label: "Internal ID"
                                }),
                                search.createColumn({
                                    name: "custbody_in_eway_bill_no",
                                    summary: "GROUP",
                                    label: "E-Way Bill No."
                                })
                            ]
                        });
                        var searchResultCount = transactionSearchObj.runPaged().count;
                        log.debug("transactionSearchObj result count", searchResultCount);
                        transactionSearchObj.run().each(function(result) {
                            recType = result.getText({
                                name: "type",
                                summary: "GROUP"
                            });
                            log.debug('recType', recType);
                            EwayBill = result.getValue({
                                name: "custbody_in_eway_bill_no",
                                summary: "GROUP"
                            });
                            log.debug('EwayBill', EwayBill);
                            return true;
                        });
                        var recordType;
                        if (recType == 'Journal') {
                            recordType = 'journalentry'
                        }
                        if (recType == 'Invoice') {
                            recordType = 'invoice'
                        }
                        var objRecord = record.load({
                            type: recordType,
                            id: recordId
                        })
                        var nexus = objRecord.getValue({
                            fieldId: 'nexus'
                        });
                        var subsidiary = objRecord.getValue({
                            fieldId: 'subsidiary'
                        });
                        var ewayNo = objRecord.getValue({
                            fieldId: 'custbody_in_eway_bill_no'
                        });
                        var Seller_Details = GetSellerDetails(subsidiary, nexus);
                        log.debug('Seller_Details', Seller_Details);
                        var Api_Token = GetApiToken(Seller_Details[0].taxregistrationnumber);
                        log.debug('Api_Token', Api_Token);
                        var token_val = Api_Token[0].Token_Details;
                        log.debug('token_val', token_val);
                        var gstin_val = Seller_Details[0].taxregistrationnumber;
                        log.debug('gstin_val', gstin_val);



                        if (updateAPi == 1) {
                           
                             var transporterId = parameters.custpage_transporterid;
                           

                          var headers = {
    "X-Cleartax-Auth-Token": token_val,
    "gstin": gstin_val,
    "Content-Type": "application/json",
	"Accept" : "application/json"
};

var payload = JSON.stringify({
    "EwbNumber": parseInt(ewayNo),
    "TransporterId": transporterId
});

var response = https.post({
    url: "https://api.clear.in/einv/v1/ewaybill/update?action=UPDATE_TRANSPORTER_ID",
    headers: headers,
    body: payload
});
log.debug('response',response);
log.debug('response',response.body);
                            log.debug('json_obj response', JSON.parse(response.body));
                            var body_val = JSON.parse(response.body);
                            var is_success = body_val.UpdatedDate;
                            log.debug('is_success', is_success);
                            if (is_success) {
								 objRecord.setValue({
                                    fieldId: 'custbody_in_eway_transport_id',
                                    value: transporterId
                                });
								objRecord.setValue({
                                    fieldId: 'custbody_e_way_bill_status',
                                    value: 3
                                });
								errorMessage = 'Transporter ID update Sucessfully!'
                                //context.response.write('Transporter ID update Sucessfully!')
                            } else {
                                objRecord.setValue({
                                    fieldId: 'custbody_eway_bill_error',
                                    value: body_val.errors[0].error_message
                                });
                                errorMessage = body_val.errors[0].error_message
                            }
                        }
                       
                        if (updateAPi == 2) {
							
							 
var fromPlace = parameters.custpage_from_place;
							var fromState = parameters.custpage_from_state;
							var vechileNumber = parameters.custpage_vehicle_number;
							var docDate = parameters.custpage_document_date;
							var transportMode = parameters.inpt_custpage_transport_mode
							log.debug('transportMode',transportMode);
							var transportMode = parameters.inpt_custpage_transport_mode
							var resonsRemark = parameters.custpage_update_remark;
							var reasonCode = parameters.inpt_custpage_part_b_update_reason
							var docNum = parameters.inpt_custpage_select_invoice_update;
							var tranDoc = parameters.custpage_transporter_doc_no;
							var tranDate = parameters.custpage_transporter_doc_date;
							var pinCode = parameters.custpage_from_pincode
							var validaityReason = parameters.inpt_custpage_validaity_update_reason;
							var remainDistance = parameters.custpage_remaindistance
							var apiRecTypeVa
 if (recType == 'Journal') {
                            apiRecTypeVa = 'OTHERS'
                        }
                        if (recType == 'Invoice') {
                            apiRecTypeVa = 'INV'
                        }
                           
var headers = {
    "X-Cleartax-Auth-Token": token_val,
    "gstin": gstin_val,
    "Content-Type": "application/json",
	"Accept" : "application/json"
};

var payload = JSON.stringify({
  "EwbNumber": parseInt(ewayNo),
                                "FromPlace": fromPlace,
                                "FromState": fromState,
                                "FromPincode": pinCode,
                                "ReasonCode": validaityReason,
                                "ReasonRemark": resonsRemark,
                                "TransDocNo": tranDoc,
                                "TransDocDt": tranDate,
                                "TransMode": transportMode,
                                "DocumentNumber": docNum,
                                "DocumentType": apiRecTypeVa,
                                "RemainingDistance": remainDistance,
                                "DocumentDate": docDate,
                                "VehicleType": "REGULAR",
   "ConsignmentStatus" : "MOVEMENT",
                                "VehNo": vechileNumber
});

var response = https.post({
    url: "https://api.clear.in/einv/v1/ewaybill/update?action=EXTEND_VALIDITY",
    headers: headers,
    body: payload
});

                        

                            
                            log.debug('response', response);
                            log.debug('json_obj response', JSON.stringify(response.body));
                            var body_val = JSON.parse(response.body);
                            var is_success = body_val.ValidUpto;
                            log.debug('is_success', is_success);
                            if (is_success) {
                                objRecord.setValue({
                                    fieldId: 'custbody_eway_bill_valid_untill',
                                    value: is_success
                                });
								 objRecord.setValue({
                                    fieldId: 'custbody_e_way_bill_status',
                                    value: 3
                                });
								errorMessage = 'E-way Bill Validity Updated!'
                             
                            } else {
                                objRecord.setValue({
                                    fieldId: 'custbody_eway_bill_error',
                                    value: body_val.errors[0].error_message
                                });
								errorMessage = body_val.errors[0].error_message
                            }
                        }

                        var recordId = objRecord.save();
                        log.debug('recordId', recordId);
                    }
					errorMessageFld.defaultValue = errorMessage
Form.addPageInitMessage({type: message.Type.INFORMATION, message: errorMessage, duration: 5000});
context.response.writePage(Form);

                  
                } catch (ex) {
                    log.error('error in post method', ex)
                }


   
            }

        }


        function GetSellerDetails(subsidiary, nexus) {

            log.debug('GetSellerDetails nexus', JSON.stringify(subsidiary));
            var Seller_Details = [];
            var filters = [
                ["internalid", "anyof", subsidiary],
                "AND",
                ["nexuscountry", "anyof", "IN"],
                "AND",
                ["nexus", "anyof", nexus]
            ];


            var sellerDetails = search.create({
                type: "subsidiary",
                filters: filters,
                columns: [
                    search.createColumn({
                        name: "city",
                        label: "city"
                    }),
                    search.createColumn({
                        name: "state",
                        label: "state"
                    }),
                    search.createColumn({
                        name: "country",
                        label: "country"
                    }),

                    search.createColumn({
                        name: "legalname",
                        label: "legalname"
                    }),
                    search.createColumn({
                        name: "address1",
                        label: "address1"
                    }),
                    search.createColumn({
                        name: "address2",
                        label: "address2"
                    }),
                    search.createColumn({
                        name: "zip",
                        label: "zip"
                    }),
                    search.createColumn({
                        name: "taxregistrationnumber",
                        label: "taxregistrationnumber"
                    })

                ]
            });
            var searchResultCount = sellerDetails.runPaged().count;
            log.debug("sellerDetails result count", searchResultCount);

            sellerDetails.run().each(function(result) {
                var obj = {};
                obj.taxregistrationnumber = result.getValue({
                    name: "taxregistrationnumber"
                });
                Seller_Details.push(obj)
                return true;
            });



            return Seller_Details;

        }

        function GetApiToken(gstin) {
            var filters = [
                ["internalid", "is", 1]
            ];

            var columns = [
                search.createColumn({
                    name: "custrecord_api_gstin",
                    label: "gstin"
                }),
                search.createColumn({
                    name: "custrecord_api_token",
                    label: "token"
                })
            ];
            var Token_Details = [];
            var apiToken = search.create({
                type: "customrecord_gstin_token_for_api",
                filters: filters,
                columns: columns
            });
            var searchResultCount = apiToken.runPaged().count;
            log.debug("apiToken result count", searchResultCount);

            apiToken.run().each(function(result) {
                var objAdd = {};
                objAdd.token_data = result.getValue({
                    name: "custrecord_api_gstin"
                });
                objAdd.Token_Details = result.getValue({
                    name: "custrecord_api_token"
                });
                Token_Details.push(objAdd)
                return true;
            });
            return Token_Details;
        }

        function GetInvoiceToCancel() {
            var transactionSearchObj = search.create({
                type: "transaction",
                settings: [{
                    "name": "includeperiodendtransactions",
                    "value": "F"
                }],
                filters: [
                    ["type", "anyof", "Journal", "CustInvc"],
                    "AND",
                    ["custbody_eway_bill_date", "isnotempty", ""],
                    "AND",
                    ["custbody_eway_bill_valid_untill", "isnotempty", ""],
                    "AND",
                    ["mainline", "is", "T"],
					"AND",
					["custbody_e_way_bill_status", "noneof", "4"]
                ],
                columns: [
                    search.createColumn({
                        name: "tranid",
                        summary: "GROUP",
                        label: "Document Number"
                    }),
                    search.createColumn({
                        name: "trandate",
                        summary: "GROUP",
                        label: "Date"
                    }),
                    search.createColumn({
                        name: "custbody_in_eway_bill_no",
                        summary: "GROUP",
                        label: "E-Way Bill No."
                    }),
                    search.createColumn({
                        name: "custbody_eway_bill_valid_untill",
                        summary: "GROUP",
                        label: "Valid Until"
                    }),
                    search.createColumn({
                        name: "internalid",
                        summary: "GROUP",
                        label: "Internal ID"
                    }),
                    search.createColumn({
                        name: "type",
                        summary: "GROUP",
                        label: "Type"
                    })
                ]
            });
            var searchResultCount = transactionSearchObj.runPaged().count;
            log.debug("transactionSearchObj result count", searchResultCount);
            var data_invoice = [];

            transactionSearchObj.run().each(function(result) {

var validUtil = result.getValue({
	 name: "custbody_eway_bill_valid_untill",
                        summary: "GROUP"
});



// Parse the given date string into a Date object
const givenDate = new Date(validUtil);

// Get the current date and time
const currentDate = new Date();

// Calculate the difference in milliseconds
const differenceInMilliseconds = currentDate - givenDate;

// Convert 24 hours to milliseconds
const twentyFourHoursInMilliseconds = 24 * 60 * 60 * 1000;

// Check if the difference is within 24 hours
const isWithin24Hours = differenceInMilliseconds <= twentyFourHoursInMilliseconds;
//log.debug('isWithin24Hours',isWithin24Hours);
if (isWithin24Hours == true) {
                var obj = {}
                obj.documentNumber = result.getValue({
                    name: "tranid",
                    summary: "GROUP"
                });
                obj.recId = result.getValue({
                    name: "internalid",
                    summary: "GROUP"
                });
                data_invoice.push(obj)
}
                return true;
            });
            return data_invoice;

        }
		 function updateApiData() {
            var transactionSearchObj = search.create({
                type: "transaction",
                settings: [{
                    "name": "includeperiodendtransactions",
                    "value": "F"
                }],
                filters: [
                    ["type", "anyof", "Journal", "CustInvc"],
                    "AND",
                    ["custbody_eway_bill_date", "isnotempty", ""],
                    "AND",
                    ["custbody_eway_bill_valid_untill", "isnotempty", ""],
                    "AND",
                    ["mainline", "is", "T"],
					"AND",
					["custbody_e_way_bill_status", "noneof", "4"],
					
					
					
                ],
                columns: [
                    search.createColumn({
                        name: "tranid",
                        summary: "GROUP",
                        label: "Document Number"
                    }),
                    search.createColumn({
                        name: "trandate",
                        summary: "GROUP",
                        label: "Date"
                    }),
                    search.createColumn({
                        name: "custbody_in_eway_bill_no",
                        summary: "GROUP",
                        label: "E-Way Bill No."
                    }),
                    search.createColumn({
                        name: "custbody_eway_bill_valid_untill",
                        summary: "GROUP",
                        label: "Valid Until"
                    }),
                    search.createColumn({
                        name: "internalid",
                        summary: "GROUP",
                        label: "Internal ID"
                    }),
                    search.createColumn({
                        name: "type",
                        summary: "GROUP",
                        label: "Type"
                    })
                ]
            });
            var searchResultCount = transactionSearchObj.runPaged().count;
            log.debug("transactionSearchObj result count", searchResultCount);
            var data_invoice_update = [];

            transactionSearchObj.run().each(function(result) {
				var validUtil = result.getValue({
					name: "custbody_eway_bill_valid_untill",
                        summary: "GROUP"
				})
				let currentTime = new Date();
log.debug('currentTime',currentTime);
// Given date and time
let expiryDate = new Date(validUtil);

const startWindow = new Date(expiryDate.getTime() - 8 * 60 * 60 * 1000); // 8 hours before expiry
log.debug('startWindow',startWindow);
  const endWindow = new Date(expiryDate.getTime() + 8 * 60 * 60 * 1000);   // 8 hours after expiry
log.debug('endWindow',endWindow);
// Check if the given time is within the 16 to 32 hour range
if (expiryDate >= startWindow && currentTime <= endWindow) {
	log.debug('documentNumber')
                var obj = {}
                obj.documentNumber = result.getValue({
                    name: "tranid",
                    summary: "GROUP"
                });
                obj.recId = result.getValue({
                    name: "internalid",
                    summary: "GROUP"
                });
                data_invoice_update.push(obj)
}
                return true;
            });
            return data_invoice_update;

        }
        return {
            onRequest: onRequest
        };

    });