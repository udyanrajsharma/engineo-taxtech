 /**
 * @NApiVersion 2.0
 * @NScriptType Suitelet
 * @NModuleScope Public
 */
define(['N/record', 'N/runtime', 'N/search', 'N/ui/serverWidget', 'N/encode', 'N/file', "../lib/common_2.0", "N/https", "N/url"],
    /**
     * @param {record} record
     * @param {runtime} runtime
     * @param {search} search
     */
    function(record, runtime, search, serverWidget, encode, file,common, https,url) {

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
                        title: 'Bulk E-Documents Generation and Certification',
                        hideNavBar: false
                    }); //Create a form
                    Form.addTab({
                        id: 'tab1',
                        label: 'Invoice'
                    });
					var StatusFilters=[   ["isinactive","is","F"] ];
			
			 var StatusColumns = [	
				 search.createColumn({name: "internalid", label: "internalid"}),
				 search.createColumn({name: "name", label: "name"}) ]
		var StatusObj = common.searchAllRecord('customlist_psg_ei_status',null,StatusFilters,StatusColumns);
		var data_Status = common.pushSearchResultIntoArray(StatusObj);
		 log.debug('StatusObj', JSON.stringify(data_Status));
			
                   var start_date = Form.addField({
                    id: 'custpage_start_date',
                    type: serverWidget.FieldType.DATE,
                    label: 'Start Date'
                  
                });
				  var end_date = Form.addField({
                    id: 'custpage_end_date',
                    type: serverWidget.FieldType.DATE,
                    label: 'End Date'
                  
                });
					
					 Form.addButton({
                id: 'submitBtn',
                label: 'Generate & Certify E-Documents',
				functionName: "generateEdoc"
            });
			
				
	  
					
					Form.addButton({
                        id: 'refreshpage_1',
                        label: 'Send E-Documents',
                        functionName: "sendEdoc"
                    });
					
					
					  Form.addSubmitButton({
                    label: 'Search'
                });
				
                  
                    var sublist = Form.addSublist({
                        id: 'custpage_sublist',
                        type: serverWidget.SublistType.LIST,
                        label: 'Invoice'
                    });
                    sublist.addMarkAllButtons();
                   var SetSublist = setSublistReorderPoint(sublist, Form, request, response);
                    
					Form.clientScriptModulePath = '../lib/cs_bulk_einvoicing.js';
                 response.writePage(Form);
				   
                } catch (e) {
                    log.error('e,message', e.message);
                }
            } else {
                try {
					
					 var start_date = context.request.parameters.custpage_start_date;
					 var end_date = context.request.parameters.custpage_end_date;
					
					var Form = serverWidget.createForm({
                        title: 'Bulk E-Documents Generation and Certification',
                        hideNavBar: false
                    }); //Create a form
					Form.addButton({
                    id: 'goBack',
                    label: 'Back',
                    functionName: "goBack"
                });
                    Form.addTab({
                        id: 'tab1',
                        label: 'Invoice'
                    });
					
					
					 Form.addButton({
                id: 'submitBtn',
                label: 'Generate & Certify E-Documents',
				functionName: "generateEdoc"
            });
			
				
	  
					
					Form.addButton({
                        id: 'refreshpage_1',
                        label: 'Send E-Documents',
                        functionName: "sendEdoc"
                    });
					
					  var sublist = Form.addSublist({
                        id: 'custpage_sublist',
                        type: serverWidget.SublistType.LIST,
                        label: 'Invoice'
                    });
                    sublist.addMarkAllButtons();
                   var SetSublist = setSublistReorderPoint(sublist, Form, request, response,start_date,end_date);
                    
					Form.clientScriptModulePath = '../lib/cs_bulk_einvoicing.js';
                 response.writePage(Form);
					
					 log.debug('start_date', JSON.stringify(start_date));	
					 log.debug('end_date', JSON.stringify(end_date));	
					  
                  
			
			
                } catch (e) {
                    log.error('e.message', e.message);
                }
            }

        }
		
		
		



		
		
		function setSublistReorderPoint(sublist, Form, request, response,start_date,end_date) {
            
			sublist.addField({ id: 'custpage_checkbox',  type: serverWidget.FieldType.CHECKBOX,  label: 'Select' });
			sublist.addField({ id: 'custpage_internal_id',  type: serverWidget.FieldType.TEXT,  label: 'Internal ID' });
			sublist.addField({ id: 'custpage_doc_number',  type: serverWidget.FieldType.TEXT,  label: 'Transaction ID' });
            sublist.addField({ id: 'custpage_customer_name', type: serverWidget.FieldType.TEXT, label: 'Entity' });
            sublist.addField({ id: 'custpage_invoice_date', type: serverWidget.FieldType.DATE, label: 'Invoice Date' });
    
            sublist.addField({ id: 'custpage_memo', type: serverWidget.FieldType.TEXT, label: 'Memo' });
            sublist.addField({ id: 'custpage_currency', type: serverWidget.FieldType.TEXT, label: 'Currency' });
    
            sublist.addField({ id: 'custpage_amount', type: serverWidget.FieldType.TEXT, label: 'Amount' });
             sublist.addField({ id: 'custpage_sending_method', type: serverWidget.FieldType.TEXT, label: 'E-DOCUMENT SENDING METHOD' });
			sublist.addField({ id: 'custpage_ei_template', type: serverWidget.FieldType.TEXT, label: 'E-Document Template' });
            sublist.addField({ id: 'custpage_ei_status', type: serverWidget.FieldType.TEXT, label: 'E-Document Status' });
            sublist.addField({ id: 'custpage_type', type: serverWidget.FieldType.TEXT, label: 'Type' });
          //Changes start 22/12/2023
          sublist.addField({ id: 'custpage_ei_irn', type: serverWidget.FieldType.TEXT, label: 'IRN' });
          //Changes End 22/10/2023
            
            var lineNum = 0;
			if(start_date){
				log.debug('start_date222', JSON.stringify(start_date));	
				log.debug('end_date 222', JSON.stringify(end_date));	
			var FiltersArray=[  ["type","anyof","CustInvc"], 
      "AND", 
      ["mainline","is","T"], 
      "AND", 
      ["custbody_psg_ei_status","anyof","1","3","19","5","21","22","8","2"], 
      "AND", 
      ["memorized","is","F"], 
      "AND", 
      ["custbody_psg_ei_template","noneof","@NONE@"],"AND", 
      ["trandate","within",start_date,end_date] ];
			}else{
	  
			var FiltersArray=[  ["type","anyof","CustInvc"], 
      "AND", 
      ["mainline","is","T"], 
      "AND", 
      ["custbody_psg_ei_status","anyof","1","3","19","5","21","22","8","2"], 
      "AND", 
      ["memorized","is","F"], 
      "AND", 
      ["custbody_psg_ei_template","noneof","@NONE@"] ];
			}
				 var ColumnsArray = [
				search.createColumn({name: "tranid",sort: search.Sort.DESC, label: "Transaction ID" }),				 
				 search.createColumn({name: "internalid", label: "internalid"}),
				 search.createColumn({name: "tranid", label: "doc_num"}),
      search.createColumn({name: "entity", label: "entity"}),
      search.createColumn({name: "currency", label: "currency"}),
      search.createColumn({name: "amount", label: "amount"}),
      search.createColumn({name: "trandate", label: "trandate"}),
      search.createColumn({name: "custbody_psg_ei_sending_method", label: "sending_method"}),
      //Changes Start on 22/12/2023
      search.createColumn({name: "custbody_in_ei_irn", label: "ei_irn"}),
      //Changes End on 22/10/2023
      search.createColumn({name: "custbody_psg_ei_template", label: "ei_template"}),
      search.createColumn({name: "custbody_psg_ei_status", label: "ei_status"}),
      search.createColumn({name: "type", label: "type"}),
		search.createColumn({name: "memomain", label: "memo"}) ];
     	
				var InvObj = common.searchAllRecord('invoice',null,FiltersArray,ColumnsArray);
			var data_invoice = common.pushSearchResultIntoArray(InvObj);
			
				 log.debug('InvObj', JSON.stringify(InvObj));	
				 log.debug('data_invoice', JSON.stringify(data_invoice));

						
							for (var k = 0; k < data_invoice.length; k++) { 
							
							 var internalid = data_invoice[k].internalid;
							 var doc_num = data_invoice[k].doc_num;
							 var amount = data_invoice[k].amount;
							 var entity = InvObj[k].getText({ name: 'entity'});
                             var trandate = data_invoice[k].trandate;
							 var currency = InvObj[k].getText({ name: 'currency'});
							 var sending_method = InvObj[k].getText({ name: 'custbody_psg_ei_sending_method'});
							 if(sending_method == ""){
								sending_method = '-';  
							 }
							 var ei_template = InvObj[k].getText({ name: 'custbody_psg_ei_template'});
							  if(ei_template == ""){
								ei_template = '-';  
							 }
							 var ei_status = InvObj[k].getText({ name: 'custbody_psg_ei_status'});
							 var type = InvObj[k].getText({ name: 'type'});

							// var entity = data_invoice[k].entity;
							 var memo = data_invoice[k].memo;
							 if(memo == ""){
								memo = '-'; 
							 }
                              //Changes Start on 22/10/2023
                              var ei_irn = data_invoice[k].ei_irn;
							 if(ei_irn == ""){
								ei_irn = '-'; 
							 }
                              //Changes End on 22/10/2023
                            
                              
							 
		sublist.setSublistValue({ id: 'custpage_checkbox', line: lineNum, value: 'F' });
		sublist.setSublistValue({ id: 'custpage_internal_id', line: lineNum, value: internalid });
		sublist.setSublistValue({ id: 'custpage_doc_number', line: lineNum, value: doc_num });
        sublist.setSublistValue({ id: 'custpage_customer_name', line: lineNum, value: entity });
        sublist.setSublistValue({  id: 'custpage_memo', line: lineNum, value: memo });
        sublist.setSublistValue({  id: 'custpage_currency', line: lineNum, value: currency });
        sublist.setSublistValue({  id: 'custpage_amount', line: lineNum, value: amount });
        sublist.setSublistValue({  id: 'custpage_sending_method', line: lineNum, value: sending_method });
        sublist.setSublistValue({  id: 'custpage_ei_template', line: lineNum, value: ei_template });
        sublist.setSublistValue({  id: 'custpage_ei_status', line: lineNum, value: ei_status });
        sublist.setSublistValue({  id: 'custpage_type', line: lineNum, value: type });
        sublist.setSublistValue({  id: 'custpage_invoice_date', line: lineNum, value: trandate });
        //Changes start on 22/10/2023
         sublist.setSublistValue({  id: 'custpage_ei_irn', line: lineNum, value: ei_irn });
        //Changes End on 22/10/2023
				
				  ++lineNum;			
							}
          
        }

       

        return {
            onRequest: onRequest
        };

    })