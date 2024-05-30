 /**
 * @NApiVersion 2.0
 * @NScriptType Suitelet
 * @NModuleScope Public
 */
define(['N/record', 'N/runtime', 'N/search', 'N/ui/serverWidget', 'N/encode', 'N/file', "../lib/common_2.0", "N/https", "N/url", "../lib/lodash.min.js","../lib/moment.js"],
    /**
     * @param {record} record
     * @param {runtime} runtime
     * @param {search} search
     */
    function(record, runtime, search, serverWidget, encode, file,common, https,url, _,moment) {

        var itemDetailsMapObject = {};
        /**
         * Definition of the Suitelet script trigger point.
         *
         * @param {Object} context
         * @param {ServerRequest} context.request - Encapsulation of the incoming request
         * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
         * @Since 2015.2
         */
        function onRequest(context) {
            var request = context.request;
            var response = context.response;
			 var parameters = request.parameters;
			 var userObj = runtime.getCurrentUser();
			  var userRole = userObj.role;
	
			log.debug('parameters parameters', JSON.stringify(parameters.transId));  
			
			log.debug('userObj userObj', JSON.stringify(userObj));  
			log.debug('subsidiary subsidiary', JSON.stringify(userObj.subsidiary));  
			var date_format = userObj.getPreference({name : 'DATEFORMAT' });
			var invoice_id = parameters.transId;
				var rec_type = 'Invoice';
			try {
		 var objRecord = record.load({
			type: record.Type.INVOICE,
				id: invoice_id
			});
		}catch (e) {
			 var objRecord = record.load({
			type: 'creditmemo',
				id: invoice_id
			});
			
			rec_type = 'CreditMemo';
			
		}
			 var tranid = objRecord.getValue({fieldId: 'tranid'});
			 var trandate = objRecord.getValue({fieldId: 'trandate'});
			 
			 var psg_ei_content = JSON.parse(objRecord.getValue({fieldId: 'custbody_generated_edoc'}));
			 
			  var Api_Token = GetApiToken(1);
		
		var token_val = Api_Token[0].token;			
		var gstin_val = "29AABCI8139E1ZH";
		
		var headerObj = new Array();
		headerObj['X-Cleartax-Auth-Token'] = token_val;	
		headerObj['Content-Type'] = 'application/json';	
		headerObj['Accept'] = 'application/json';	
		headerObj['gstin'] = gstin_val;	
		
		
		var url_new = 'https://api.clear.in/einv/v2/eInvoice/generate';
		
			var response = https.put({ url: url_new,body: JSON.stringify(psg_ei_content),headers: headerObj});

				log.debug('json_obj values', JSON.stringify(response));
				log.debug('json_obj values body', JSON.parse(response.body));
				
				
				var body_val = JSON.parse(response.body);
				log.debug('govt_response.ErrorDetails', JSON.stringify(body_val[0].govt_response.ErrorDetails));
				var fileName = rec_type+'_'+tranid+'.json';
				var File = file.create({
					name: fileName,
					fileType: file.Type.JSON,
					contents: JSON.stringify(body_val)
				});

					File.folder = 21097124;
					var file_id = File.save();
					var error_msg = JSON.stringify(body_val[0].govt_response.ErrorDetails);
					log.debug('error_msg.error_msg', error_msg);
					log.debug('error_msg.error_msg ----', JSON.stringify(error_msg));
				var is_success =	body_val[0].govt_response.Success;
				if(is_success == 'Y'){
				var success_msg = 'Success';	
				error_msg = "";
				objRecord.setValue({ fieldId: 'custbody_edoc_irn', value: body_val[0].govt_response.Irn});
			objRecord.setValue({ fieldId: 'custbody_edoc_ackno', value: body_val[0].govt_response.AckNo});
            objRecord.setValue({ fieldId: 'custbody_ack_date_einvoice', value: body_val[0].govt_response.AckDt});
			objRecord.setValue({ fieldId: 'custbody_edoc_status', value: body_val[0].govt_response.Success});
			objRecord.setValue({ fieldId: 'custbody_qr_code', value: body_val[0].govt_response.SignedQRCode});
			objRecord.setValue({ fieldId: 'custbody_edoc_signedinv', value: body_val[0].govt_response.SignedInvoice});
			objRecord.setValue({ fieldId: 'custbody_ei_status', value: 4});
			objRecord.setValue({ fieldId: 'custbody_einvoice_error', value: error_msg });
			 var currentDateTime = new Date();
			objRecord.setValue({ fieldId: 'custbody_e_doc_generation_time', value: currentDateTime });
				
				}else{
					var success_msg = 'Failled';
					objRecord.setValue({ fieldId: 'custbody_ei_status', value: 8});
					objRecord.setValue({ fieldId: 'custbody_einvoice_error', value: error_msg });
				}
				
				objRecord.setValue({ fieldId: 'custbody_certified_edoc', value: file_id});
				var recordId = objRecord.save();
				
			 
			 
			var otherId = 200;
			 
			  context.response.write(JSON.stringify(otherId));
            
            

        }
		
		
		
		function GetApiToken(gstin) 
	{
		
		 var filters=[  ["internalid","is",1] ];
	  
	  var columns=[
	 search.createColumn({name: "custrecord_api_gstin", label: "gstin"}),
      search.createColumn({name: "custrecord_api_token", label: "token"})
     
	  
	  ]; 
	  
	  var token_data = common.searchAllRecord('customrecord_gstin_token_for_api',null,filters,columns); 
			var Token_Details = common.pushSearchResultIntoArray(token_data);
		
		log.debug('Token_Details Token_Details', JSON.stringify(Token_Details)); 
return Token_Details;		
	
	}
		
	
	
		
		

function FormatDateString(dateString,userDateFormat) 
	{
		
		return moment(dateString).format(userDateFormat);
	}
       

        return {
            onRequest: onRequest
        };

    })