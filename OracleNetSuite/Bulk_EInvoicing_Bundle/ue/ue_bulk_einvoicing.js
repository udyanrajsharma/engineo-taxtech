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
                var generated_bulk_edoc = currRecord.getValue('custbody_psg_ei_generated_bulk_edoc');
             if(generated_bulk_edoc != ""){
				 
				  var generated_edocField = form.getField({
            id: 'custbody_psg_ei_generated_edoc',
        });
        if (generated_edocField) {
            generated_edocField.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.HIDDEN,
            });
        }
				 
			 }else{
                 var generated_edocField = form.getField({
            id: 'custbody_psg_ei_generated_bulk_edoc',
        });
        if (generated_edocField) {
            generated_edocField.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.HIDDEN,
            });
        }
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
