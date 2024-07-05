/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope Public
 */
define(['N/currentRecord', 'N/url', 'N/https', 'N/ui/message', "N/https", "N/url", 'N/search'],

    function(currentRecord, url, https, message, https, url, search) {
        var record = currentRecord.get();

        /**
         * Function to be executed after page is initialized.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
         *
         * @since 2015.2
         */
        var currentRecord;

        function pageInit(scriptContext) {
            //alert('under pageInit')
            var record = scriptContext.currentRecord;
            //alert('record'+record);
            record.getField({
                fieldId: 'custpage_select_invoice'
            }).isDisplay = false;
            record.getField({
                fieldId: 'custpage_select_invoice_update'
            }).isDisplay = false;
            record.getField({
                fieldId: 'custpage_update_api'
            }).isDisplay = false;
            record.getField({
                fieldId: 'custpage_cancel_reason'
            }).isDisplay = false;

            record.getField({
                fieldId: 'custpage_cancel_remark'
            }).isDisplay = false;
            record.getField({
                fieldId: 'custpage_vehicle_number'
            }).isDisplay = false;
            
            record.getField({
                fieldId: 'custpage_transporterid'
            }).isDisplay = false;
            record.getField({
                fieldId: 'custpage_update_remark'
            }).isDisplay = false;
            record.getField({
                fieldId: 'custpage_e_way_bill_no'
            }).isDisplay = false;
            record.getField({
                fieldId: 'custpage_from_place'
            }).isDisplay = false;
            record.getField({
                fieldId: 'custpage_from_state'
            }).isDisplay = false;
            record.getField({
                fieldId: 'custpage_validaity_update_reason'
            }).isDisplay = false;
           
            record.getField({
                fieldId: 'custpage_from_pincode'
            }).isDisplay = false;
           
            record.getField({
                fieldId: 'custpage_transport_mode'
            }).isDisplay = false;
			record.getField({
                fieldId: 'custpage_document_date'
            }).isDisplay = false;
			record.getField({
                fieldId: 'custpage_transporter_doc_no'
            }).isDisplay = false;
			record.getField({
                fieldId: 'custpage_transporter_doc_date'
            }).isDisplay = false;
			record.getField({
                fieldId: 'custpage_remaindistance'
            }).isDisplay = false;
			
            
        }

        function fieldChanged(scriptContext) {
            try {
                //alert('under fielchanged')
                var record = scriptContext.currentRecord;
                // alert('record'+record);

                if (scriptContext.fieldId == 'custpage_select_invoice_update') {
					var recType;
					var recId;
                    var cancelTran = record.getValue({
                        fieldId: 'custpage_select_invoice_update'
                    });
                    //alert('cancelTran'+cancelTran);
                    var transactionSearchObj = search.create({
                        type: "transaction",
                        settings: [{
                            "name": "includeperiodendtransactions",
                            "value": "F"
                        }],
                        filters: [
                            ["internalid", "anyof", cancelTran],
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
                            }),
							 search.createColumn({
         name: "custbody_in_eway_vehicle_no",
         summary: "GROUP",
         label: "Vehicle No."
      }),
	   search.createColumn({
         name: "trandate",
         summary: "GROUP",
         label: "Date"
      }),
	  search.createColumn({
         name: "custbody_in_eway_transport_id",
         summary: "GROUP",
         label: "Transporter ID"
      }),
      search.createColumn({
         name: "custbody_in_eway_transport_mode",
         summary: "GROUP",
         label: "Transportation Mode"
      }),
	   search.createColumn({
         name: "custbody_in_eway_transp_doc_no",
         summary: "GROUP",
         label: "TRANSPORT DOC NO."
      }),
	   search.createColumn({
         name: "custbody_in_eway_transport_date",
         summary: "GROUP",
         label: "TRANSPORT DATE"
      })
                        ]
                    });
                    var searchResultCount = transactionSearchObj.runPaged().count;
                    //alert("transactionSearchObj result count"+searchResultCount);
                    transactionSearchObj.run().each(function(result) {
						  recType = result.getValue({
                            name: "type",
                            summary: "GROUP"
                        });
						var tranDoc = result.getValue({
                            name: "custbody_in_eway_transp_doc_no",
                            summary: "GROUP"
                        });
						var tranDate = result.getValue({
                            name: "custbody_in_eway_transport_date",
                            summary: "GROUP"
                        });
						//alert('recType'+recType);
						recId = result.getValue({
                            name: "internalid",
                            summary: "GROUP"
                        });
                        var ewayBill = result.getValue({
                            name: "custbody_in_eway_bill_no",
                            summary: "GROUP"
                        });
						 var vechileNumber = result.getValue({
                            name: "custbody_in_eway_vehicle_no",
                            summary: "GROUP"
                        });
						 var documentDate = result.getValue({
                            name: "trandate",
                            summary: "GROUP"
                        });
						var transporterId = result.getValue({
                            name: "custbody_in_eway_transport_id",
                            summary: "GROUP"
                        });
						var transporterMode = result.getValue({
                            name: "custbody_in_eway_transport_mode",
                            summary: "GROUP"
                        });
						
						
                        // alert("ewayBill"+ewayBill);
                        record.setValue({
                            fieldId: 'custpage_e_way_bill_no',
                            value: ewayBill,
                            ignoreFieldChange: true,
                            forceSyncSourcing: true
                        });
						record.setValue({
                            fieldId: 'custpage_vehicle_number',
                            value: vechileNumber,
                            ignoreFieldChange: true,
                            forceSyncSourcing: true
                        })
						record.setValue({
                            fieldId: 'custpage_document_date',
                            value: documentDate,
                            ignoreFieldChange: true,
                            forceSyncSourcing: true
                        })
						record.setValue({
                            fieldId: 'custpage_transport_mode',
                            value: transporterMode,
                            ignoreFieldChange: true,
                            forceSyncSourcing: true
                        })
						record.setValue({
                            fieldId: 'custpage_transporter_doc_no',
                            value: tranDoc,
                            ignoreFieldChange: true,
                            forceSyncSourcing: true
                        })
						record.setValue({
                            fieldId: 'custpage_transporter_doc_date',
                            value: tranDate,
                            ignoreFieldChange: true,
                            forceSyncSourcing: true
                        })
                        return true;
                    });
					if(recType == 'Journal'){
						var transactionSearchObj = search.create({
   type: "transaction",
   settings:[{"name":"includeperiodendtransactions","value":"F"}],
   filters:
   [
      ["internalid","anyof",recId], 
      "AND", 
      ["memo","startswith","Asset Transfer Out (FAM)"]
   ],
   columns:
   [
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
      }),
      search.createColumn({
         name: "custbody_in_eway_transport_id",
         summary: "GROUP",
         label: "Transporter ID"
      }),
      search.createColumn({
         name: "custbody_in_eway_vehicle_no",
         summary: "GROUP",
         label: "Vehicle No."
      }),
      search.createColumn({
         name: "trandate",
         summary: "GROUP",
         label: "Date"
      }),
      search.createColumn({
         name: "custbody_in_eway_transport_mode",
         summary: "GROUP",
         label: "Transportation Mode"
      }),
      search.createColumn({
         name: "location",
         summary: "GROUP",
         label: "Location"
      }),
      search.createColumn({
         name: "zip",
         join: "location",
         summary: "GROUP",
         label: "Zip"
      }),
      search.createColumn({
         name: "state",
         join: "location",
         summary: "GROUP",
         label: "State/Province"
      }),
      search.createColumn({
         name: "city",
         join: "location",
         summary: "GROUP",
         label: "City"
      })
   ]
});
var searchResultCount = transactionSearchObj.runPaged().count;
log.debug("transactionSearchObj result count",searchResultCount);
transactionSearchObj.run().each(function(result){
  var zipCode = result.getValue({
	   name: "zip",
         join: "location",
         summary: "GROUP"
  });
  var state = result.getValue({
	   name: "state",
         join: "location",
         summary: "GROUP"
  });
   var city = result.getValue({
	   name: "city",
         join: "location",
         summary: "GROUP"
  });
   var stateSplt = state.split("-")[0]
  record.setValue({
                            fieldId: 'custpage_from_pincode',
                            value: zipCode,
                            ignoreFieldChange: true,
                            forceSyncSourcing: true
                        })
						record.setValue({
                            fieldId: 'custpage_from_state',
                            value: stateSplt,
                            ignoreFieldChange: true,
                            forceSyncSourcing: true
                        })
						record.setValue({
                            fieldId: 'custpage_from_place',
                            value: city,
                            ignoreFieldChange: true,
                            forceSyncSourcing: true
                        })
   return true;
});

					}
					if(recType == 'CustInvc'){
						var transactionSearchObj = search.create({
   type: "transaction",
   settings:[{"name":"includeperiodendtransactions","value":"F"}],
   filters:
   [
      ["internalid","anyof",recId], 
      "AND", 
        ["mainline", "is", "T"]
   ],
   columns:
   [
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
      }),
      search.createColumn({
         name: "custbody_in_eway_transport_id",
         summary: "GROUP",
         label: "Transporter ID"
      }),
      search.createColumn({
         name: "custbody_in_eway_vehicle_no",
         summary: "GROUP",
         label: "Vehicle No."
      }),
      search.createColumn({
         name: "trandate",
         summary: "GROUP",
         label: "Date"
      }),
      search.createColumn({
         name: "custbody_in_eway_transport_mode",
         summary: "GROUP",
         label: "Transportation Mode"
      }),
      search.createColumn({
         name: "location",
         summary: "GROUP",
         label: "Location"
      }),
      search.createColumn({
         name: "zip",
         join: "location",
         summary: "GROUP",
         label: "Zip"
      }),
      search.createColumn({
         name: "state",
         join: "location",
         summary: "GROUP",
         label: "State/Province"
      }),
      search.createColumn({
         name: "city",
         join: "location",
         summary: "GROUP",
         label: "City"
      })
   ]
});
var searchResultCount = transactionSearchObj.runPaged().count;
log.debug("transactionSearchObj result count",searchResultCount);
transactionSearchObj.run().each(function(result){
  var zipCode = result.getValue({
	   name: "zip",
         join: "location",
         summary: "GROUP"
  });
  var state = result.getValue({
	   name: "state",
         join: "location",
         summary: "GROUP"
  });
   var city = result.getValue({
	   name: "city",
         join: "location",
         summary: "GROUP"
  });
    var stateSplt = state.split("-")[0]
  record.setValue({
                            fieldId: 'custpage_from_pincode',
                            value: zipCode,
                            ignoreFieldChange: true,
                            forceSyncSourcing: true
                        })
						record.setValue({
                            fieldId: 'custpage_from_state',
                            value: stateSplt,
                            ignoreFieldChange: true,
                            forceSyncSourcing: true
                        })
						record.setValue({
                            fieldId: 'custpage_from_place',
                            value: city,
                            ignoreFieldChange: true,
                            forceSyncSourcing: true
                        })
   return true;
});
					}
					
                }
                if (scriptContext.fieldId == 'custpage_select_invoice') {
                    var cancelTran = record.getValue({
                        fieldId: 'custpage_select_invoice'
                    });
                    //alert('cancelTran'+cancelTran);
                    var transactionSearchObj = search.create({
                        type: "transaction",
                        settings: [{
                            "name": "includeperiodendtransactions",
                            "value": "F"
                        }],
                        filters: [
                            ["internalid", "anyof", cancelTran],
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
                    //alert("transactionSearchObj result count"+searchResultCount);
                    transactionSearchObj.run().each(function(result) {

                        var ewayBill = result.getValue({
                            name: "custbody_in_eway_bill_no",
                            summary: "GROUP"
                        });
                        // alert("ewayBill"+ewayBill);
                        record.setValue({
                            fieldId: 'custpage_e_way_bill_no',
                            value: ewayBill,
                            ignoreFieldChange: true,
                            forceSyncSourcing: true
                        })
                        return true;
                    });
                }
                if (scriptContext.fieldId == 'custpage_update_api') {
                    var updateApi = record.getValue({
                        fieldId: 'custpage_update_api'
                    });
                    if (updateApi == '') {
                        record.getField({
                            fieldId: 'custpage_select_invoice'
                        }).isDisplay = false;
                        record.getField({
                            fieldId: 'custpage_select_invoice_update'
                        }).isDisplay = true;
                        record.getField({
                            fieldId: 'custpage_update_api'
                        }).isDisplay = true;
                        record.getField({
                            fieldId: 'custpage_cancel_reason'
                        }).isDisplay = false;
                        
                        record.getField({
                            fieldId: 'custpage_cancel_remark'
                        }).isDisplay = false;
                        record.getField({
                            fieldId: 'custpage_vehicle_number'
                        }).isDisplay = false;
                        
                        record.getField({
                            fieldId: 'custpage_transporterid'
                        }).isDisplay = false;
                        record.getField({
                            fieldId: 'custpage_update_remark'
                        }).isDisplay = false;
                        record.getField({
                            fieldId: 'custpage_e_way_bill_no'
                        }).isDisplay = false;
                        record.getField({
                            fieldId: 'custpage_from_place'
                        }).isDisplay = false;
                        record.getField({
                            fieldId: 'custpage_from_state'
                        }).isDisplay = false;
                        record.getField({
                            fieldId: 'custpage_validaity_update_reason'
                        }).isDisplay = false;
                        
                        record.getField({
                            fieldId: 'custpage_from_pincode'
                        }).isDisplay = false;
                       
                        record.getField({
                            fieldId: 'custpage_transport_mode'
                        }).isDisplay = false;
						record.getField({
                fieldId: 'custpage_document_date'
            }).isDisplay = false;
			record.getField({
                fieldId: 'custpage_transporter_doc_date'
            }).isDisplay = false;
                    }
                    if (updateApi == 1) {
                        var updateRecId = record.getValue({
                            fieldId: 'custpage_select_invoice_update'
                        })
                        record.getField({
                            fieldId: 'custpage_transporterid'
                        }).isDisplay = true;
						
                        
                        record.getField({
                            fieldId: 'custpage_from_state'
                        }).isDisplay = false;
                        
                        record.getField({
                            fieldId: 'custpage_validaity_update_reason'
                        }).isDisplay = false;
                        record.getField({
                            fieldId: 'custpage_from_pincode'
                        }).isDisplay = false;
                        record.getField({
                            fieldId: 'custpage_from_place'
                        }).isDisplay = false;
                        record.getField({
                            fieldId: 'custpage_from_state'
                        }).isDisplay = false;
                        
                       record.getField({
                fieldId: 'custpage_document_date'
            }).isDisplay = false;
			record.getField({
                fieldId: 'custpage_transporter_doc_date'
            }).isDisplay = false;
			record.getField({
                fieldId: 'custpage_remaindistance'
            }).isDisplay = false;
                        var transactionSearchObj = search.create({
                            type: "transaction",
                            settings: [{
                                "name": "includeperiodendtransactions",
                                "value": "F"
                            }],
                            filters: [
                                ["internalid", "anyof", updateRecId],
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
                                }),
                                search.createColumn({
                                    name: "custbody_in_eway_transport_id",
                                    summary: "GROUP",
                                    label: "Transporter ID"
                                })
                            ]
                        });
                        var searchResultCount = transactionSearchObj.runPaged().count;
                        log.debug("transactionSearchObj result count", searchResultCount);
                        transactionSearchObj.run().each(function(result) {
                            var transporterId = result.getValue({
                                name: "custbody_in_eway_transport_id",
                                summary: "GROUP"
                            });
                            record.setValue({
                                fieldId: 'custpage_transporterid',
                                value: transporterId,
                                ignoreFieldChange: true,
                                forceSyncSourcing: true
                            })
                            return true;
                        });

                    }
                   
                    if (updateApi == 2) {
						record.getField({
                fieldId: 'custpage_transporter_doc_date'
            }).isDisplay = true;
						
                      
                        record.getField({
                            fieldId: 'custpage_validaity_update_reason'
                        }).isDisplay = true;
                        record.getField({
                            fieldId: 'custpage_from_pincode'
                        }).isDisplay = true;
                        record.getField({
                            fieldId: 'custpage_from_place'
                        }).isDisplay = true;
                        record.getField({
                            fieldId: 'custpage_from_state'
                        }).isDisplay = true;
                       record.getField({
                            fieldId: 'custpage_update_remark'
                        }).isDisplay = true;
                       
                        record.getField({
                            fieldId: 'custpage_transport_mode'
                        }).isDisplay = true;
                        record.getField({
                            fieldId: 'custpage_vehicle_number'
                        }).isDisplay = true;
						 record.getField({
                            fieldId: 'custpage_transporterid'
                        }).isDisplay = false;
						
			record.getField({
                fieldId: 'custpage_document_date'
            }).isDisplay = true;
			record.getField({
                fieldId: 'custpage_transporter_doc_no'
            }).isDisplay = true;
			record.getField({
                fieldId: 'custpage_remaindistance'
            }).isDisplay = true;
                    }
                }
                if (scriptContext.fieldId == 'custpage_update_cancel_reason') {
                    var reasonValue = record.getText({
                        fieldId: 'custpage_update_cancel_reason'
                    });
                  //  alert('reasonValue' + reasonValue);

                    if (reasonValue == 'Cancel') {
                        record.getField({
                            fieldId: 'custpage_select_invoice'
                        }).isDisplay = true;
                        record.getField({
                            fieldId: 'custpage_cancel_reason'
                        }).isDisplay = true;
                        record.getField({
                            fieldId: 'custpage_cancel_remark'
                        }).isDisplay = true;
                        record.getField({
                            fieldId: 'custpage_select_invoice_update'
                        }).isDisplay = false;
                        record.getField({
                            fieldId: 'custpage_update_api'
                        }).isDisplay = false;

                       
                        
                        record.getField({
                            fieldId: 'custpage_transporterid'
                        }).isDisplay = false;
                        record.getField({
                            fieldId: 'custpage_update_remark'
                        }).isDisplay = false;
                        record.getField({
                            fieldId: 'custpage_e_way_bill_no'
                        }).isDisplay = true;
                        record.getField({
                            fieldId: 'custpage_from_place'
                        }).isDisplay = false;
                        record.getField({
                            fieldId: 'custpage_from_state'
                        }).isDisplay = false;
                        record.getField({
                            fieldId: 'custpage_validaity_update_reason'
                        }).isDisplay = false;
                       
                        record.getField({
                            fieldId: 'custpage_from_pincode'
                        }).isDisplay = false;
                        record.getField({
                            fieldId: 'custpage_transport_mode'
                        }).isDisplay = false;
						record.getField({
                fieldId: 'custpage_document_date'
            }).isDisplay = false;
			record.getField({
                fieldId: 'custpage_transporter_doc_no'
            }).isDisplay = false;
                record.getField({
                fieldId: 'custpage_transporter_doc_date'
            }).isDisplay = false;     
record.getField({
                fieldId: 'custpage_remaindistance'
            }).isDisplay = false;			
                    }
                    if (reasonValue == 'Update') {
                        record.getField({
                            fieldId: 'custpage_select_invoice'
                        }).isDisplay = false;
                        record.getField({
                            fieldId: 'custpage_select_invoice_update'
                        }).isDisplay = true;
                        record.getField({
                            fieldId: 'custpage_update_api'
                        }).isDisplay = true;
                        record.getField({
                            fieldId: 'custpage_cancel_reason'
                        }).isDisplay = false;

                        record.getField({
                            fieldId: 'custpage_cancel_remark'
                        }).isDisplay = false;
                        record.getField({
                            fieldId: 'custpage_vehicle_number'
                        }).isDisplay = false;
                       
                        record.getField({
                            fieldId: 'custpage_transporterid'
                        }).isDisplay = false;
                        record.getField({
                            fieldId: 'custpage_update_remark'
                        }).isDisplay = false;
                        record.getField({
                            fieldId: 'custpage_e_way_bill_no'
                        }).isDisplay = true;
                        record.getField({
                            fieldId: 'custpage_from_place'
                        }).isDisplay = false;
                        record.getField({
                            fieldId: 'custpage_from_state'
                        }).isDisplay = false;
                        record.getField({
                            fieldId: 'custpage_validaity_update_reason'
                        }).isDisplay = false;
                       
                        record.getField({
                            fieldId: 'custpage_from_pincode'
                        }).isDisplay = false;
                        
                        record.getField({
                            fieldId: 'custpage_transport_mode'
                        }).isDisplay = false;
                       record.getField({
                fieldId: 'custpage_remaindistance'
            }).isDisplay = false;
					   record.getField({
                fieldId: 'custpage_document_date'
            }).isDisplay = false;
			record.getField({
                fieldId: 'custpage_transporter_doc_no'
            }).isDisplay = false;
			record.getField({
                fieldId: 'custpage_transporter_doc_date'
            }).isDisplay = false;
                    }
                    if (reasonValue == 'Select') {
                        record.getField({
                            fieldId: 'custpage_select_invoice'
                        }).isDisplay = false;
                        record.getField({
                            fieldId: 'custpage_select_invoice_update'
                        }).isDisplay = false;
                        record.getField({
                            fieldId: 'custpage_update_api'
                        }).isDisplay = false;
                        record.getField({
                            fieldId: 'custpage_cancel_reason'
                        }).isDisplay = false;

                        record.getField({
                            fieldId: 'custpage_cancel_remark'
                        }).isDisplay = false;
                        record.getField({
                            fieldId: 'custpage_vehicle_number'
                        }).isDisplay = false;
                       
                        record.getField({
                            fieldId: 'custpage_transporterid'
                        }).isDisplay = false;
                        record.getField({
                            fieldId: 'custpage_update_remark'
                        }).isDisplay = false;
                        record.getField({
                            fieldId: 'custpage_e_way_bill_no'
                        }).isDisplay = false;
                        record.getField({
                            fieldId: 'custpage_from_place'
                        }).isDisplay = false;
                        record.getField({
                            fieldId: 'custpage_from_state'
                        }).isDisplay = false;
                        record.getField({
                            fieldId: 'custpage_validaity_update_reason'
                        }).isDisplay = false;
                       
                        record.getField({
                            fieldId: 'custpage_from_pincode'
                        }).isDisplay = false;
                       
                        record.getField({
                            fieldId: 'custpage_transport_mode'
                        }).isDisplay = false;
                      record.getField({
                fieldId: 'custpage_document_date'
            }).isDisplay = false;
			record.getField({
                fieldId: 'custpage_transporter_doc_no'
            }).isDisplay = false;
			record.getField({
                fieldId: 'custpage_transporter_doc_date'
            }).isDisplay = false;

                    }


                }

            } catch (ex) {
                alert('error' + ex);
            }



        }

        function goBack() {
            history.back();


        }
function saveRecord(scriptContext) {
    var record = scriptContext.currentRecord;
    var reason = record.getValue({
        fieldId: 'custpage_update_cancel_reason'
    });

    if (reason == 1) {
        var cancelReason = record.getValue({
            fieldId: 'custpage_cancel_reason'
        });
        if (!cancelReason) {
            alert('Please select Cancel Reason');
            return false;
        }

        var cancelRemark = record.getValue({
            fieldId: 'custpage_cancel_remark'
        });
        if (!cancelRemark) {
            alert('Please enter Cancel Remark');
            return false;
        }

        var selectInvoice = record.getValue({
            fieldId: 'custpage_select_invoice'
        });
        if (!selectInvoice) {
            alert('Please select Transaction');
            return false;
        }
    }

    if (reason == 2) {
        var updateInvoice = record.getValue({
            fieldId: 'custpage_select_invoice_update'
        });
        if (!updateInvoice) {
            alert('Please select Transaction');
            return false;
        }

        var updateApi = record.getValue({
            fieldId: 'custpage_update_api'
        });
        if (!updateApi) {
            alert('Please select Update API');
            return false;
        }

        if (updateApi == 1) {
            var transporterId = record.getValue({
                fieldId: 'custpage_transporterid'
            });
            if (!transporterId) {
                alert('Please enter Transporter ID');
                return false;
            }
        }

        if (updateApi == 2) {
            var fromPlace = record.getValue('custpage_from_place');
            var fromState = record.getValue('custpage_from_state');
            var vehicleNumber = record.getValue('custpage_vehicle_number');
            var docDate = record.getValue('custpage_document_date');
            var transportMode = record.getValue('custpage_transport_mode');
            var reasonsRemark = record.getValue('custpage_update_remark');
            var reasonCode = record.getValue('custpage_validaity_update_reason');
            var docNum = record.getValue('custpage_select_invoice_update');
            var tranDoc = record.getValue('custpage_transporter_doc_no');
            var tranDate = record.getValue('custpage_transporter_doc_date');

            if (!fromPlace) {
                alert('Please enter From Place');
                return false;
            }
            if (!fromState) {
                alert('Please select From State');
                return false;
            }
            if (!vehicleNumber) {
                alert('Please enter Vehicle Number');
                return false;
            }
            if (!docDate) {
                alert('Please enter Document Date');
                return false;
            }
            if (!transportMode) {
                alert('Please select Transport Mode');
                return false;
            }
            if (!reasonsRemark) {
                alert('Please enter Update Remark');
                return false;
            }
            if (!reasonCode) {
                alert('Please enter Reason Code');
                return false;
            }
            if (!docNum) {
                alert('Please select Invoice Update');
                return false;
            }
            if (!tranDoc) {
                alert('Please enter Transporter Document Number');
                return false;
            }
            if (!tranDate) {
                alert('Please enter Transporter Document Date');
                return false;
            }
        }
    }

    return true; // Allow the record to be saved if all validations pass
}


        return {
            pageInit: pageInit,
            fieldChanged: fieldChanged,
            goBack: goBack,
			saveRecord : saveRecord
        };

    });