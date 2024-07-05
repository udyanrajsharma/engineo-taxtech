/**
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * @NModuleScope Public
 */
define(['N/currentRecord','N/url','N/https','N/ui/message'],

function(currentRecord,url,https,message) {
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
		
		currentRecord = scriptContext.currentRecord;
		
		  
	
    //	 alert('test');
//var start_date_val = record.getValue({fieldId:'custpage_flag_value'});
    	//alert(start_date_val);
    }
	
	
	
	 function fieldChanged(context) {
        var currentRecord = context.currentRecord;
        var sublistFieldName = context.fieldId;
	var payee_list = currentRecord.getLineCount({sublistId: 'custpage_sublist'}) ;
		
		var ei_status_old = 0;
		 for (var i = 0; i < payee_list; i++) {
			 var checkbox_id = currentRecord.getSublistValue({sublistId: 'custpage_sublist', fieldId: 'custpage_checkbox',line: i});
			 if(checkbox_id == true){
				  ei_status = currentRecord.getSublistValue({sublistId: 'custpage_sublist', fieldId: 'custpage_ei_status',line: i}); 
			if(ei_status_old != 0 && ei_status_old != ei_status){
				
				//alert("Please select only one type of document status");
				
				
			}
			if(ei_status_old == 0){
				ei_status_old = ei_status;
			}
			
			
			
			
			}
		 }
		
		
		
       
    }

    function refreshpage(){
    	window.onbeforeunload = null;
		window.location.reload();
    }
	
	function generateEdoc(context){
		
    
		  var myMsg3 = message.create({
        title: 'Message!',
        message: 'E-Documents Generation and Certification is in-progress you will receive an email once its completed',
        type: message.Type.INFORMATION,
        duration: 20000
    });
	myMsg3.show();
		
		  var invoice_id = [];
		 var payee_list = currentRecord.getLineCount({sublistId: 'custpage_sublist'}) ;
		
		var ei_status_old = 0;
		 for (var i = 0; i < payee_list; i++) {
			 var checkbox_id = currentRecord.getSublistValue({sublistId: 'custpage_sublist', fieldId: 'custpage_checkbox',line: i});
			 if(checkbox_id == true){
			 var internal_id = currentRecord.getSublistValue({sublistId: 'custpage_sublist', fieldId: 'custpage_internal_id',line: i});	 
			invoice_id.push(internal_id);	 
		 }
		 
		 }
		
	
	 var suiteletURL = url.resolveScript({
                scriptId: 'customscript_eincoice_task_call',
                deploymentId: 'customdeploy_eincoice_task_call'
               
            });
			
			var response = https.post({url: suiteletURL, body:  {invoice_data: JSON.stringify(invoice_id) }});

	
		 
    }
	
	
	function sendEdoc(context){
		
    
		  var myMsg3 = message.create({
        title: 'Message!',
        message: 'E-Documents Sending is in-progress you will receive an email once its completed',
        type: message.Type.INFORMATION,
        duration: 20000
    });
	myMsg3.show();
		
		  var invoice_id = [];
		 var payee_list = currentRecord.getLineCount({sublistId: 'custpage_sublist'}) ;
		
		var ei_status_old = 0;
		 for (var i = 0; i < payee_list; i++) {
			 var checkbox_id = currentRecord.getSublistValue({sublistId: 'custpage_sublist', fieldId: 'custpage_checkbox',line: i});
			 if(checkbox_id == true){
			 var internal_id = currentRecord.getSublistValue({sublistId: 'custpage_sublist', fieldId: 'custpage_internal_id',line: i});	 
			invoice_id.push(internal_id);	 
		 }
		 
		 }
		
	
	 var suiteletURL = url.resolveScript({
                scriptId: 'customscript_sl_to_generates_edoc_email',
                deploymentId: 'customdeploy_sl_to_generates_edoc_email'
               
            });
			
			var response = https.post({url: suiteletURL, body:  {invoice_data: JSON.stringify(invoice_id) }});

	
		 
    }
	

    return {
        pageInit: pageInit,
		fieldChanged: fieldChanged,
		generateEdoc: generateEdoc,
		sendEdoc: sendEdoc,
		
    	refreshpage:refreshpage
    };
    
});
