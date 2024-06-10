/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 * @NModuleScope Public
 */


define(['N/record', 'N/search','N/format'],

		
function(record, search,format) {
    function getInputData() {
      const date = new Date();

// Get the current time in milliseconds
const currentTime = date.getTime();

// India Standard Time (IST) is UTC +5:30
const ISTOffset = 5.5 * 60 * 60 * 1000;

// Adjust the time by the IST offset
const istTime = new Date(currentTime + ISTOffset);

// Extract the date, month, and year components from IST time
const month = istTime.getMonth() + 1; // Month is zero-indexed, so add 1
const day = istTime.getDate();
const year = istTime.getFullYear();

// Format the date as MM/DD/YYYY
const formattedDate = `${day}/${month}/${year}`;

log.debug("IST Formatted Date:", formattedDate);
      let savedSeacrhDate = format.format({value:formattedDate, type: format.Type.DATE})
       log.debug('savedSeacrhDate',savedSeacrhDate);
    var accountingtransactionSearchObj = search.create({
   type: "accountingtransaction",
   filters:
   [
      ["type","anyof","Journal"], 
      "AND", 
      ["bookspecifictransaction","is","T"], 
      "AND", 
      ["transaction.custbody_e_way_bill_required","is","F"], 
      "AND", 
      ["transaction.datecreated","on",savedSeacrhDate]
     //"4/30/2024 11:59 pm"
   ],
   columns:
   [
      search.createColumn({
        name: "internalid",
         summary: "GROUP",
         label: "Internal ID"})
   ]
});
var searchResultCount = accountingtransactionSearchObj.runPaged().count;
log.debug("accountingtransactionSearchObj result count",searchResultCount);


	  
    	return accountingtransactionSearchObj;
    }

    function map(context) {
		try{
          log.debug('context',context);
          var data = JSON.parse(context.value);
           log.debug('data',data);
          let recordId = data.values['GROUP(internalid)'].value;
          log.debug('recordId',recordId);
			let memoArr = [];
			let locationArr = [];
			var stateArr = [];
            let loadJv = record.load({ type: "journalentry", id: recordId, isDynamic: true });
            let bookSpecific = loadJv.getValue('isbookspecific');
          log.debug('bookSpecific',bookSpecific)
			if(bookSpecific == "T"){
				let getLine = loadJv.getLineCount({
					sublistId : 'line'
				});
				 log.debug('getLine',getLine)
				if(getLine == 4){
					for(let count = 0; count<getLine; count++){
						var objMemo = loadJv.getSublistValue({
							sublistId : 'line',
							fieldId : 'memo',
							line : count
						});
						
						memoArr.push(objMemo);
						
						var objLocation =loadJv.getSublistValue({
							sublistId : 'line',
							fieldId : 'location',
							line : count
						}); 
						locationArr.push(objLocation);
						
					}
					log.debug('locationArr',locationArr);
					log.debug('memoArr',memoArr);
					let uniqueArray = memoArr.filter((value, index) => memoArr.indexOf(value) === index);
					log.debug('uniqueArray',uniqueArray);
					let expectedArray = ['Asset Transfer Out (FAM)', 'Asset Transfer In (FAM)'];
					let isEqual = JSON.stringify(uniqueArray) === JSON.stringify(expectedArray); 
					log.debug('isEqual',isEqual);
					if(isEqual == true){
						let uniqueLocation = locationArr.filter((value, index) => locationArr.indexOf(value) === index);
						log.debug('uniqueLocation',uniqueLocation);
						for(var locCount = 0; locCount<uniqueLocation.length; locCount++){
							
							var locationSearchObj = search.create({
							   type: "location",
							   filters:
							   [
								  ["internalid","anyof",uniqueLocation[locCount]]
							   ],
							   columns:
							   [
								  search.createColumn({name: "state", label: "State/Province"})
							   ]
							});
							var searchResultCount = locationSearchObj.runPaged().count;
							log.debug("locationSearchObj result count",searchResultCount);
							locationSearchObj.run().each(function(result){
							  let  objState = result.getValue({
								  name: "state"
							  });
							  log.debug('objState',objState);
							  stateArr.push(objState)
							   return true;
							});
log.debug('stateArr',stateArr);
						}
						let uniquestateArr = stateArr.filter((value, index) => stateArr.indexOf(value) === index);
						log.debug('uniquestateArr',uniquestateArr);
						if(uniquestateArr.length == 1){
							loadJv.setValue({
								fieldId : 'custbody_e_way_bill_required',
								value : true
							});
							var loadJvId = loadJv.save({
                               enableSourcing: true,
    ignoreMandatoryFields: true
                            });
							log.debug('loadJvId',loadJvId);
						}
					}
                }
			


            }
        } catch (e) {
            log.debug('Exception :', e.message);
        }
	}
		
		
   


    /**
     * Executes when the summarize entry point is triggered and applies to the result set.
     *
     * @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
     * @since 2015.1
     */
    function summarize(summary) {
    	log.debug('inside summary method...');
	    
		log.debug('summary summary', JSON.stringify(summary)); 
			
	    	
    }
    
	

	


    return {
        getInputData: getInputData,
        map: map,
        summarize: summarize
    };
    
});