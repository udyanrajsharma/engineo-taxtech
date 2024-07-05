 /**
 * @NApiVersion 2.0
 * @NScriptType Suitelet
 * @NModuleScope Public
 */
define(['N/record', 'N/runtime', 'N/search', 'N/ui/serverWidget', 'N/encode', 'N/file', "N/https", "N/url"],
    /**
     * @param {record} record
     * @param {runtime} runtime
     * @param {search} search
     */
    function(record, runtime, search, serverWidget, encode, file, https,url) {

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
			 var parameters = request.parameters;
            if (request.method == 'GET') {
                try {
					
					 var selection_value = parameters.selection_value;
					 log.debug('selection_value', selection_value);
                   // getSalesOrderData();
				  
					   
                    var Form = serverWidget.createForm({
                        title: 'Assest Transfer Journal Entry List',
                        hideNavBar: false
                    }); //Create a form
                    Form.addTab({
                        id: 'tab1',
                        label: 'Journal Entry'
                    });
				
		
			
                   var start_date = Form.addField({
                    id: 'custpage_start_date',
                    type: serverWidget.FieldType.DATE,
                    label: 'Start Date'
                  
                });
				start_date.isMandatory = true;
				  var end_date = Form.addField({
                    id: 'custpage_end_date',
                    type: serverWidget.FieldType.DATE,
                    label: 'End Date'
                  
                });
				end_date.isMandatory = true;
				var ewayBillStatus = Form.addField({
                    id: 'custpage_e_way_bill_status',
                    type: serverWidget.FieldType.SELECT,
                    label: 'Status'
                  
                });
				ewayBillStatus.addSelectOption ({
					text: 'All',
					value : '1'
				})
				ewayBillStatus.addSelectOption ({
					text: 'Not-Generated',
					value : '2'
				})
				ewayBillStatus.addSelectOption ({
					text: 'Generated',
					value : '3'
				})		
ewayBillStatus.isMandatory = true;				
					  Form.addSubmitButton({
                    label: 'Search'
                });
				
                  
                    var sublist = Form.addSublist({
                        id: 'custpage_sublist',
                        type: serverWidget.SublistType.STATICLIST,
                        label: 'Journal Enntry'
                    });

                   var SetSublist = setSublistReorderPoint(sublist, Form, request, response);
                    
					//Form.clientScriptModulePath = '../lib/cs_bulk_einvoicing.js';
                 response.writePage(Form);
				   
                } catch (e) {
                    log.error('e,message', e.message);
                }
            } else {
                try {
					
					 var start_date = context.request.parameters.custpage_start_date;
					 var end_date = context.request.parameters.custpage_end_date;
					 var billStatus = context.request.parameters.custpage_e_way_bill_status;
					
					var Form = serverWidget.createForm({
                        title: 'Assest Transfer Journal Entry List',
                        hideNavBar: false
                    }); //Create a form
                  Form.clientScriptModulePath = './CS_ASSEST_TRANSFER_GO_BACK.js'
					Form.addButton({
                    id: 'goBack',
                    label: 'Back',
                    functionName: "goBack"
                });
                    Form.addTab({
                        id: 'tab1',
                        label: 'Journal Entry'
                    });
					
					
				
					  var sublist = Form.addSublist({
                        id: 'custpage_sublist',
                        type: serverWidget.SublistType.LIST,
                        label: 'Journal Entry'
                    });
                   var SetSublist = setSublistReorderPoint(sublist, Form, request, response,start_date,end_date,billStatus);
                    
					//Form.clientScriptModulePath = '../lib/cs_bulk_einvoicing.js';
                 response.writePage(Form);
					
					 log.debug('start_date', JSON.stringify(start_date));	
					 log.debug('end_date', JSON.stringify(end_date));	
					  
                  
			
			
                } catch (e) {
                    log.error('e.message', e.message);
                }
            }

        }
		
		
		



		
		
		function setSublistReorderPoint(sublist, Form, request, response,start_date,end_date,billStatus) {
            
			sublist.addField({ id: 'custpage_checkbox',  type: serverWidget.FieldType.TEXT,  label: 'View' });
			sublist.addField({ id: 'custpage_internal_id',  type: serverWidget.FieldType.TEXT,  label: 'Internal ID' });
			sublist.addField({ id: 'custpage_doc_number',  type: serverWidget.FieldType.TEXT,  label: 'Transaction ID' });
            sublist.addField({ id: 'custpage_transcation_date', type: serverWidget.FieldType.TEXT, label: 'Transaction Date' });
            sublist.addField({ id: 'custpage_e_way_bill', type: serverWidget.FieldType.TEXT, label: 'E-way Bill Number' });            
            var lineNum = 0;
			if(start_date && billStatus == 2){
				log.debug('start_date222', JSON.stringify(start_date));	
				log.debug('end_date 222', JSON.stringify(end_date));	
			var FiltersArray=[  ["type","anyof","Journal"], 
      "AND", 
      ["bookspecifictransaction","is","T"], 
      "AND", 
      ["custbody_e_way_bill_required","is","T"], 
      "AND", 
      ["mainline","is","T"], 
	   "AND",
      ["trandate","within",start_date,end_date],
		"AND", 
      ["custbody_in_eway_bill_no","isempty",""]];
			}
			else if(start_date && billStatus == 3){
			var FiltersArray=[  ["type","anyof","Journal"], 
      "AND", 
      ["bookspecifictransaction","is","T"], 
      "AND", 
      ["custbody_e_way_bill_required","is","T"], 
      "AND", 
      ["mainline","is","T"], 
	   "AND",
      ["trandate","within",start_date,end_date],
		"AND", 
      ["custbody_in_eway_bill_no","isnotempty",""]];
			}
			else if(start_date && billStatus == 1){
	  
			var FiltersArray=[  ["type","anyof","Journal"], 
      "AND", 
      ["bookspecifictransaction","is","T"], 
      "AND", 
      ["custbody_e_way_bill_required","is","T"], 
      "AND", 
      ["mainline","is","T"]];
			}
			else{
	  
			var FiltersArray=[  ["type","anyof","Journal"], 
      "AND", 
      ["bookspecifictransaction","is","T"], 
      "AND", 
      ["custbody_e_way_bill_required","is","T"], 
      "AND", 
      ["mainline","is","T"]];
			}
				 var ColumnsArray = [
     search.createColumn({
         name: "trandate",
         summary: "GROUP",
         label: "Date"
      }),
      search.createColumn({
         name: "tranid",
         summary: "GROUP",
         label: "Document Number"
      }),
      search.createColumn({
         name: "internalid",
         summary: "GROUP",
         label: "Internal ID"
      }),
      search.createColumn({
         name: "custbody_in_eway_bill_no",
         summary: "GROUP",
         label: "E-way Bill Number"
      })];
	  var accountingtransactionSearchObj = search.create({
   type: "journalentry",
   settings:[{"name":"includeperiodendtransactions","value":"F"}],
   filters: FiltersArray,
   columns:ColumnsArray
   });
   log.debug('accountingtransactionSearchObj',accountingtransactionSearchObj);
     	
				var searchResultCount = accountingtransactionSearchObj.runPaged().count;
log.debug("accountingtransactionSearchObj result count",searchResultCount);
var k =0;

accountingtransactionSearchObj.run().each(function(result){
   var ewaybillNumber = result.getValue({ name: "custbody_in_eway_bill_no",
		 summary: "GROUP"
		 });
		 log.debug('ewaybillNumber',ewaybillNumber)
							 if(ewaybillNumber){
								sublist.setSublistValue({  id: 'custpage_e_way_bill', line: k, value: ewaybillNumber });
							 }
							 
							 var recId = result.getValue({ name: "internalid",
		 summary: "GROUP"
		 });
							 log.debug('recId',recId)
							 var tranNumber = result.getValue({  name: "tranid",
		 summary: "GROUP"
		 });
		 log.debug('tranNumber',tranNumber)
							 var tranDate = result.getValue({ 
							 name: "trandate",
		 summary: "GROUP"
		 });	
 log.debug('tranDate',tranDate)		;
 var output = url.resolveRecord({
    recordType: 'journalentry',
    recordId: recId,
    isEditMode: false
});
var html_quote = "<!DOCTYPE html>";
                html_quote += '<html>';
                html_quote += '<a href="' + output + '+&setDate=false">VIEW</a>';
                html_quote += '</html>' 
		sublist.setSublistValue({ id: 'custpage_checkbox', line: k, value: html_quote });
		sublist.setSublistValue({ id: 'custpage_internal_id', line: k, value: recId });
		sublist.setSublistValue({ id: 'custpage_doc_number', line: k, value: tranNumber });
        sublist.setSublistValue({ id: 'custpage_transcation_date', line: k, value: tranDate });
		k++;
        
   return true;
});


          
        }

       

        return {
            onRequest: onRequest
        };

    })