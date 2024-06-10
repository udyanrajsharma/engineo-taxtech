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
	
	
	
	
	 function generate_cm_edocfile(rec_id) {
	
       
    showProcessMessage(rec_id);
	
	var suiteletURL = url.resolveScript({
                scriptId: 'customscript_sl_to_gen_einvoice',
                deploymentId: 'customdeploy_sl_to_gen_einvoice',
            });

			
			var response = https.post({ url: suiteletURL,body: {transId: rec_id } });
		
			if(response.body == 200){
			 redirectAfterProcessCm( response, rec_id, "generation" );	
				
			}
			
        
    }
	
	
	 function generate_edocfile(rec_id) {
      
    showProcessMessage(rec_id);
	
	var suiteletURL = url.resolveScript({
                scriptId: 'customscript_sl_to_gen_einvoice',
                deploymentId: 'customdeploy_sl_to_gen_einvoice',
            });

			
			var response = https.post({ url: suiteletURL,body: {transId: rec_id } });
		
			if(response.body == 200){
			 redirectAfterProcess( response, rec_id, "generation" );	
				
			}
			
        
    }
	
	
	
	function certify_cm_edocfile(rec_id) {
  
    showProcessMessageCertify(rec_id);
	
	var suiteletURL = url.resolveScript({
                scriptId: 'customscript_sl_to_certify_einvoice',
                deploymentId: 'customdeploy_sl_to_certify_einvoice',
            });

			
			var response = https.post({ url: suiteletURL,body: {transId: rec_id } });
		
			if(response.body == 200){
			 redirectAfterProcessCm( response, rec_id, "generation" );	
				
			}
			
        
    }
	
	
	 function certify_edocfile(rec_id) {
       
    showProcessMessageCertify(rec_id);
	
	var suiteletURL = url.resolveScript({
                scriptId: 'customscript_sl_to_certify_einvoice',
                deploymentId: 'customdeploy_sl_to_certify_einvoice',
            });

			
			var response = https.post({ url: suiteletURL,body: {transId: rec_id } });
		
			if(response.body == 200){
			 redirectAfterProcess( response, rec_id, "generation" );	
				
			}
			
        
    }
	
	
	
	 function print_invoice(rec_id) {
       
   var suiteletUrl = url.resolveScript({
            scriptId: 'customscript_sl_to_gen_invoice_pdf', 
            deploymentId: 'customdeploy_sl_to_gen_invoice_pdf',
            returnExternalUrl: true 
        });
		
		var parameterName = 'transId'; 
        var parameterValue = rec_id; 
		
		  var completeUrl = suiteletUrl + '&' + parameterName + '=' + encodeURIComponent(parameterValue);
        window.open(completeUrl, '_blank');
			
        
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
	
	
	 function redirectAfterProcessCm(result, transId, process) {
  
        var recordURL = url.resolveRecord({
            recordType: 'creditmemo',
            recordId: transId,
            isEditMode: false
        });
        window.location = recordURL;
    }
	
	function showProcessMessageCertify(rec_id){
		
  
		  var myMsg3 = message.create({
        title: 'Message!',
        message: 'E-Documents Certification is in-progress',
        type: message.Type.INFORMATION,
        duration: 20000
    });
	myMsg3.show();
		
		 
    }
	
	function showProcessMessage(rec_id){
		
  
		  var myMsg3 = message.create({
        title: 'Message!',
        message: 'E-Documents Generation is in-progress',
        type: message.Type.INFORMATION,
        duration: 20000
    });
	myMsg3.show();
		
		 
    }



	

	return {
	   pageInit: pageInit,
		 generate_edocfile: generate_edocfile,
		 certify_cm_edocfile: certify_cm_edocfile,
		 generate_cm_edocfile: generate_cm_edocfile,
         print_invoice : print_invoice,
		 certify_edocfile: certify_edocfile
	};

});