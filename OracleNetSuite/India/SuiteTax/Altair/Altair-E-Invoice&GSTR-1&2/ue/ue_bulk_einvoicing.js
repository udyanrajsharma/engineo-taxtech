/**
 * @NApiVersion 2.0
 * @NScriptName E-Document Bulk E-Invoice UE
 * @NScriptId _edoc_bulk_transaction_ue
 * @NScriptType usereventscript
 *
 * @NModuleScope Public
 */
define([
    "N/search",
    "N/runtime",
    "N/redirect",
    "N/ui/serverWidget",
   
    "N/error",
    "N/url"
], function (
    search,
   runtime,
    redirect,
    serverWidget,
    error,
    url
) {
   

    function beforeLoad(context) {
        var currRecord = context.newRecord;
		 var recordType = currRecord.type;
		 
		 log.debug('recordType ', JSON.stringify(recordType));
		 
		 
         if (context.type === context.UserEventType.VIEW) {
              var form = context.form;
			   var subsidiary = currRecord.getValue('subsidiary');
			   if(subsidiary == 43){
				   form.clientScriptModulePath ="../lib/cs_bulk_einvoicing.js";
                var generated_bulk_edoc = currRecord.getValue('custbody_psg_ei_generated_edoc');
				var irn = currRecord.getValue('custbody_in_ei_irn');
				var b2c_transaction_id = currRecord.getValue('custbody_b2c_transaction_id');

                 var approvalstatus = currRecord.getText('approvalstatus');
			
log.debug('approvalstatus ', JSON.stringify(approvalstatus));
				
             if(generated_bulk_edoc != ""){
				 
				  var generated_edocField = form.getField({
            id: 'custbody_psg_ei_generated_bulk_edoc',
        });
        if (generated_edocField) {
            generated_edocField.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.HIDDEN,
            });
        }
				 
			 }else{
                 var generated_edocField = form.getField({
            id: 'custbody_psg_ei_generated_edoc',
        });
        if (generated_edocField) {
            generated_edocField.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.HIDDEN,
            });
        }
			 } 

              var send_ei_button = form.getButton({ id: 'custpage_send_ei_button' });
		 if (send_ei_button) {
		 send_ei_button.isHidden = true;
		 }
		 
		 if(irn != "" || b2c_transaction_id != ""){
				
					 var generateButtonParams = {
                            id: "custpage_print_button",
                            label: 'Print E-Invoice',
                            functionName:"print_invoice("+
                                currRecord.id +")"
                        };
                        var generateButton =
                            form.addButton(generateButtonParams);
					
					
				}
				
				if(recordType == 'creditmemo'){
				
					if(irn == "" && b2c_transaction_id == ""){
				
					 var generateButtonParams = {
                            id: "custpage_einvoice_button",
                            label: 'Generate & Certify E-Invoice',
                            functionName:"generate_invoice("+
                                currRecord.id +")"
                        };
                        var generateButton =
                            form.addButton(generateButtonParams);
					
					
				}				
					
				}else{
					
					 if(irn == "" && b2c_transaction_id == "" && approvalstatus == "Approved"){
				
					 var generateButtonParams = {
                            id: "custpage_einvoice_button",
                            label: 'Generate & Certify E-Invoice',
                            functionName:"generate_invoice("+
                                currRecord.id +")"
                        };
                        var generateButton =
                            form.addButton(generateButtonParams);
					
					
				}
					
				}
			
				
         }

		 }
           
           
        }
    


    
    return {
        beforeLoad: beforeLoad
    };
});
