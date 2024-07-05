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
			log.debug('userObj userObj', JSON.stringify(userObj));  
			log.debug('subsidiary subsidiary', JSON.stringify(userObj.subsidiary));  
			var date_format = userObj.getPreference({name : 'DATEFORMAT' });
			 
			 
			 log.debug('date_format date_format', JSON.stringify(date_format));
            if (request.method == 'GET') {
				 log.debug('parameters parameters', JSON.stringify(parameters));
			
			 var cust_ID = parameters.cust_ID;
			 if(cust_ID == 'vendor_customer'){
			 var subsidiary_id = parameters.subsidiary_id;	 
				 
			 var VendorFiltersArray=[  ["isinactive","is","F"], 
      "AND", 
      ["subsidiary","anyof",subsidiary_id] ];
	  
	   var VendorColumnsArray = [
	   search.createColumn({ name: "entityid", sort: search.Sort.ASC, label: "Name" }),
	   
	   search.createColumn({name: "internalid", label: "internalid"})
			];
			 
		var vendorObj = common.searchAllRecord('vendor',null,VendorFiltersArray,VendorColumnsArray);
			var data_vendor = common.pushSearchResultIntoArray(vendorObj);

var customerObj = common.searchAllRecord('customer',null,VendorFiltersArray,VendorColumnsArray);
			var data_customer = common.pushSearchResultIntoArray(customerObj);	
		
var subsidiaryFiltersArray=[ ["internalid","anyof",subsidiary_id] ];	
		
			  var subsidiaryColumnsArray = [
	   search.createColumn({name: "address1", label: "address1"}),
      search.createColumn({name: "address2", label: "address2"}),
      search.createColumn({name: "city", label: "city"}),
      search.createColumn({name: "state", label: "state"}),
      search.createColumn({name: "legalname", label: "legalname"}),
      search.createColumn({name: "taxregistrationnumber", label: "taxregistrationnumber"})
			];
			
		var subsidiaryObj = common.searchAllRecord('subsidiary',null,subsidiaryFiltersArray,subsidiaryColumnsArray);
			var subsidiary_data = common.pushSearchResultIntoArray(subsidiaryObj);	
			
			var data = {
				subsidiary_data	: subsidiary_data,
				vendor_obj	: data_vendor,
				customer_obj	: data_customer
				
		};
			
			 
			 }else if(cust_ID == 'search'){
				 
				 
				 
				 var selected_vendor = parameters.selected_vendor;
			 var start_date = parameters.start_date;
			 var end_date = parameters.end_date;
			 var ledger_type = parameters.ledger_type;
				
			 start_date = FormatDateString(start_date,date_format);	
			  end_date = FormatDateString(end_date,date_format);	
			  	
				if(start_date != "Invalid date"){
				if(ledger_type == 'customer'){
				var bill = 'CustInvc';	
				var pay = 'CustPymt';	
				}else{
				var bill = 'VendBill';	
				var pay = 'VendCred';		
				}
			
			 var VendorFiltersArray=[   ["isinactive","is","F"],
      "AND", 
      ["internalid","anyof",selected_vendor] ];
	  
	   var VendorColumnsArray = [
	   search.createColumn({name: "currency", label: "currency"}),
	   
	   search.createColumn({name: "internalid", label: "internalid"})
			];
			
			var vendorObj = common.searchAllRecord(ledger_type,null,VendorFiltersArray,VendorColumnsArray);
			var data_vendor = common.pushSearchResultIntoArray(vendorObj);
			
			var currency = data_vendor[0].currency;
			var rec = record.load({ type: record.Type.CURRENCY,id: currency});
			var symbol=rec.getValue({fieldId: 'symbol'});
			log.debug('symbol symbol', JSON.stringify(symbol));
			
				var FiltersArray=[  ["type","anyof",bill,pay], 
      "AND", 
      ["name","anyof",selected_vendor], 
      "AND", 
      ["trandate","within",start_date,end_date] ];
	  
	  var OpeningBalanceFiltersArray=[   ["type","anyof",bill], 
      "AND", 
      ["name","anyof",selected_vendor], 
      "AND", 
      ["mainline","is","T"], 
      "AND", 
      ["trandate","onorbefore",start_date] ];
	  
	   var ClosingBalanceFiltersArray=[   ["type","anyof",bill], 
      "AND", 
      ["name","anyof",selected_vendor], 
      "AND", 
      ["mainline","is","T"], 
      "AND", 
      ["trandate","onorbefore",end_date] ];
	  
	   var paid_OpeningBalanceFiltersArray=[   ["type","anyof",pay], 
      "AND", 
      ["name","anyof",selected_vendor], 
      "AND", 
      ["mainline","is","T"], 
      "AND", 
      ["trandate","onorbefore",start_date] ];
	  
	   var paid_ClosingBalanceFiltersArray=[   ["type","anyof",pay], 
      "AND", 
      ["name","anyof",selected_vendor], 
      "AND", 
      ["mainline","is","T"], 
      "AND", 
      ["trandate","onorbefore",end_date] ];
	  
	  var ColumnsArray_bal = [
			search.createColumn({ name: "fxamount", summary: "SUM", label: "balance_amount" })
];

			var opn_bal = common.searchAllRecord('transaction',null,OpeningBalanceFiltersArray,ColumnsArray_bal);
			var data_opn_bal = common.pushSearchResultIntoArray(opn_bal);
		
		var paid_opn_bal = common.searchAllRecord('transaction',null,paid_OpeningBalanceFiltersArray,ColumnsArray_bal);
			var data_paid_opn_bal = common.pushSearchResultIntoArray(paid_opn_bal);
			
			
			var clo_bal = common.searchAllRecord('transaction',null,ClosingBalanceFiltersArray,ColumnsArray_bal);
			var data_close_bal = common.pushSearchResultIntoArray(clo_bal);
		
		var paid_clo_bal = common.searchAllRecord('transaction',null,paid_ClosingBalanceFiltersArray,ColumnsArray_bal);
			var data_paid_clo_bal = common.pushSearchResultIntoArray(paid_clo_bal);
			
	  log.debug('parameters data_opn_bal', JSON.stringify(data_opn_bal[0].balance_amount));
	  log.debug('parameters data_paid_opn_bal', JSON.stringify(data_paid_opn_bal));
			if(data_opn_bal[0].balance_amount != "") {
				data_opn_bal_amt = data_opn_bal[0].balance_amount;
			}else{
			data_opn_bal_amt = 0;	
			}
			
			if(data_paid_opn_bal[0].balance_amount != "") {
				data_paid_opn_bal_amt = data_paid_opn_bal[0].balance_amount;
			}else{
			data_paid_opn_bal_amt = 0;	
			}
			
			if(data_close_bal[0].balance_amount != "") {
				data_clo_bal_amt = data_close_bal[0].balance_amount;
			}else{
			data_clo_bal_amt = 0;	
			}
			
			if(data_paid_clo_bal[0].balance_amount != "") {
				data_paid_clo_bal_amt = data_paid_clo_bal[0].balance_amount;
			}else{
			data_paid_clo_bal_amt = 0;	
			}
		
			
			var open_bal = parseFloat(parseFloat(data_opn_bal_amt) - parseFloat(data_paid_opn_bal_amt));	
			var close_bal = parseFloat(parseFloat(data_clo_bal_amt) - parseFloat(data_paid_clo_bal_amt));	
			

log.debug('parameters open_bal', JSON.stringify(open_bal));
log.debug('parameters close_bal', JSON.stringify(close_bal));


 var ColumnsArray = [
				search.createColumn({name: "trandate", label: "trandate"}),
      search.createColumn({name: "type", label: "type"}),
      search.createColumn({name: "tranid", label: "tranid"}),
      search.createColumn({name: "entity", label: "entity"}),
      search.createColumn({name: "account", label: "account"}),
      search.createColumn({name: "transactionnumber", label: "transactionnumber"}),
      search.createColumn({name: "memo", label: "memo"}),
	  search.createColumn({name: "debitamount", label: "debitamount"}),
	  search.createColumn({name: "fxamount", label: "fxamount"}),
      search.createColumn({name: "creditamount", label: "creditamount"}),
      search.createColumn({name: "currency", label: "currency"}),
      search.createColumn({name: "postingperiod", label: "postingperiod"}),
      search.createColumn({name: "exchangerate", label: "exchangerate"}),
	  search.createColumn({name: "number", join: "account",label: "account_type"})

];

			var GlObj = common.searchAllRecord('transaction',null,FiltersArray,ColumnsArray);
			var data_gl = common.pushSearchResultIntoArray(GlObj);
			

		
var delaer_obj =[];
				for (var a = 0; a < data_gl.length; a++) {
						var json = {};
						
						var trandate = data_gl[a].trandate;
						
						var tranid = data_gl[a].tranid;	
						var entity = data_gl[a].entity;	
						
						var account =  GlObj[a].getText({ name: 'account'});						
						var type =  GlObj[a].getText({ name: 'type'});						
				
						var transactionnumber = data_gl[a].transactionnumber;	
						var memo = data_gl[a].memo;	
						var fxamount = data_gl[a].fxamount;	
						var account_type = data_gl[a].account_type;	
						var creditamount = data_gl[a].creditamount;	
						var debitamount = data_gl[a].debitamount;
						
						if(creditamount > 0){
							creditamount = fxamount;
							debitamount = 0;
						}else{
							creditamount = 0;
							debitamount = fxamount;
						}
												
						
						var exchangerate = data_gl[a].exchangerate;	
							
						var postingperiod =  GlObj[a].getText({ name: 'postingperiod'});
						var currency =  GlObj[a].getText({ name: 'currency'});
							
						json['trandate'] = trandate;
						json['type'] = type;
						json['tranid'] = tranid;
						json['entity'] = entity;
						json['account'] = account;
						json['transactionnumber'] = transactionnumber;
						json['memo'] = memo;
						json['debitamount'] = debitamount;
						json['creditamount'] = creditamount;
						json['currency'] = currency;
						json['exchangerate'] = exchangerate;
						json['postingperiod'] = postingperiod;
						json['account_type'] = account_type;
							
							delaer_obj.push(json);
						}

		var data = {
				
				delaer_obj: delaer_obj,
				open_bal: open_bal,
				symbol: symbol,
				close_bal: close_bal
		}		
					
					}
				 
				 
				 
			 }else if(cust_ID == 'search_summary'){
			 
		//	========= Summary Data===========   Start    =============
		
		 var selected_vendor = parameters.selected_vendor;
			 var start_date = parameters.start_date;
			 var end_date = parameters.end_date;
			 var ledger_type = parameters.ledger_type;
				
			 start_date = FormatDateString(start_date,date_format);	
			  end_date = FormatDateString(end_date,date_format);	
			  	
				if(start_date != "Invalid date"){
				if(ledger_type == 'customer'){
				var bill = 'CustInvc';	
				var pay = 'CustPymt';	
				}else{
				var bill = 'VendBill';	
				var pay = 'VendCred';		
				}
				
				
				var VendorFiltersArray=[   ["isinactive","is","F"],
      "AND", 
      ["internalid","anyof",selected_vendor] ];
	  
	   var VendorColumnsArray = [
	   search.createColumn({name: "currency", label: "currency"}),
	   
	   search.createColumn({name: "internalid", label: "internalid"})
			];
			
			var vendorObj = common.searchAllRecord(ledger_type,null,VendorFiltersArray,VendorColumnsArray);
			var data_vendor = common.pushSearchResultIntoArray(vendorObj);
			
			var currency = data_vendor[0].currency;
			var rec = record.load({ type: record.Type.CURRENCY,id: currency});
			var symbol=rec.getValue({fieldId: 'symbol'});
			log.debug('symbol symbol 66666', JSON.stringify(symbol));
			
				
				var FiltersArray=[  ["type","anyof",bill,pay], 
      "AND", 
      ["name","anyof",selected_vendor], 
      "AND", 
      ["trandate","within",start_date,end_date] ];
	  
	  var OpeningBalanceFiltersArray=[   ["type","anyof",bill], 
      "AND", 
      ["name","anyof",selected_vendor], 
      "AND", 
      ["mainline","is","T"], 
      "AND", 
      ["trandate","onorbefore",start_date] ];
	  
	   var ClosingBalanceFiltersArray=[   ["type","anyof",bill], 
      "AND", 
      ["name","anyof",selected_vendor], 
      "AND", 
      ["mainline","is","T"], 
      "AND", 
      ["trandate","onorbefore",end_date] ];
	  
	   var paid_OpeningBalanceFiltersArray=[   ["type","anyof",pay], 
      "AND", 
      ["name","anyof",selected_vendor], 
      "AND", 
      ["mainline","is","T"], 
      "AND", 
      ["trandate","onorbefore",start_date] ];
	  
	   var paid_ClosingBalanceFiltersArray=[   ["type","anyof",pay], 
      "AND", 
      ["name","anyof",selected_vendor], 
      "AND", 
      ["mainline","is","T"], 
      "AND", 
      ["trandate","onorbefore",end_date] ];
	  
	  var ColumnsArray_bal = [
			search.createColumn({ name: "fxamount", summary: "SUM", label: "balance_amount" })
];

			var opn_bal = common.searchAllRecord('transaction',null,OpeningBalanceFiltersArray,ColumnsArray_bal);
			var data_opn_bal = common.pushSearchResultIntoArray(opn_bal);
		
		var paid_opn_bal = common.searchAllRecord('transaction',null,paid_OpeningBalanceFiltersArray,ColumnsArray_bal);
			var data_paid_opn_bal = common.pushSearchResultIntoArray(paid_opn_bal);
			
			
			var clo_bal = common.searchAllRecord('transaction',null,ClosingBalanceFiltersArray,ColumnsArray_bal);
			var data_close_bal = common.pushSearchResultIntoArray(clo_bal);
		
		var paid_clo_bal = common.searchAllRecord('transaction',null,paid_ClosingBalanceFiltersArray,ColumnsArray_bal);
			var data_paid_clo_bal = common.pushSearchResultIntoArray(paid_clo_bal);
			
	  log.debug('parameters data_opn_bal', JSON.stringify(data_opn_bal[0].balance_amount));
	  log.debug('parameters data_paid_opn_bal', JSON.stringify(data_paid_opn_bal));
			if(data_opn_bal[0].balance_amount != "") {
				data_opn_bal_amt = data_opn_bal[0].balance_amount;
			}else{
			data_opn_bal_amt = 0;	
			}
			
			if(data_paid_opn_bal[0].balance_amount != "") {
				data_paid_opn_bal_amt = data_paid_opn_bal[0].balance_amount;
			}else{
			data_paid_opn_bal_amt = 0;	
			}
			
			if(data_close_bal[0].balance_amount != "") {
				data_clo_bal_amt = data_close_bal[0].balance_amount;
			}else{
			data_clo_bal_amt = 0;	
			}
			
			if(data_paid_clo_bal[0].balance_amount != "") {
				data_paid_clo_bal_amt = data_paid_clo_bal[0].balance_amount;
			}else{
			data_paid_clo_bal_amt = 0;	
			}
		
			
			var open_bal = parseFloat(parseFloat(data_opn_bal_amt) - parseFloat(data_paid_opn_bal_amt));	
			var close_bal = parseFloat(parseFloat(data_clo_bal_amt) - parseFloat(data_paid_clo_bal_amt));	
			

log.debug('parameters open_bal', JSON.stringify(open_bal));
log.debug('parameters close_bal', JSON.stringify(close_bal));


 var ColumnsArray = [
 
 search.createColumn({name: "trandate",summary: "GROUP",label: "trandate" }),
      search.createColumn({name: "postingperiod",summary: "GROUP",label: "postingperiod"}),
      search.createColumn({name: "type",summary: "GROUP",label: "type" }),
      search.createColumn({ name: "account",summary: "GROUP",label: "account"}),
      search.createColumn({ name: "number", join: "account", summary: "GROUP",label: "number"}),
      search.createColumn({name: "type", join: "account",summary: "GROUP",label: "account_type"}),
      search.createColumn({name: "creditamount",summary: "SUM",label: "creditamount"}),
      search.createColumn({name: "debitamount",summary: "SUM",label: "debitamount"}),
      search.createColumn({name: "fxamount", summary: "SUM",label: "fxamount"}),
      search.createColumn({name: "memo",summary: "GROUP",label: "memo" })

];

			var GlObj = common.searchAllRecord('transaction',null,FiltersArray,ColumnsArray);
			var data_gl = common.pushSearchResultIntoArray(GlObj);
	log.debug('parameters data_gl data_gl data_gl', JSON.stringify(data_gl));		

		
var delaer_obj =[];
				for (var a = 0; a < data_gl.length; a++) {
						var json = {};
						
						var trandate = data_gl[a].trandate;	
						var account = GlObj[a].getText({ name: 'account', summary : 'GROUP'});
						var type = GlObj[a].getText({ name: 'type', summary : 'GROUP'});
						var postingperiod = GlObj[a].getText({ name: 'postingperiod', summary : 'GROUP'});
						
			
				  var account_type = GlObj[a].getText({ name: 'type', join: 'account', summary : 'GROUP'});
						
						var memo = data_gl[a].memo;	
						var number = data_gl[a].number;	
						var fxamount = data_gl[a].fxamount;	
						var creditamount = data_gl[a].creditamount;	
						var debitamount = data_gl[a].debitamount;
						
						if(creditamount > 0){
							creditamount = fxamount;
							debitamount = 0;
						}else{
							creditamount = 0;
							debitamount = fxamount;
						}
						
						
							
						json['trandate'] = trandate;
						json['type'] = type;
						json['account'] = account;
						json['memo'] = memo;
						json['debitamount'] = debitamount;
						json['creditamount'] = creditamount;
						json['postingperiod'] = postingperiod;
						json['account_type'] = account_type;
						json['number'] = number;
							
							delaer_obj.push(json);
						}

		var data = {
				
				delaer_obj: delaer_obj,
				open_bal: open_bal,
				symbol: symbol,
				close_bal: close_bal
		}		
					
					}
			 
			 
			


			}else{
				
		
			
			if(userRole == 3){
	
				var SubFiltersArray=[  ["isinactive","is","F"], 
      "AND", 
      ["legalname","isnotempty",""] ];
			}else{
		var SubFiltersArray=[  ["isinactive","is","F"], 
      "AND", 
      ["legalname","isnotempty",""],"AND", 
      ["internalid","anyof",userObj.subsidiary] ];		
				
			}
	  
	  var SubColumnsArray = [
	    search.createColumn({name: "legalname", label: "legalname"}),
      search.createColumn({name: "internalid", label: "internalid"})
			];
			
	
			
		var subsidiaryObj = common.searchAllRecord('subsidiary',null,SubFiltersArray,SubColumnsArray);
			var subsidiary_data = common.pushSearchResultIntoArray(subsidiaryObj);	


		var data = {
				subsidiary_data	: subsidiary_data
		};
			 
			 }
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