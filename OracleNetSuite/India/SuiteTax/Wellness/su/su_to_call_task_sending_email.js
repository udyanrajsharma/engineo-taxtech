/**
 * @NApiVersion 2.0
 * @NScriptType Suitelet
 * @NModuleScope Public
 */
define(['N/record', 'N/runtime', 'N/search', 'N/ui/serverWidget', 'N/encode', 'N/file', "../lib/common_2.0", "N/https", "N/url",'N/task'],
    /**
     * @param {record} record
     * @param {runtime} runtime
     * @param {search} search
     */
    function(record, runtime, search, serverWidget, encode, file,common, https,url,task) {

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
		var invoice_array =	JSON.parse(parameters.invoice_data);
			 log.debug('invoice_data parameters', JSON.stringify(invoice_array));
			 
			
          
				

                try {
				TaskToCreateEdoc(invoice_array); 	
				
				   
                } catch (e) {
                    log.error('e,message', e.message);
                }
            

        }
		
		
		function TaskToCreateEdoc(invoice_id)
	{
		log.debug('invoice_data TaskToCreateEdoc',invoice_id);
		
		 var rescheduleTask = task.create({
                    taskType: task.TaskType.MAP_REDUCE,
                    scriptId: 'customscript_map_reduce_bulk_ei_email',
                    deploymentId: 'customdeploy_map_reduce_bulk_ei_email',
                    params: {
                        'custscript_invoice_data_map_email': JSON.stringify(invoice_id)
                    }
                });
                rescheduleTask.submit();
                return true;
		
	}
		

       

        return {
            onRequest: onRequest
        };

    });