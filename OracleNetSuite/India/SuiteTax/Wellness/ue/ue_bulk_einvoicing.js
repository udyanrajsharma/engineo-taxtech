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
         if (context.type === context.UserEventType.VIEW) {
              var form = context.form;
			  
			   var in_ei_irn_val = currRecord.getValue('custbody_in_ei_irn');
			   var eway_bill_no = currRecord.getValue('custbody_in_eway_bill_no');
			   var ei_status = currRecord.getValue('custbody_psg_ei_status');
			   var transport_dist = currRecord.getValue('custbody_in_eway_transport_dist');
			   var eway_bill_date = currRecord.getValue('custbody_eway_bill_date');
			   
			    var eway_bill_error = form.getField({ id: 'custbody_eway_bill_error'});
			   
			     if (eway_bill_date != "") {
				 var eway_bill_date_main = form.getField({ id: 'custbody_in_eway_bill_date'});
				 var valid_until_date = form.getField({ id: 'custbody_in_eway_bill_valid_until_date'});
				 
            eway_bill_date_main.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.HIDDEN,
            });
			            valid_until_date.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.HIDDEN,
            });
         }else{
			 
			  var eway_bill_date_main = form.getField({ id: 'custbody_eway_bill_date'});
				 var valid_until_date = form.getField({ id: 'custbody_eway_bill_valid_untill'});
				 
            eway_bill_date_main.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.HIDDEN,
            });
			            valid_until_date.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.HIDDEN,
            });
			 
			 
		 }
		 
			   
			   if(eway_bill_no == ""){
				    form.clientScriptModulePath ="../lib/cs_ewaybill.js";
					 var generateButtonParams = {
                            id: "custpage_generate_eway_button",
                            label: 'Generate E-Way Bill',
                            functionName:"generate_ewaybill("+
                                currRecord.id +")"
                        };
                        var generateButton =
                            form.addButton(generateButtonParams);
			   }
			   var eway_bill_error_value = currRecord.getValue('custbody_eway_bill_error');
			   if(eway_bill_error_value == ""){
			   var eway_bill_error = form.getField({ id: 'custbody_eway_bill_error'});
			   
			     if (eway_bill_error) {
            eway_bill_error.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.HIDDEN,
            });
         }
			   }
                var generated_bulk_edoc = currRecord.getValue('custbody_psg_ei_generated_edoc');
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
         }

       
           
           
        }
    

    

    function hideNetworkFields(form) {
        var networkReferenceIdField = form.getField({
            id: NETWORK_REFERENCE_ID,
        });
        if (networkReferenceIdField) {
            networkReferenceIdField.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.HIDDEN,
            });
        }

        var networkNameField = form.getField({
            id: NETWORK_NAME,
        });
        if (networkNameField) {
            networkNameField.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.HIDDEN,
            });
        }

        var networkStatusField = form.getField({
            id: NETWORK_STATUS,
        });
        if (networkStatusField) {
            networkStatusField.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.HIDDEN,
            });
        }

        var networkUpdatedDateTimeField = form.getField({
            id: NETWORK_UPDATED_DATE_TIME,
        });
        if (networkUpdatedDateTimeField) {
            networkUpdatedDateTimeField.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.HIDDEN,
            });
        }
    }

  

  
   
   
   
   
   

    
    return {
        beforeLoad: beforeLoad
    };
});
