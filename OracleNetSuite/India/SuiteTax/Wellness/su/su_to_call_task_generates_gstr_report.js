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
		var acc_period =	parameters.acc_period;
		var report_type =	parameters.report_type;
		var custpage_gstin =	parameters.custpage_gstin;
			 log.debug('invoice_data parameters  '+acc_period, JSON.stringify(report_type));
			 log.debug('invoice_data parameters  ', JSON.stringify(custpage_gstin));
			 
			
          
				

                try {
					if(report_type == 'sales'){
				TaskToCreateEdoc(acc_period,report_type,custpage_gstin); 	
					}else{
						
				TaskToCreateEdoc2(acc_period,report_type,custpage_gstin); 			
					}
				
				   
                } catch (e) {
                    log.error('e,message', e.message);
                }
            

        }
		
		
		function TaskToCreateEdoc2(acc_period,report_type,custpage_gstin)
	{
		log.debug('invoice_data TaskToCreateEdoc',acc_period);
		
		 var rescheduleTask = task.create({
                    taskType: task.TaskType.SCHEDULED_SCRIPT,
                    scriptId: 'customscript_ss_to_gen_gstr2_report',
                    deploymentId: 'customdeploy_ss_to_gen_gstr2_report',
                    params: {
                        'custscript_acc_period2': acc_period,
                        'custscript_gstr_gstin2': custpage_gstin,
                        'custscript_report_type2': report_type
                    }
                });
                rescheduleTask.submit();
                return true;
		
	}
	
		
		function TaskToCreateEdoc(acc_period,report_type,custpage_gstin)
	{
		log.debug('invoice_data TaskToCreateEdoc',acc_period);
		
		 var rescheduleTask = task.create({
                    taskType: task.TaskType.SCHEDULED_SCRIPT,
                    scriptId: 'customscript_ss_to_gen_gstr_report',
                    deploymentId: 'customdeploy_ss_to_gen_gstr_report',
                    params: {
                        'custscript_acc_period': acc_period,
                        'custscript_gstr_gstin': custpage_gstin,
                        'custscript_report_type': report_type
                    }
                });
                rescheduleTask.submit();
                return true;
		
	}
		

       

        return {
            onRequest: onRequest
        };

    });