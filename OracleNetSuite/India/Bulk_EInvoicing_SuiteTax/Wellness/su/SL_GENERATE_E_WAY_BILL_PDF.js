/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope Public
 */
define(['N/record', 'N/runtime', 'N/search', 'N/ui/serverWidget', 'N/encode', 'N/file', "N/https", "N/url", 'N/task','N/ui/message','N/render'],
    /**
     * @param {record} record
     * @param {runtime} runtime
     * @param {search} search
     */
    function(record, runtime, search, serverWidget, encode, file, https, url, task,message,render) {

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
                    title: 'Generate E-way Bill PDF',
                    hideNavBar: true
                });
				var tranFld = Form.addField({
						id : 'custpage_transaction',
						type : serverWidget.FieldType.SELECT,
						label : 'Transaction'
					});
					var inv_data = updateApiData();
 for (var k = 0; k < inv_data.length; k++) {
                    var internalid = inv_data[k].recId;
                    var tranid = inv_data[k].documentNumber;
                    tranFld.addSelectOption({
                        value: internalid,
                        text: tranid
                    });
                }
Form.addSubmitButton({
	label : 'Generate PDF'
})


                response.writePage(Form);

            } else {
				   try {
					    var ewaydata = [];
						var recType;
						var recId = context.request.parameters.custpage_transaction
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
					"AND",
					["internalid", "anyof",recId]
					
					
					
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
           

            transactionSearchObj.run().each(function(result) {
				
               
                ewaybill = result.getValue({
				   name: "custbody_in_eway_bill_no",
                        summary: "GROUP"
			   });
			   recType =  result.getValue({
				  name: "type",
                        summary: "GROUP"
			   });
               
                ewaydata.push(parseInt(ewaybill))

                return true;
            });
			log.debug('ewaydata',ewaydata)
			var gstinId;
			if(recType == 'Journal'){
				gstinId = '27AAACW7565P1ZH'
			}
			else{
				gstinId = '29AAACW7565P1ZD'
			}
			
					          var url = 'https://api.clear.in/einv/v2/eInvoice/ewaybill/print?format=PDF';
        var headers = {
            'X-Cleartax-Auth-Token': '1.87b7ac42-4823-44c7-bee7-25ab14051d9f_9f52d359777bfc85385b914a309228e390c31e17cb4dd93a223b7de74095c908',
            'gstin': gstinId,
            'Content-Type': 'application/json'
        };
        var payload = JSON.stringify({
            ewb_numbers: ewaydata,
            print_type: 'DETAILED'
        });

        var response = https.post({
            url: url,
            headers: headers,
            body: payload
        });

        if (response.code === 200) {
           var base64String = response.body
            var pdfFile = file.create({
                name: 'sample.pdf',
                fileType: file.Type.PDF,
                contents: base64String,
                encoding: file.Encoding.BASE_64
            });

            var folderId = -12; // Replace with your folder ID
            pdfFile.folder = folderId;

            var fileId = pdfFile.save();
			log.debug('fileId',fileId);
			var fileObj = file.load({
    id: fileId
});
var pdfRenderer = render.create();
            pdfRenderer.templateContent = fileObj.getContents();

            // Write the PDF to the response
            context.response.writeFile({
                file: fileObj,
                isInline: true // If you want to prompt download, use false
            });
        } else {
            log.error({
                title: 'Error',
                details: 'Response Code: ' + response.code + ' Body: ' + response.body
            });
        }

                    

             
				}
                   catch(ex){
					   log.error('error in post method',ex);
				   }
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

                return true;
            });
            return data_invoice_update;

				 }
        }
        return {
            onRequest: onRequest
        };

    });