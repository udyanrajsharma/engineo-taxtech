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
    	
		var objRecord = record.load({
			type: record.Type.INVOICE,
				id: invoice_id_map
			});
			
			var tranid = objRecord.getValue({fieldId: 'tranid'});
			var entity = objRecord.getValue({fieldId: 'entity'});
			var generated_pdf = objRecord.getValue({fieldId: 'custbody_edoc_generated_pdf'});
			var subtotal = objRecord.getValue({fieldId: 'subtotal'});
			var taxtotal = objRecord.getValue({fieldId: 'taxtotal'});
			var igst = objRecord.getValue({fieldId: 'taxtotal94'});
			var cgst = objRecord.getValue({fieldId: 'taxtotal95'});
			var sgst = objRecord.getValue({fieldId: 'taxtotal96'});
			var total = objRecord.getValue({fieldId: 'total'});
			var amountremainingtotalbox = objRecord.getValue({fieldId: 'amountremainingtotalbox'});
		
log.debug('summary summary subtotal --', subtotal+ " --tax--"+taxtotal+" -igst--"+igst+"--sgst--- "+sgst+" --cgst--"+cgst ); 
		
		
			var customerRecord = record.load({
			type: 'customer',
				id: entity
			});
			
			var entity_email = customerRecord.getValue({fieldId: 'email'});
			
			if(entity_email != ""){
			
			var senderId = email_sender;
		var email_body = '<p >Your invoice details are as follows: </p>';
		var email_body3 = '<br>';
		var email_body1 = '<table border="1">';
	
	var email_body7 = '<tr><td colspan="2"><strong>Summary</strong></td></tr>';
	
	var msg_val = "<tr><td>SUBTOTAL &nbsp;&nbsp;&nbsp;&nbsp;</td><td>"+subtotal+"</td></tr>";
	var msg_val1 = "<tr><td>TAX TOTAL</td><td>"+taxtotal+"</td></tr>";
	if(igst != "" && igst != undefined){
		
	var msg_val2 = "<tr><td>IGST</td><td>"+igst+"</td></tr>";
	}
	if(cgst != "" && cgst != undefined){
		
	var msg_val2 = "<tr><td>CGST</td><td>"+cgst+"</td></tr>";
	}
	if(sgst != "" && sgst != undefined){
		
	var msg_val2 = "<tr><td>SGST</td><td>"+sgst+"</td></tr>";
	}
	var msg_val3 = "<tr><td>TOTAL</td><td>"+total+"</td></tr>";
			 
	
	
	var email_body2 = '</table>';	
		
	var email_body4 = 'Thanks<br>';
		
			 message_array+=email_body;
			 message_array+=email_body3;
			 message_array+=email_body1;
			 message_array+=email_body7;
			 message_array+=msg_val;
			 message_array+=msg_val1;
			 message_array+=msg_val2;
			 message_array+=msg_val3;
			 message_array+=email_body2;
			 message_array+=email_body3;
			 message_array+=email_body3;
			 message_array+=email_body4;
			
			
	

	var email_bodyy = 	message_array;
		var fileObj = file.load({id: generated_pdf});
		
		var emailattributes = {
					author : senderId,
					recipients : entity_email,
					subject: tranid+' E-Invoice Attached',
					body :  email_bodyy,
					attachments: [fileObj]
			};
		
		
		
		email.send(emailattributes);
			
		objRecord.setValue({ fieldId: 'custbody_psg_ei_status', value: 4});
			}else{
		objRecord.setValue({ fieldId: 'custbody_psg_ei_status', value: 8});
			}
		
		var recordId = objRecord.save();			
		

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

         
		  
		  var senderId = 53024;
			var email_body = '<p > E-Documents Sending process complete. </p>';
		
	var email_body1 = '<table border="1">';
	
	var email_body7 = '<tr><td><strong>Invoice #</strong></td><td><strong>Status </strong></td></tr>';
	
	
	
	var email_body2 = '</table>';	
	var email_body3 = '<br>';	
	var email_body4 = 'Thanks<br>';

	
	var email_bodyy = 	email_body+email_body3+email_body1+email_body7+msg_val+email_body2+email_body3+email_body4;
	
		var recipientId = 'imam08013@gmail.com';
		
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
