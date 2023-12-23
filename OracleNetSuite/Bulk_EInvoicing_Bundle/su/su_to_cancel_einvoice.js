/**
 * @NApiVersion 2.0
 * @NScriptType Suitelet
 * @NModuleScope Public
 */
define(['N/record', 'N/runtime', 'N/search', 'N/ui/serverWidget', 'N/encode', 'N/file', "../lib/common_2.0", "N/https", "N/url",'N/task'],
    /**
     * @param {record} record
     * @param {runtime} runtime
     * @param {search} search
     */
    function(record, runtime, search, serverWidget, encode, file,common, https,url,task) {

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
			
        

var inv_data =	GetInvoiceToCancel(); 

 var Form = serverWidget.createForm({
                        title: 'Cancel E-Invoice',
                        hideNavBar: false
                    });
					
						
					var select_invoice = Form.addField({
                    id: 'custpage_select_invoice',
                    type: serverWidget.FieldType.SELECT,
                    label: 'Invoice #'
                  
                });
				
				 select_invoice.addSelectOption({ value: '',text: 'Select' });
				 for (var k = 0; k < inv_data.length; k++) { 
				  var internalid = inv_data[k].internalid;
				  var tranid = inv_data[k].tranid;
				 select_invoice.addSelectOption({ value: internalid,text: tranid });
				 }
			
			 var cancel_reason = Form.addField({
                    id: 'custpage_cancel_reason',
                    type: serverWidget.FieldType.SELECT,
                    label: 'Cancel Reason'
                  
                });
				
				 cancel_reason.addSelectOption({ value: '',text: 'Select'});
				 cancel_reason.addSelectOption({ value: '1',text: 'Duplicate'});
				 cancel_reason.addSelectOption({ value: '2',text: 'Data entry mistake'});
				 cancel_reason.addSelectOption({ value: '3',text: 'Order Cancelled'});
				 cancel_reason.addSelectOption({ value: '4',text: 'Others'});
					
		
		//	var response = https.put({ url: url_new,body: JSON.stringify(psg_ei_content),headers: headerObj});

		//		log.debug('json_obj values', JSON.stringify(response));
		//		log.debug('json_obj values body', JSON.parse(response.body));
				
				var irn = Form.addField({
                    id: 'custpage_irn_value',
                    type: serverWidget.FieldType.LONGTEXT,
                    label: 'IRN'
                  
                });
				irn.defaultValue = '';
				var cancel_remark = Form.addField({
                    id: 'custpage_cancel_remark',
                    type: serverWidget.FieldType.LONGTEXT,
                    label: 'Cancel Remark'
                  
                });
				cancel_remark.defaultValue = '';
				
				cancel_remark.setHelpText({
    help : "Add Remark with in 100 char",
	showInlineForAssistant : true
});

		
		   Form.addSubmitButton({
                    label: 'Cancel Edoc'
                });
				
				
		     var sublist = Form.addSublist({
                        id: 'custpage_sublist',
                        type: serverWidget.SublistType.LIST,
                        
                        label: 'Invoice'
                    });
                    
                   var SetSublist = setSublistReorderPoint(sublist, Form, request, response);
		   
		   
				Form.clientScriptModulePath = '../lib/cs_bulk_einvoicing.js';
				   
              response.writePage(Form);
			  
						}else {
							
							
							 var Form = serverWidget.createForm({
                        title: 'Cancel E-Invoice',
                        hideNavBar: false
                    });
					Form.clientScriptModulePath = '../lib/cs_bulk_einvoicing.js';
					Form.addButton({
                    id: 'goBack',
                    label: 'Go Back',
                    functionName: "goBack"
                });
						 var parameters = request.parameters;	
						  var invoice = parameters.custpage_select_invoice;
						  var cancel_reason = parameters.custpage_cancel_reason;
						  var irn_value = parameters.custpage_irn_value;
						  var cancel_remark = parameters.custpage_cancel_remark;
						 log.debug('json_obj invoice', JSON.stringify(invoice));
						 log.debug('json_obj cancel_reason', JSON.stringify(cancel_reason));
						 log.debug('json_obj irn_value', JSON.stringify(irn_value));
						 log.debug('json_obj cancel_remark', JSON.stringify(cancel_remark));
						 
						 var post = Form.addField({
                    id: 'custpage_post_value',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Post'
                  
                });
				post.defaultValue = '1';
				post.updateDisplayType({
    displayType : serverWidget.FieldDisplayType.HIDDEN
});
						 	 
						 
							 var objRecord = record.load({
			type: record.Type.INVOICE,
				id: invoice
			});
				response.writePage(Form);	
				
			var nexus = objRecord.getValue({fieldId: 'nexus'});
			var subsidiary = objRecord.getValue({fieldId: 'subsidiary'});
			var irn = objRecord.getValue({fieldId: 'custbody_in_ei_irn'});
			var Seller_Details = GetSellerDetails(subsidiary, nexus);	 
		var Api_Token = GetApiToken(Seller_Details[0].taxregistrationnumber);
		var token_val = Api_Token[0].token;			
		var gstin_val = Api_Token[0].gstin;	
		
		var headerObj = new Array();
		headerObj['X-Cleartax-Auth-Token'] = token_val;	
		headerObj['Content-Type'] = 'application/json';	
		headerObj['Accept'] = 'application/json';	
		headerObj['gstin'] = gstin_val;	
		
		var url_new = 'https://api-sandbox.clear.in/einv/v2/eInvoice/cancel';
		
 log.debug('url_new url_new', JSON.stringify(url_new));


psg_ei_content =	[
{
  "irn": irn,
  "CnlRsn": cancel_reason,
  "CnlRem": cancel_remark
}
];

 log.debug('json_obj psg_ei_content', JSON.stringify(psg_ei_content));
					
var response = https.put({ url: url_new,body: JSON.stringify(psg_ei_content),headers: headerObj});	
 log.debug('json_obj response', JSON.stringify(response.body));
var body_val = JSON.parse(response.body);
var is_success =	body_val[0].govt_response.Success;				
				if(is_success == 'Y'){
				
			objRecord.setValue({ fieldId: 'custbody_in_ei_irn', value: body_val[0].govt_response.Irn});
			objRecord.setValue({ fieldId: 'custbody_in_ei_ackno', value: body_val[0].govt_response.AckNo});
            objRecord.setValue({ fieldId: 'custbody_ack_date_bulk_einvoice', value: body_val[0].govt_response.AckDt});
			objRecord.setValue({ fieldId: 'custbody_in_ei_irn_status', value: body_val[0].govt_response.Success});
			objRecord.setValue({ fieldId: 'custbody_in_ei_qrcode', value: body_val[0].govt_response.SignedQRCode});
			objRecord.setValue({ fieldId: 'custbody_in_ei_signedinv', value: body_val[0].govt_response.SignedInvoice});
			objRecord.setValue({ fieldId: 'custbody_psg_ei_status', value: 17});

				var recordId = objRecord.save();			
				}
						
					
					
		}
            

        }
		
		
		function GetSellerDetails(subsidiary,nexus) 
	{
		
		 log.debug('GetSellerDetails nexus', JSON.stringify(subsidiary)); 
		
		 var filters=[  ["internalid","anyof",subsidiary], 
      "AND", 
      ["nexuscountry","anyof","IN"], 
      "AND", 
      ["nexus","anyof",nexus] ];
	  
	  var columns=[
	  search.createColumn({name: "namenohierarchy",label: "name"}),
      search.createColumn({name: "city", label: "city"}),
      search.createColumn({name: "state", label: "state"}),
      search.createColumn({name: "country", label: "country"}),
      search.createColumn({name: "currency", label: "currency"}),
      search.createColumn({name: "legalname", label: "legalname"}),
      search.createColumn({name: "address1", label: "address1"}),
      search.createColumn({name: "address2", label: "address2"}),
      search.createColumn({name: "zip", label: "zip"}),
      search.createColumn({name: "taxregistrationnumber", label: "taxregistrationnumber"})
     
	  
	  ]; 
	  
	  var subsidiary_data = common.searchAllRecord('subsidiary',null,filters,columns); 
			var Seller_Details = common.pushSearchResultIntoArray(subsidiary_data);
		
		
return Seller_Details;		
	
	}
		
		function GetApiToken(gstin) 
	{
		
		 var filters=[  ["custrecord_api_gstin","is",gstin] ];
	  
	  var columns=[
	 search.createColumn({name: "custrecord_api_gstin", label: "gstin"}),
      search.createColumn({name: "custrecord_api_token", label: "token"})
     
	  
	  ]; 
	  
	  var token_data = common.searchAllRecord('customrecord_gstin_token_for_api',null,filters,columns); 
			var Token_Details = common.pushSearchResultIntoArray(token_data);
		
		log.debug('Token_Details Token_Details', JSON.stringify(Token_Details)); 
return Token_Details;		
	
	}
		
		
		function GetInvoiceToCancel()
	{
		var FiltersArray=[  ["type","anyof","CustInvc"], 
      "AND", 
      ["mainline","is","T"], 
      "AND", 
       ["custbody_psg_ei_status","anyof","3","4"], 
      "AND", 
      ["memorized","is","F"], 
      "AND", 
      ["custbody_psg_ei_template","noneof","@NONE@"], "AND",   [["custbody_bulk_einvoice_gen_date","after","twodaysago"],"OR",["custbody_in_ei_ackdt","after","twodaysago"]] ];
	  
	  
	   var ColumnsArray = [
				search.createColumn({name: "tranid",sort: search.Sort.DESC, label: "tranid" }),				 
				 search.createColumn({name: "internalid", label: "internalid"}),
				 search.createColumn({name: "custbody_ack_date_bulk_einvoice", label: "ack_date"})
       ];
	   var InvObj = common.searchAllRecord('invoice',null,FiltersArray,ColumnsArray);
			var data_invoice = common.pushSearchResultIntoArray(InvObj);
			
				 log.debug('InvObj', JSON.stringify(InvObj));	
				 log.debug('data_invoice', JSON.stringify(data_invoice));
				 return data_invoice;
		
	}
	
	function setSublistReorderPoint(sublist, Form, request, response,start_date,end_date) {
            
			sublist.addField({ id: 'custpage_doc_number',  type: serverWidget.FieldType.TEXT,  label: 'Transaction ID' });
            sublist.addField({ id: 'custpage_customer_name', type: serverWidget.FieldType.TEXT, label: 'Entity' });
            sublist.addField({ id: 'custpage_invoice_date', type: serverWidget.FieldType.DATE, label: 'Invoice Date' });
    
            sublist.addField({ id: 'custpage_memo', type: serverWidget.FieldType.TEXT, label: 'Memo' });
            sublist.addField({ id: 'custpage_currency', type: serverWidget.FieldType.TEXT, label: 'Currency' });
    
            sublist.addField({ id: 'custpage_amount', type: serverWidget.FieldType.TEXT, label: 'Amount' });
             sublist.addField({ id: 'custpage_sending_method', type: serverWidget.FieldType.TEXT, label: 'E-DOCUMENT SENDING METHOD' });
			  sublist.addField({ id: 'custpage_ei_irn', type: serverWidget.FieldType.TEXT, label: 'IRN' });
			sublist.addField({ id: 'custpage_ei_date', type: serverWidget.FieldType.TEXT, label: 'E-Document Date' });
           
            sublist.addField({ id: 'custpage_type', type: serverWidget.FieldType.TEXT, label: 'Type' });
            
            var lineNum = 0;
			
	  
			var FiltersArray=[  ["type","anyof","CustInvc"], 
      "AND", 
      ["mainline","is","T"], 
      "AND", 
       ["custbody_psg_ei_status","anyof","3","4"], 
      "AND", 
      ["memorized","is","F"], 
      "AND", 
      ["custbody_psg_ei_template","noneof","@NONE@"], "AND",  [["custbody_bulk_einvoice_gen_date","after","twodaysago"],"OR",["custbody_in_ei_ackdt","after","twodaysago"]]  ];
			
				 var ColumnsArray = [
				search.createColumn({name: "tranid",sort: search.Sort.DESC, label: "Transaction ID" }),				 
				 search.createColumn({name: "internalid", label: "internalid"}),
				 search.createColumn({name: "tranid", label: "doc_num"}),
      search.createColumn({name: "entity", label: "entity"}),
      search.createColumn({name: "currency", label: "currency"}),
      search.createColumn({name: "amount", label: "amount"}),
      search.createColumn({name: "trandate", label: "trandate"}),
      search.createColumn({name: "custbody_psg_ei_sending_method", label: "sending_method"}),
      search.createColumn({name: "custbody_psg_ei_template", label: "ei_template"}),
      search.createColumn({name: "custbody_psg_ei_status", label: "ei_status"}),
      search.createColumn({name: "custbody_bulk_einvoice_gen_date", label: "einvoice_gen_date"}),
    
	  search.createColumn({ name: "formuladate", formula: "{custbody_in_ei_ackdt}", label: "ei_ackdt"}),
      search.createColumn({name: "custbody_in_ei_irn", label: "ei_irn"}),
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
							  var ei_irn = data_invoice[k].ei_irn;
							 if(ei_irn == ""){
								ei_irn = '-'; 
							 }
							  var einvoice_gen_date = data_invoice[k].einvoice_gen_date;
							 if(einvoice_gen_date == ""){
								 var ei_ackdt = data_invoice[k].ei_ackdt;
								
								einvoice_gen_date = ei_ackdt; 
								if(ei_ackdt == ""){
								einvoice_gen_date = '-'; 
								}
							 }
							 
		
		
		sublist.setSublistValue({ id: 'custpage_doc_number', line: lineNum, value: doc_num });
        sublist.setSublistValue({ id: 'custpage_customer_name', line: lineNum, value: entity });
        sublist.setSublistValue({  id: 'custpage_memo', line: lineNum, value: memo });
        sublist.setSublistValue({  id: 'custpage_currency', line: lineNum, value: currency });
        sublist.setSublistValue({  id: 'custpage_amount', line: lineNum, value: amount });
        sublist.setSublistValue({  id: 'custpage_sending_method', line: lineNum, value: sending_method });
        sublist.setSublistValue({  id: 'custpage_ei_date', line: lineNum, value: einvoice_gen_date });
		sublist.setSublistValue({  id: 'custpage_ei_irn', line: lineNum, value: ei_irn });
        sublist.setSublistValue({  id: 'custpage_type', line: lineNum, value: type });
        sublist.setSublistValue({  id: 'custpage_invoice_date', line: lineNum, value: trandate });
				
				  ++lineNum;			
							}
          
        }
		

       

        return {
            onRequest: onRequest
        };

    });