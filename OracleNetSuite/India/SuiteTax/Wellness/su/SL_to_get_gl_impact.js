/**
*
* @NApiVersion 2.0
* @NScriptType Suitelet
*
*/
var email_id;
define(['N/https', 'N/record', 'N/email', 'N/search','../lib/common_2.0','N/redirect',"../lib/moment.js",'N/render','N/file','N/runtime'],

    function callbackFunction(https, record, email, search,common,redirect,moment,render,file,runtime) {

        function getFunction(context) {
			
			 email_id = "test@test.com";

            var contentRequest = https.get({
                url: "https://7640589.app.netsuite.com/core/media/media.nl?id=324669&c=7640589&h=qAZ5B05WydXwU5ibZAFyiaC0APQAsZDx0XUsfvEMuJ2qPmIS&_xt=.html"
            });
            var contentDocument = contentRequest.body;
           

          

            context.response.write(contentDocument);
        }

 function postFunction(context) {
			 var userObj = runtime.getCurrentUser();
			var date_format = userObj.getPreference({name : 'DATEFORMAT' });
            var params = context.request.parameters;
			 log.debug('params  params', JSON.stringify(params));
			 var start_date = params.start_date;
			 var end_date = params.end_date;
			 var subsidiary_id = params.subsidiary_id;
			 var analysis_type = params.analysis_type;
			 var ledger_type = params.ledger_type;
			 var selected_vendor = params.selected_vendor;
			  selected_vendor = selected_vendor.split('~');
			 vendor_name =  selected_vendor[0];
			 selected_vendor =  selected_vendor[1];
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
			open_bal = open_bal.toString();
		close_bal = close_bal.toString();

log.debug('parameters open_bal', JSON.stringify(open_bal));
log.debug('parameters close_bal', JSON.stringify(close_bal));

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
						var	today= new Date();
						 today = FormatDateString(today,date_format);

if(analysis_type == 'summary'){
	
	
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
		
				 var templateId = 324668; 	
		
					
					}else{
					


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
											
						var account_type = data_gl[a].account_type;	
						var transactionnumber = data_gl[a].transactionnumber;	
						var memo = data_gl[a].memo;	
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
						
						
						  var templateId = 324667; 	
						 
					}	

	

		var data = {
				
				delaer_obj: delaer_obj,
				open_bal: open_bal,
				vendor_name: vendor_name,
				start_date: start_date,
				end_date: end_date,
				symbol: symbol,
				today: today,
				subsidiary_data	: subsidiary_data,
				close_bal: close_bal
		}
		
						
						
						
					
			
			}
					
					 
				  
					  
		var templateFile = file.load({id: templateId});
    var renderer = render.create();
    renderer.templateContent = templateFile.getContents();

    renderer.addCustomDataSource({
        format: render.DataSource.OBJECT,
        alias: "results",
        data: data
    });

 var invoicePdf = renderer.renderAsPdf();
    invoicePdf.name = 'InXpress_Ledger_report.pdf';
    invoicePdf.folder = 57919;
	 var fileId = invoicePdf.save();
	
	context.response.writeFile({
					file : invoicePdf
				});
	
}


function FormatDateString(dateString,userDateFormat) 
	{
		
		return moment(dateString).format(userDateFormat);
	}				
				
      
        function onRequestFxn(context) {

            if (context.request.method === "GET") {
                getFunction(context)
            } else {
                postFunction(context)
            }
            

        }
        return {
            onRequest: onRequestFxn
        };
    }); 

            