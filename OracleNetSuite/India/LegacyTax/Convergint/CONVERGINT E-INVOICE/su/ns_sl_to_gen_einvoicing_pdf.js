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
	
			log.debug('userRole userRole', JSON.stringify(userRole));  
			log.debug('parameters parameters', JSON.stringify(parameters));  
			log.debug('userObj userObj', JSON.stringify(userObj));  
			log.debug('subsidiary subsidiary', JSON.stringify(userObj.subsidiary));  
			var date_format = userObj.getPreference({name : 'DATEFORMAT' });
			var invoice_id = parameters.transId;
		//	var invoice_id = 3681355;
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
				 
				 
			 var irn = objRecord.getValue({fieldId: 'custbody_edoc_irn'});
			 var tranid = objRecord.getValue({fieldId: 'tranid'});
			 var generated_pdf = objRecord.getValue({fieldId: 'custbody_generated_pdf'});
			 var client_sez = objRecord.getValue({fieldId: 'custbody_v_invoice_client_sez'});
			 
		log.debug('client_sez client_sez', JSON.stringify(client_sez));  	 
			if(generated_pdf == ""){
			 var Api_Token = GetApiToken(1);
		
		var token_val = Api_Token[0].token;			
		var gstin_val = "29AABCI8139E1ZH";
		
		var headerObj = new Array();
		headerObj['X-Cleartax-Auth-Token'] = token_val;	
		headerObj['Content-Type'] = 'application/pdf';	
		headerObj['Accept'] = 'application/pdf';	
		headerObj['gstin'] = gstin_val;	
		if(client_sez){
		var template_id = '2888';
		}else{
		var template_id = '2887';
		}
		var url_new = 'https://api.clear.in/einv/v2/eInvoice/download?template='+template_id+'&irns='+irn;
		
		
		log.debug('url_new url_new', JSON.stringify(url_new));
		
		
		var response = https.get({ url: url_new,headers: headerObj});

				log.debug('json_obj values', JSON.stringify(response));
			//	log.debug('json_obj values body', JSON.parse(response.body));
				
				
				  var pdfFile = file.create({
        name: tranid+'.pdf',
        fileType: file.Type.PDF,
        contents: response.body,
        folder: 21097125, // Folder ID in the File Cabinet
        isOnline: true
    });

    // Save the file
    var fileId = pdfFile.save();
	
if(rec_type == 'Invoice'){
			var otherId = record.submitFields({type: record.Type.INVOICE,id: invoice_id,values: {'custbody_generated_pdf' : fileId}});
			}else{
				
			var otherId = record.submitFields({type: 'creditmemo',id: invoice_id,values: {'custbody_generated_pdf' : fileId}});
				
			}

	var fileObj = file.load({id: fileId});
	
	}else{
	 var fileObj = file.load({id: generated_pdf});	
		
	}
			
			
			  // Set response headers to serve the file as a PDF
        context.response.addHeader({
            name: 'Content-Type',
            value: 'application/pdf'
        });

        context.response.addHeader({
            name: 'Content-Disposition',
            value: 'inline; filename="' + fileObj.name + '"'
        });

        // Write the file content to the response
        context.response.writeFile({
            file: fileObj
        });
		

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