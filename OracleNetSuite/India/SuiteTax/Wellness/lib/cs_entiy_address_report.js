/**
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * @NModuleScope Public
 */
define(['N/currentRecord','N/url','N/https','N/ui/message', "../lib/common_2.0", "N/https", "N/url",'N/search','N/ui/dialog'],

function(currentRecord,url,https,message,common, https,url,search,dialog) {
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
		
		currentRecord = scriptContext.currentRecord;
		
    }
	
	
	

    function refreshpage(){
    	window.onbeforeunload = null;
		window.location.reload();
    }
	
	function goBack() {
      history.back();
	
	  
    }
	
	
	
	
	
	function exportToExcel(context){
	
    currentRecord.setValue({fieldId: 'custpage_submitter',value: 'submit_button_1'});
	document.forms['main_form'].submit();
		
	
		 
    }
	

    return {
        pageInit: pageInit,
		exportToExcel: exportToExcel,
		goBack: goBack,
    	refreshpage:refreshpage
    };
    
});
