/**
 * @NApiVersion 2.0
 * @NScriptType ScheduledScript
 * @NModuleScope Public
 */
define(
		[ 'N/search', 'N/record', 'N/render', 'N/file', 'N/runtime', 'N/log',"../lib/common_2.0",'N/xml','N/encode','N/email',"N/https", "N/url","../lib/lodash.min",'../lib/moment.js' ],
		/**
		 * @param {file}
		 *            file
		 * @param {format}
		 *            format
		 * @param {runtime}
		 *            runtime
		 * @param {search}
		 *            search
		 */
		function(search, record, render, file, Runtime, Log,common,xml,encode,email,https,url,_,moment) {

			var DELIMITER = ",", NEWLINE = "\n",zero=0,blank_field="";
			/**
			 * Definition of the Scheduled script trigger point.
			 * 
			 * @param {Object}
			 *            scriptContext
			 * @param {string}
			 *            scriptContext.type - The context in which the script
			 *            is executed. It is one of the values from the
			 *            scriptContext.InvocationType enum.
			 * @Since 2015.2
			 */
			
				function SendStatusEmail(file_id) {

         	var gstr_file_record = record.load({type: 'customrecord_gstr_file_record', id: 1 });
		   var activityid = gstr_file_record.getValue({fieldId: 'custrecord_gstr_file_activityid'});
		   var activityid = gstr_file_record.getValue({fieldId: 'custrecord_gstr_file_activityid'});
		   var file_type = gstr_file_record.getValue({fieldId: 'custrecord_gstr_file_type'});
		   var file_status = gstr_file_record.getValue({fieldId: 'custrecord_gstr_file_status'});
		   
		    log.debug('json_obj values', JSON.stringify(gstr_file_record));
			
		   if(file_status == 'In-Progress'){
			   
			  
			   if(file_type == 'sales'){
				   var tanant = 'GSTSALES' ;
			   }else{
				 var tanant = 'MAXITC' ;   
			   }
			   
		var api_url =  'https://api-sandbox.clear.in/integration/v1/ingest/file/'+file_type+'/status/'+activityid+'?tenant='+tanant;
		   
		   var Api_Token = GetApiToken(1);
		
		var token_val = Api_Token[0].token;	
		
		   	var headerObj_ingest = new Array();
		headerObj_ingest['x-cleartax-auth-token'] = token_val;		
		headerObj_ingest['Content-Type'] = 'application/json';	
		headerObj_ingest['Accept'] = 'application/json';	
		
		
		var response = https.get({url: api_url,headers: headerObj_ingest});
		
			log.debug('json_obj values', JSON.stringify(response));
			
			var body_data = JSON.parse(response.body);
			
				
				if(body_data.status == 'ACTIVITY_COMPLETED'){
					
					record.submitFields({
		    			type : 'customrecord_gstr_file_record',
		    			id : 1,
		    			values : {
		    				custrecord_gstr_file_status : 'done',  custrecord_gstr_file_final_status :JSON.stringify(body_data)
		    			}
		    		});
			
var file_id = writeFileIntoFileCabinet(body_data);			
				
		var senderId = 2507524;
		var email_body = '<p >Please Find the attachment</p>'
		
	var email_body3 = '<br><br>'	
	var email_body4 = 'Thanks<br>'

	var email_bodyy = 	email_body+email_body3+email_body4;
		var recipientId = 'kaunain@engineosol.com';
		var fileObj = file.load({id: file_id});
		
		var emailattributes = {
					author : senderId,
					recipients : recipientId,
					subject: 'GSTR Report File Status',
					body :  email_bodyy,
					attachments: [fileObj]
			};
		
		
		
		email.send(emailattributes);
		   }
		   }
		   

        }
		
		
		function getFileName() {
				
				var formattedDate = moment().format('YYMMDD');
				return 'gstr_report_status_' + formattedDate +'.txt';
				
				
			}
		
			function writeFileIntoFileCabinet(fileContent,report_type) {

           
                FOLDER_ID = 2667441;
           
            var fileName = getFileName();
            
            try {
                var fileRec = file.create({
                    name: fileName,
                    fileType: file.Type.PLAINTEXT,
                    contents: JSON.stringify(fileContent)
                });
                fileRec.folder = FOLDER_ID;
             var file_id =  fileRec.save();
			 
			 
			
			} catch (E) {
                log.error('Error while creating file', E);
                throw E;
            }
			
			return file_id;

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
			
			
			
			
			
			
			
				
			


			return {
				execute : SendStatusEmail
			};

		});