/**
 * @NApiVersion 2.0
 * @NScriptType MapReduceScript
 * @NModuleScope Public
 */

var emailObj = {};

define(['N/record', 'N/search', 'N/runtime', "N/error", 'N/file', 'N/task', "../lib/common_2.0","../lib/moment.js",'N/url','N/https','N/email','N/render'],

		
function(record, search, runtime, error, file, task,common,moment,url,https,email,render) {
	var sessionobj = runtime.getCurrentSession();
	var scriptObj = runtime.getCurrentScript();
	var userObj = runtime.getCurrentUser();
	var file_id;
	var inv_pdf_folder = 45840;
	var invoice_data = scriptObj.getParameter('custscript_invoice_data_map_email');
	var email_sender = scriptObj.getParameter('custscript_bulk_email_sender');
		var invoice_data =	JSON.parse(invoice_data);
		
	
    /**
     * Marks the beginning of the Map/Reduce process and generates input data.
     *
     * @typedef {Object} ObjectRef
     * @property {number} id - Internal ID of the record instance
     * @property {string} type - Record type id
     *
     * @return {Array|Object|Search|RecordRef} inputSummary
     * @since 2015.1
     */
    function getInputData() {
     
	    var inputData = convertToInputData(invoice_data);
    	return inputData;
    }
    
    /**
     * Executes when the map entry point is triggered and applies to each key/value pair.
     *
     * @param {MapSummary} context - Data collection containing the key/value pairs to process through the map stage
     * @since 2015.1
     */
    function map(context) {
         var contextVal = JSON.parse(context.value);
		var message_array="";
		var invoice_id_map =  contextVal.internal_id;
    	
		var Create_Invoicepdf = CreateInvoicePdf(invoice_id_map);
		var certify_Details = SendEmail(invoice_id_map);
		
		context.write(invoice_id_map, certify_Details);
	}
		
		function SendEmail(invoice_id_map) 
	{
		var objRecord = record.load({
			type: record.Type.INVOICE,
				id: invoice_id_map
			});
			
			var tranid = objRecord.getValue({fieldId: 'tranid'});
			var trandate = objRecord.getValue({fieldId: 'trandate'});
			year = trandate.getFullYear();
			 trandate = FormatDateString(trandate,'DD/MM/YYYY');
			//	var	 year = FormatDateString(trandate,'YYYY');
log.debug('year year', JSON.stringify(year));  
			var duedate = objRecord.getValue({fieldId: 'duedate'});
			 duedate = FormatDateString(duedate,'DD/MM/YYYY');	
			log.debug('duedate duedate', JSON.stringify(duedate));  
			var entity = objRecord.getValue({fieldId: 'entity'});
			var generated_pdf = objRecord.getValue({fieldId: 'custbody_edoc_generated_pdf'});
			log.debug('generated_pdf generated_pdf', JSON.stringify(generated_pdf)); 
			log.debug('file_id file_id', JSON.stringify(file_id)); 
			var subtotal = objRecord.getValue({fieldId: 'subtotal'});
			var postingperiod = objRecord.getText({fieldId: 'postingperiod'});
			log.debug('postingperiod postingperiod', JSON.stringify(postingperiod));  
			var taxtotal = objRecord.getValue({fieldId: 'taxtotal'});
			var igst = objRecord.getValue({fieldId: 'taxtotal94'});
			var cgst = objRecord.getValue({fieldId: 'taxtotal95'});
			var sgst = objRecord.getValue({fieldId: 'taxtotal96'});
			var vm_email_template = objRecord.getValue({fieldId: 'custbody_vm_edoc_emailtemplate'});
			var total = objRecord.getValue({fieldId: 'total'});
			var amountremainingtotalbox = objRecord.getValue({fieldId: 'amountremainingtotalbox'});
		
			if(vm_email_template != ""){
			
				var email_temp = record.load({type: 'customrecord_vm_edoc_emailtemplate',	id: vm_email_template});
				
			}else{
					var email_temp = record.load({type: 'customrecord_vm_edoc_emailtemplate',	id: 3});
			}
			
			log.debug('email_temp email_temp', JSON.stringify(email_temp)); 
			
			var email_template = email_temp.getValue({fieldId: 'custrecord_email_template'});
			var email_subject = email_temp.getValue({fieldId: 'custrecord_email_subject'});
			
			
		
			var customerRecord = record.load({
			type: 'customer',
				id: entity
			});
			
			var entity_email = customerRecord.getValue({fieldId: 'email'});
			
			
			if(entity_email != ""){
			
			var senderId = email_sender;
		
			 var email_subject = email_subject.replace('#tranid', tranid);
			 var email_template = email_template.replace('#trandate', postingperiod);
			 var email_template = email_template.replace('#Year', year);
			 var email_template = email_template.replace('#duedate', duedate);
			
			//log.debug('email_subject email_subject', JSON.stringify(email_subject)); 
			//log.debug('email_template email_template', JSON.stringify(email_template)); 
		//	log.debug(' email_sender', JSON.stringify(email_sender)); 
			//log.debug('entity_email', JSON.stringify(entity_email)); 

		var fileObj = file.load({id: generated_pdf});
		
		var emailattributes = {
					author : senderId,
					recipients : entity_email,
					subject: email_subject,
					body :  email_template,
                 relatedRecords :  { transactionId: invoice_id_map } ,
					attachments: [fileObj]
			};
		
		
		
		email.send(emailattributes);
			
		objRecord.setValue({ fieldId: 'custbody_psg_ei_status', value: 4});
			}else{
		objRecord.setValue({ fieldId: 'custbody_psg_ei_status', value: 8});
			}
		
		var recordId = objRecord.save();			
		log.debug('recordId recordId', JSON.stringify(recordId));

   }
	
	
	
	function CreateInvoicePdf(invoice_id) {
			
		invoice_id =	Number(invoice_id);
			 log.debug('invoice_data CreateInvoicePdf', invoice_id); 
			
				var transactionFile = render.transaction({entityId: invoice_id,printMode: render.PrintMode.PDF,formId: 157});
	

					transactionFile.folder = inv_pdf_folder;
					 file_id = transactionFile.save();
log.debug('invoice_data CreateInvoicePdf file_id', file_id); 
         var otherId = record.submitFields({type: record.Type.INVOICE,id: invoice_id,values: {'custbody_edoc_generated_pdf': file_id}});
	

        }
	
	 function convertToInputData(invoice_data) {
       

        var inputData = [];
        for (var a = 0; a < invoice_data.length; a++) {
            var inputObj = {};

			inputObj['internal_id'] = invoice_data[a];
			inputData.push(inputObj);
        }

        return inputData;
    }
	
	
	
	
	function FormatDateString(dateString,userDateFormat) 
	{
		
		return moment(dateString).format(userDateFormat);
	}
	
	
	
	
	
		
		
		function SendFileEmail(msg_val) {

         
		  
		  var senderId = email_sender;
			var email_body = '<p > E-Documents Sending process complete. </p>';
		
	var email_body1 = '<table border="1">';
	
	var email_body7 = '<tr><td><strong>Invoice #</strong></td><td><strong>Status </strong></td></tr>';
	
	
	
	var email_body2 = '</table>';	
	var email_body3 = '<br>';	
	var email_body4 = 'Thanks<br>';

	
	var email_bodyy = 	email_body+email_body3+email_body1+email_body7+msg_val+email_body2+email_body3+email_body4;
	
	
		var resp = userObj.email;
			var recipientId = resp;
		var emailattributes = {
					author : senderId,
					recipients : recipientId,
					subject: 'E-Documents Sending Process Email',
					body :  email_bodyy
			};
		
		
		
		email.send(emailattributes);
	

        }
		
	

   


    /**
     * Executes when the summarize entry point is triggered and applies to the result set.
     *
     * @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
     * @since 2015.1
     */
    function summarize(summary) {
    	log.debug('inside summary method...');
	    
		log.debug('summary summary', JSON.stringify(summary)); 
		
		var msg_val = GetEinvoice_status(invoice_data);
		
		
		var Create_Invoicepdf = SendFileEmail(msg_val);		
	    	
    }
    
	

	function GetEinvoice_status(invoice_data) 
	{
		
		 var filters=[  ["type","anyof","CustInvc"], 
      "AND", 
      ["mainline","is","T"], 
      "AND", 
      ["internalid","anyof",invoice_data] ];
	  
	  var columns=[
	   search.createColumn({name: "custbody_psg_ei_status", label: "ei_status"}),
	   search.createColumn({name: "tranid", label: "tranid"})
     
	  
	  ]; 
	  var message_ar ="";
	  var invoice_data = common.searchAllRecord('invoice',null,filters,columns); 
			var invoice_Details = common.pushSearchResultIntoArray(invoice_data);
			
			 for (var b = 0; b < invoice_Details.length; b++) {
			var ei_status = invoice_Details[b].ei_status;
			var tranid = invoice_Details[b].tranid;
			if(ei_status == 4){
				var success_msg = 'Success';	
			}else{
				
			var success_msg = 'Failled';		
			}
				var msg_val = "<tr><td>"+tranid+"</td><td>"+success_msg+"</td></tr>";
			 message_ar+=msg_val;
			
			}
		
		
return message_ar;		
	
	}


    return {
        getInputData: getInputData,
        map: map,
        summarize: summarize
    };
    
});
