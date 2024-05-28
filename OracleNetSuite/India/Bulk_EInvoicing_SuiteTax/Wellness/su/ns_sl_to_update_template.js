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
			
            if (request.method == 'GET') {
				 
			
			 
		
		var SubFiltersArray=[ 
		 ["subsidiary","anyof","14"], 
      "AND", 
      ["mainline","is","T"], 
      "AND", 
      ["type","anyof","CustInvc"], 
      "AND", 
      ["custbody_psg_ei_status","anyof","@NONE@"], 
      "AND", 
      ["internalid","anyof","1092345"]
		];		
				
			
	  
	  var SubColumnsArray = [
      search.createColumn({name: "internalid", label: "internalid"})
			];
			
	
			
		var subsidiaryObj = common.searchAllRecord('invoice',null,SubFiltersArray,SubColumnsArray);
			var subsidiary_data = common.pushSearchResultIntoArray(subsidiaryObj);	

			for (var a = 0; a < subsidiary_data.length; a++) {
				var internalid = subsidiary_data[a].internalid;	
				
				 var objRecord = record.load({
			type: record.Type.INVOICE,
				id: internalid
			});
			
			//objRecord.setValue({ fieldId: 'custbody_in_nature_of_document', value: 1});
			objRecord.setValue({ fieldId: 'custbody_psg_ei_template', value: 101});
			objRecord.setValue({ fieldId: 'custbody_psg_ei_sending_method', value: 4});
			var recordId = objRecord.save();
				
				
				
			}
		var data = {
				subsidiary_data	: subsidiary_data
		};
			 
			 
 context.response.write(JSON.stringify(data));
            
            }

        }
		
		

function FormatDateString(dateString,userDateFormat) 
	{
		
		return moment(dateString).format(userDateFormat);
	}
       

        return {
            onRequest: onRequest
        };

    })