/**
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * @NModuleScope Public
 */
define(['N/currentRecord','N/url','N/https','N/ui/message', "../lib/common_2.0", "N/https", "N/url",'N/search'],

function(currentRecord,url,https,message,common, https,url,search) {
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
			var post_value = currentRecord.getValue({fieldId: 'custpage_post_value'});
			if(post_value == 1){
		  var myMsg_val = message.create({
        title: 'Message!',
        message: 'E-invoice cancallation is done please click on back button to cancel another E-invoice',
        type: message.Type.CONFIRMATION,
        duration: 20000
    });
	myMsg_val.show();
			}
		  
	
    //	 alert('test');
//var start_date_val = record.getValue({fieldId:'custpage_flag_value'});
    	//alert(start_date_val);
    }
	
	
	
	
	 function fieldChanged(context) {
        var currentRecord = context.currentRecord;
        var sublistFieldName = context.fieldId;
		if(sublistFieldName == 'custpage_select_invoice'){
		var select_invoice = currentRecord.getText({fieldId: 'custpage_select_invoice'});
		if(select_invoice != ""){
			 var sub_list = currentRecord.getLineCount({sublistId: 'custpage_sublist'}) ;
			 
			  for (var i = 0; i < sub_list; i++) {
			 var doc_number = currentRecord.getSublistValue({sublistId: 'custpage_sublist', fieldId: 'custpage_doc_number',line: i});
			 if(doc_number == select_invoice){
			 var ei_irn = currentRecord.getSublistValue({sublistId: 'custpage_sublist', fieldId: 'custpage_ei_irn',line: i});
			 
			 currentRecord.setValue({fieldId: 'custpage_irn_value',  value: ei_irn});
			 currentRecord.getField("custpage_irn_value").isDisabled = true;

				
			 
		 }
		 
		 }
		 
		}
		
		}
	 
		
		
		if(sublistFieldName == 'custpage_start_date' || sublistFieldName == 'custpage_end_date'){
			var start_date = currentRecord.getValue({fieldId: 'custpage_start_date'});
			var end_date = currentRecord.getValue({fieldId: 'custpage_end_date'});
			if(start_date != "" && end_date != ""){
				if(start_date > end_date){
					alert("Please select Valid Start Date and End Date");
				} 
				
			}
			
			
		}
	
		
		
		
       
    }

    function refreshpage(){
    	window.onbeforeunload = null;
		window.location.reload();
    }
	
	function goBack() {
      history.back();
	
	  
    }
	
	
	function CancelEdoc(context){
		
  
		
	
	var select_invoice = currentRecord.getValue({fieldId: 'custpage_select_invoice'});
	var cancel_reason = currentRecord.getValue({fieldId: 'custpage_cancel_reason'});
	var cancel_remark = currentRecord.getValue({fieldId: 'custpage_cancel_remark'});
	 
	 if(select_invoice == ""){
		alert ("Please Select Invoice To Cancel");
		return false;
	}
	if(cancel_reason == ""){
		alert ("Please Select Reason");
		return false;
	}
	
	if(cancel_remark == ""){
		alert ("Please Add Remark");
		return false;
	}


	var fieldLookUp = search.lookupFields({
    type: search.Type.INVOICE,
    id: select_invoice,
    columns: ['custbody_in_ei_irn']
});	
var irn = fieldLookUp.custbody_in_ei_irn;


psg_ei_content =	[
{
  "irn": irn,
  "CnlRsn": cancel_reason,
  "CnlRem": cancel_remark
}
];

 var suiteletURL = url.resolveScript({
                scriptId: 'customscript_sl_to_cancel_einvoice',
                deploymentId: 'customdeploy_sl_to_cancel_einvoice'
               
            });
			
			var response = https.post({url: suiteletURL, body:  {invoice_data: select_invoice,cancel_reason :cancel_reason,cancel_remark :cancel_remark  }});

	//var response = https.put({ url: url_new,body: JSON.stringify(psg_ei_content),headers: headerObj});
//alert(JSON.stringify(response.body));
			alert("IRN cancallation is done");	
			window.onbeforeunload = null;
			window.location.reload();	
	
		 
    }
	
	
	

	

    return {
        pageInit: pageInit,
		fieldChanged: fieldChanged,
		goBack: goBack,
		CancelEdoc: CancelEdoc,
		
    	refreshpage:refreshpage
    };
    
});
