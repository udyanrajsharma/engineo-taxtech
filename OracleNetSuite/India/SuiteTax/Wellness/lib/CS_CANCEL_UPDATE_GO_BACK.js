/**
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * @NModuleScope Public
 */
define(['N/currentRecord','N/url','N/https','N/ui/message', "../lib/common_2.0", "N/https", "N/url",'N/search'],

function(currentRecord,url,https,message,common, https,url,search) {
  var record = currentRecord.get();  
    
    /**
     * Function to be executed after page is initialized.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
     *
     * @since 2015.2
     */
	 var currentRecord;
	
    function pageInit(scriptContext) {

   
    }
	function goBack() {
      history.back();
	
	  
    }
	
	
	
	

	

    return {
        pageInit: pageInit,
		goBack: goBack
    };
    
});