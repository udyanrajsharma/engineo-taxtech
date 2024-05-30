/**
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * @NModuleScope Public
 * @record customrecord_item_brand
 */
define(['N/record','N/search','../lib/common_2.0','N/ui/message','N/currentRecord','N/url','N/https'], function(record,search,common,message,currentRecord,url,https) {

var paayee_percen_old;
 function pageInit(context) {
      
	   var currentRecord = context.currentRecord;
         log.debug('currentRecord currentRecord', JSON.stringify(currentRecord));  
    }
	
	
	 function generate_ewaybill(rec_id) {
       
    showProcessMessage(rec_id);
	
	var suiteletURL = url.resolveScript({
                scriptId: 'customscript_sl_to_gen_ewaybill',
                deploymentId: 'customdeploy_sl_to_gen_ewaybill',
            });

			
			var response = https.post({ url: suiteletURL,body: {transId: rec_id } });
		
			if(response.body == 200){
			 redirectAfterProcess( response, rec_id, "generation" );	
				
			}
			
        
    }
	
	
	
	
	 /**
     * Performs redirection/reload after generation/sending
     *
     * @param {Object} result Https response
     * @param {Number} transId Transaction Id
     * @param {String} transType Transaction Type
     * @param {String} process Generation/sending
     */
    function redirectAfterProcess(result, transId, process) {
       
        var recordURL = url.resolveRecord({
            recordType: record.Type.INVOICE,
            recordId: transId,
            isEditMode: false
        });
        window.location = recordURL;
    }
	
	
	
	function showProcessMessage(rec_id){
		
  
		  var myMsg3 = message.create({
        title: 'Message!',
        message: 'E-Way Bill Generation is in-progress',
        type: message.Type.INFORMATION,
        duration: 20000
    });
	myMsg3.show();
		
		 
    }



	

	return {
	   pageInit: pageInit,
		 generate_ewaybill: generate_ewaybill
	};

});