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
                var subsidiary = currRecord.getValue('subsidiary');
                var irn = currRecord.getValue('custbody_edoc_irn');
				if(subsidiary == 10){
					 form.clientScriptModulePath ="../cs/cs_einvoice.js";
                var ei_status = currRecord.getValue('custbody_ei_status');
                var type = currRecord.getValue('type');
				 log.debug('context.type  type', JSON.stringify(type)); 
				if(ei_status == "" || ei_status == 1 || ei_status == 8){ 
				
					if(type == 'custinvc'){
					 log.debug('context.type  type 22222', JSON.stringify(type)); 	
					 var generateButtonParams = {
                            id: "custpage_generate_ei_button",
                            label: 'Generate E-Document',
                            functionName:"generate_edocfile("+
                                currRecord.id +")"
                        };
                        var generateButton =
                            form.addButton(generateButtonParams);
						
				
					}else{
					 log.debug('context.type  type 444444', JSON.stringify(type)); 
					var generateButtonParams = {
                            id: "custpage_generate_ei_button",
                            label: 'Generate E-Document',
                            functionName:"generate_cm_edocfile("+
                                currRecord.id +")"
                        };
                        var generateButton =
                            form.addButton(generateButtonParams);
						
					}
					
				}
				
				if(type == 'custinvc' || type == 'custcred'){
				if(irn != "" ){
				
					 var generateButtonParams = {
                            id: "custpage_print_button",
                            label: 'Print Invoice',
                            functionName:"print_invoice("+
                                currRecord.id +")"
                        };
                        var generateButton =
                            form.addButton(generateButtonParams);
					
					
				}
				}
				
				
				if(ei_status == 2){
				
					if(type == 'custinvc'){
						
						 var generateButtonParams = {
                            id: "custpage_certify_ei_button",
                            label: 'Certify E-Document',
                            functionName:"certify_edocfile("+
                                currRecord.id +")"
                        };
                        var generateButton =
                            form.addButton(generateButtonParams);
						
						
						
					}else{
						
					 var generateButtonParams = {
                            id: "custpage_certify_ei_button",
                            label: 'Certify E-Document',
                            functionName:"certify_cm_edocfile("+
                                currRecord.id +")"
                        };
                        var generateButton =
                            form.addButton(generateButtonParams);	
						
					}
					
				}

         }
		 }

       
           
           
        }
    

    
 function beforeSubmit(context) {
	 
	   if (context.type !== context.UserEventType.DELETE) {
		   var currRecord = context.newRecord;
				var oldRecord = context.oldRecord;
		    log.debug('context.type', JSON.stringify(context.type)); 
		     var remove_data = false;
			if (context.type == 'create'){
				  var entity = currRecord.getValue('entity');
				  var billstate = currRecord.getValue('billstate');
				  //var shipaddresslist = currRecord.getValue('shipaddresslist');
				  log.debug('entity -------   '+entity, JSON.stringify(billstate));  
				remove_data = true;
				
			}
			if (context.type == 'edit'){
				
				var field_change = getFieldValue('entity', oldRecord, currRecord);
				 var entity = currRecord.getValue('entity');
				  var billstate = currRecord.getValue('billstate');
				  //var shipaddresslist = currRecord.getValue('shipaddresslist');
				  log.debug('entity -------   '+entity, JSON.stringify(billstate));  
				if(field_change){
					remove_data = true;
				}
				
				
			}
			if(remove_data){
				Remove_edoc_data(currRecord);
				
			}
		   
	   }
	 
	 
 }
 
 
 function Remove_edoc_data(newrec) {
	 
	 newrec.setValue('custbody_ei_status', 	1);
	 newrec.setValue('custbody_certified_edoc', "");
	 newrec.setValue('custbody_ack_date_einvoice', 	"");
	 newrec.setValue('custbody_einvoice_gen_date', 	"");
    newrec.setValue('custbody_generated_pdf', 	"");
	 newrec.setValue('custbody_einvoice_error', "");
	 newrec.setValue('custbody_edoc_irn', "");
	 newrec.setValue('custbody_edoc_ackno', "");
	 newrec.setValue('custbody_edoc_status', "");
    newrec.setValue('custbody_generated_edoc_file', "");

   
	 
	 
 }
 /**
     * Gets the Field Value from new or old record
     *
     * @param {String} fieldId Field Id
     * @param {Object} oldRecord Old record object
     * @param {Object} newRecord New record object
     * @returns {*}
     */
    function getFieldValue(fieldId, oldRecord, newRecord) {
        var field_change = false;
        var modifiedFields = newRecord.getFields();
		  var entity = newRecord.getValue('entity');
		  var subtotal = newRecord.getValue('subtotal');
		  var location_v = newRecord.getValue('location');
		  var taxtotal = newRecord.getValue('taxtotal');
		  var total = newRecord.getValue('total');
		  var shipaddress = newRecord.getValue('shipaddress');
		  var billaddress = newRecord.getValue('billaddress');
		  
		  
		   var old_entity = oldRecord.getValue('entity');
		  var old_subtotal = oldRecord.getValue('subtotal');
		  var old_location_v = oldRecord.getValue('location');
		  var old_taxtotal = oldRecord.getValue('taxtotal');
		  var old_total = oldRecord.getValue('total');
		  var old_shipaddress = oldRecord.getValue('shipaddress');
		  var old_billaddress = oldRecord.getValue('billaddress');
		  
		  if((total != old_total) || (billaddress != old_billaddress) || (shipaddress != old_shipaddress) || (entity != old_entity) || (subtotal != old_subtotal) || (location_v != old_location_v) || (taxtotal != old_taxtotal)){
			field_change = true;  
		  }
		
    return field_change;
    }
  

  
   
   
   
   
   

    
    return {
        beforeLoad: beforeLoad,
		beforeSubmit: beforeSubmit
    };
});
