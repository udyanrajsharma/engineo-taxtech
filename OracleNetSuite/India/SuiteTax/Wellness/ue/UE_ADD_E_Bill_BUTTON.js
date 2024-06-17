/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
/**
 * Create IR from PO for Aggregated Orders - Shiva
 */
define(['N/record', 'N/search', 'N/runtime', 'N/https', 'N/format','N/ui/serverWidget'], function (record, search, runtime, https, format,serverWidget) {

    function beforeLoad(context) {
        try {
            if(context.type === 'view'){
var objRec = context.newRecord;
          var objId = objRec.id;
          log.debug('objRec',objRec);
          var ewaybillRequired = objRec.getValue({
            fieldId : 'custbody_e_way_bill_required'
          });
          log.debug('ewaybillRequired',ewaybillRequired);
          var ewaybillNumber = objRec.getValue({
            fieldId : 'custbody_e_way_bill_number'
          });
          
           var form = context.form;
          if(ewaybillRequired == true){
            form.clientScriptModulePath = './CS_CALL_SUITETEL_ON_JV.js'
            if(ewaybillNumber){}
            else{
            form.addButton({
				id : 'custpage_ewaybill',
				label : 'Generate E-way Bill',
              functionName : 'callsuitelet('+objId+')'
			});
            }
          }
            }
        } catch (e) {
            log.debug('Exception :', e.message);
        }
    }

    return {
        beforeLoad: beforeLoad
    }
});