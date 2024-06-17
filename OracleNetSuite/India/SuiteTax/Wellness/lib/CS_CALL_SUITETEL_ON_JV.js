/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord', 'N/search', 'N/ui/dialog'], 
    function(currentRecord, search, dialog) {
		function pageInit() {}
	function callsuitelet(context) {
		try{
        const currentRec = currentRecord.get();
		
		}
		catch(ex){
			log.error('Error in callsuitelet')
		}
        
    }	
    

    return {
		pageInit : pageInit,
		callsuitelet:callsuitelet
    };
});