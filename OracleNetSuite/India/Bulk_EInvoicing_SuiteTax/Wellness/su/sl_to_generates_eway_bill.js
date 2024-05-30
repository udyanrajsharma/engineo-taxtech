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
			
			var invoice_id = parameters.transId;
			 var objRecord = record.load({
			type: record.Type.INVOICE,
				id: invoice_id
			});
			
			 var entity = objRecord.getValue({fieldId: 'entity'});
			 
		var	 fieldLookUp = search.lookupFields({ type: 'customer', id: entity,
    columns: ['custentity_in_gst_vendor_regist_type']});

var reg_type = fieldLookUp.custentity_in_gst_vendor_regist_type[0].value
log.debug('fieldLookUp fieldLookUp', JSON.stringify(fieldLookUp));  
log.debug('reg_type reg_type', JSON.stringify(reg_type));  


			 var tranid = objRecord.getValue({fieldId: 'tranid'});
			 var trandate = objRecord.getValue({fieldId: 'trandate'});
			 
			  trandate = FormatDateString(trandate,'DD/MM/YYYY');	
			  
			 var nexus = objRecord.getValue({fieldId: 'nexus'});
			
			 var subsidiary = objRecord.getValue({fieldId: 'subsidiary'});
			
			 var location_val = objRecord.getValue({fieldId: 'location'});
			  
			 var subtotal = objRecord.getValue({fieldId: 'subtotal'});
			
			 var taxtotal = objRecord.getValue({fieldId: 'taxtotal'});
			
			var irn = objRecord.getValue({fieldId: 'custbody_in_ei_irn'});
			 var transport_dist = objRecord.getValue({fieldId: 'custbody_in_eway_transport_dist'});
			 var transport_name = objRecord.getValue({fieldId: 'custbody_in_eway_transport_name'});
			 var transport_id = objRecord.getValue({fieldId: 'custbody_in_eway_transport_id'});
			 var transp_doc_no = objRecord.getValue({fieldId: 'custbody_in_eway_transp_doc_no'});
			 var transport_date = objRecord.getValue({fieldId: 'custbody_in_eway_transport_date'});
			 var vehicle_no = objRecord.getValue({fieldId: 'custbody_in_eway_vehicle_no'});
			 var vehicle_type = objRecord.getValue({fieldId: 'custbody_in_eway_vehicle_type'});
			 var transaction_type = objRecord.getValue({fieldId: 'custbody_in_eway_transaction_type'});
			 var transport_mode = objRecord.getValue({fieldId: 'custbody_in_eway_transport_mode'});
	
			
			 var total = objRecord.getValue({fieldId: 'total'});
			 
			  var taxtotal25 = objRecord.getValue({fieldId: 'taxtotal2'});
			 if(taxtotal25 != undefined){
				taxtotal25 = taxtotal25; 
			 }else{
				taxtotal25 = 0; 
			 }
		
			 var taxtotal26 = objRecord.getValue({fieldId: 'taxtotal3'});
			  if(taxtotal26 != undefined){
				taxtotal26 = taxtotal26; 
			 }else{
				taxtotal26 = 0; 
			 }
			 
			
			 var taxtotal27 = objRecord.getValue({fieldId: 'taxtotal4'});
			  if(taxtotal27 != undefined){
				taxtotal27 = taxtotal27; 
			 }else{
				taxtotal27 = 0; 
			 }
			
			 var subsidiary_val = objRecord.getText({fieldId: 'subsidiary'});
			 
			 var Seller_Details = GetSellerDetails(subsidiary, nexus);	
			 
			var Buyers_Details = GetBuyersDetails(entity);	
			
			 
			 if(location_val != ""){
		var Dispatch_Details = GetDispatchDetails(location_val);
		 log.debug('Dispatch_ Dispatch_Details', JSON.stringify(Dispatch_Details)); 
		  
		  sellerAddr1 = Dispatch_Details[0].address1;
			var	 sellerAddr2 = Dispatch_Details[0].address2;
			var	 sellerLoc = Dispatch_Details[0].city;
			var	 sellerPin = Dispatch_Details[0].zip;
			var	 sellerStcd = Dispatch_Details[0].state;
			var	 sellerStcd = Dispatch_Details[0].state.substring(0, 2);
			var	 dispatchNm = Dispatch_Details[0].name;
			var	 dispatchAddr1 = Dispatch_Details[0].address1;
			var	 dispatchAddr2 = Dispatch_Details[0].address2;
			var	 dispatchLoc = Dispatch_Details[0].city;
			var	 dispatchStcd = Dispatch_Details[0].state.substring(0, 2);

			var	 dispatchPin = Dispatch_Details[0].zip;
		 
			 }else{
			var	sellerAddr1 = Seller_Details[0].address1;
			var	 sellerAddr2 = Seller_Details[0].address2;
			var	 sellerLoc = Seller_Details[0].city;
			var	 sellerPin = Seller_Details[0].zip;
			var	 sellerStcd = Seller_Details[0].state;
			var	 sellerStcd = Seller_Details[0].state.substring(0, 2);
				 
			var	dispatchNm = Seller_Details[0].name;
			var	 dispatchAddr1 = Seller_Details[0].address1;
			var	 dispatchAddr2 = Seller_Details[0].address2;
			var	 dispatchLoc = Seller_Details[0].city;
			var	 dispatchStcd = Seller_Details[0].state.substring(0, 2);
			var	 dispatchPin = Seller_Details[0].zip;
			 }
			 
			 	var ship_Details = GetShippingDetails(invoice_id);	
			  log.debug('ship_Details', JSON.stringify(ship_Details));
			 
			 var shipaddr1 = ship_Details[0].shipaddress1;
				var shipaddr2 = ship_Details[0].shipaddress2;
				var shipcity = ship_Details[0].shipcity;
				
				var shipzip = ship_Details[0].shipzip;

			 var  state_code_buyer = ship_Details[0].shipstate.substring(0, 2);
			 
			 var billaddress1 = ship_Details[0].billaddress1;
				var billaddress2 = ship_Details[0].billaddress2;
				var billcity = ship_Details[0].billcity;
				var billzip = ship_Details[0].billzip;
				var billstate = ship_Details[0].billstate.substring(0, 2);
				
	 

			var irn = objRecord.getValue({fieldId: 'custbody_in_ei_irn'});
			 var transport_dist = objRecord.getValue({fieldId: 'custbody_in_eway_transport_dist'});
			 var transport_name = objRecord.getValue({fieldId: 'custbody_in_eway_transport_name'});
			 var transport_id = objRecord.getValue({fieldId: 'custbody_in_eway_transport_id'});
			 var transp_doc_no = objRecord.getValue({fieldId: 'custbody_in_eway_transp_doc_no'});
			 var transport_date = objRecord.getValue({fieldId: 'custbody_in_eway_transport_date'});
			 var vehicle_no = objRecord.getValue({fieldId: 'custbody_in_eway_vehicle_no'});
			 var vehicle_type = objRecord.getValue({fieldId: 'custbody_in_eway_vehicle_type'});
			 var transaction_type = objRecord.getValue({fieldId: 'custbody_in_eway_transaction_type'});
			 var transport_mode = objRecord.getValue({fieldId: 'custbody_in_eway_transport_mode'});
		  transport_date = FormatDateString(transport_date,'DD/MM/YYYY');
		  if(transport_dist == ""){
			  transport_dist = 0;
		  }
			if(transport_id == ""){
				
				transport_id = Seller_Details[0].taxregistrationnumber;
			}


				
	
	
	if(reg_type == 4){
		
		
		
		
		var Item_Details = GetItemDetails(objRecord,invoice_id);
		  var values = [];
		   for (var p = 0; p < Item_Details.length; p++) {
			    log.debug('Item_Details Item_Details  '+p, JSON.stringify(Item_Details[p])); 
			 var qty_item =  Math.abs(Item_Details[p].quantity);
			 var TotAmt =  Math.abs(Item_Details[p].fxrate*1);
			 var cgst_per = 0;
			 var igst_per = 0;
			 if(Item_Details[p].cgst_amt > 0){
				 
				cgst_per = parseFloat(Item_Details[p].gst_rate/2);
			 }else{
				 igst_per = Item_Details[p].gst_rate;
				 
			 }
		  values[p] =
		  {
            "ProdName": Item_Details[p].item,
            "ProdDesc": Item_Details[p].memo,
            "HsnCd": Item_Details[p].gst_hsn_code,
            "Qty": qty_item,
            "Unit": Item_Details[p].uqc,
            "AssAmt": TotAmt,
            "CgstRt": cgst_per,
            "CgstAmt": Math.abs(Item_Details[p].cgst_amt*1),
            "SgstRt": cgst_per,
            "SgstAmt": Math.abs(Item_Details[p].sgst_amt*1),
            "IgstRt": igst_per,
            "IgstAmt": Math.abs(Item_Details[p].igst_amt*1),
            "CesRt": 0,
            "CesAmt": 0,
            "OthChrg": 0,
            "CesNonAdvAmt": 0
        }
		  
		   }
		   
		    log.debug('values values', JSON.stringify(values));
		
		
	 var eway_bill =  	{
    "DocumentNumber": tranid,
    "DocumentType": "INV",
    "DocumentDate": trandate,
    "SupplyType": "OUTWARD",
    "SubSupplyType": "SUPPLY",
    "SubSupplyTypeDesc": "TEST",
    "TransactionType": "Regular",
    "BuyerDtls": {
        "Gstin": "URP",
         "LglNm": Buyers_Details[0].name,
         "TrdNm": Buyers_Details[0].name,
        "Addr1": billaddress1,
         "Addr2": billaddress2,
        "Loc": billcity,
          "Pin": billzip,
           "Stcd": billstate,
    },
    "SellerDtls": {
				"Gstin": Seller_Details[0].taxregistrationnumber,
				"LglNm": Seller_Details[0].legalname,
                "TrdNm": Seller_Details[0].name,	 
                "Addr1": sellerAddr1,
                "Addr2": sellerAddr2,
                "Loc": sellerLoc,
                "Pin": sellerPin,
                "Stcd": sellerStcd,
    },
     "ExpShipDtls": {
	"LglNm": Seller_Details[0].legalname,
   "Addr1": shipaddr1,
    "Addr2": shipaddr2,
    "Loc": shipcity,
    "Pin": shipzip,
    "Stcd": state_code_buyer
  },
    "DispDtls": {
   "Nm": dispatchNm,
    "Addr1": dispatchAddr1,
    "Addr2": dispatchAddr2,
    "Loc": dispatchLoc,
    "Pin": dispatchPin,
    "Stcd": dispatchStcd
  },
    "ItemList": values,
    "TotalInvoiceAmount": total,
    "TotalCgstAmount": taxtotal26,
    "TotalSgstAmount": taxtotal27,
    "TotalIgstAmount": taxtotal25,
    "TotalCessAmount": 0,
    "TotalCessNonAdvolAmount": 0,
    "TotalAssessableAmount": subtotal,
    "OtherAmount": 0,
    "OtherTcsAmount": 0,
     "TransId": transport_id, 
    "TransName": transport_name,
     "TransMode": transport_mode,
    "Distance": transport_dist,
    "TransDocNo": transp_doc_no,
   "TransDocDt": transport_date,
     "VehNo": vehicle_no,
    "VehType": "REGULAR"
};
		
	}else{
 var eway_bill =  
  {
  "Irn": irn,
  "Distance": transport_dist,
  "TransMode": transport_mode,
  "TransId": transport_id,  
  "TransName": transport_name,
  "TransDocDt": transport_date,
  "TransDocNo": transp_doc_no,
  "VehNo": vehicle_no,
  "VehType": "R",
  "ExpShipDtls": {
   "Addr1": shipaddr1,
    "Addr2": shipaddr2,
    "Loc": shipcity,
    "Pin": shipzip,
    "Stcd": state_code_buyer
  },
  "DispDtls": {
   "Nm": dispatchNm,
    "Addr1": dispatchAddr1,
    "Addr2": dispatchAddr2,
    "Loc": dispatchLoc,
    "Pin": dispatchPin,
    "Stcd": dispatchStcd
  }
} ;

	}
		   
	log.debug('eway_bill eway_bill', JSON.stringify(eway_bill));	    

	
log.debug('eway_bill Seller_Details[0].taxregistrationnumber', JSON.stringify(Seller_Details[0].taxregistrationnumber));	
			 var Api_Token = GetApiToken(1);
		
		var token_val = Api_Token[0].token;	
		var gstin_val = Api_Token[0].gstin;	
		
		
		if(reg_type == 4){
			
		

		var headerObj = new Array();
		headerObj['X-Cleartax-Auth-Token'] = token_val;	
		headerObj['Content-Type'] = 'application/json';	
		headerObj['Accept'] = 'application/json';	
		headerObj['gstin'] = Seller_Details[0].taxregistrationnumber;	
		
		var url_new = 'https://api-sandbox.clear.in/einv/v3/ewaybill/generate';
		
			var response = https.put({ url: url_new,body: JSON.stringify(eway_bill),headers: headerObj});
						var body_data =	JSON.parse(response.body);
				log.debug('json_obj values', JSON.stringify(response));
				log.debug('json_obj values body', JSON.parse(response.body));		
				log.debug('json_obj values body govt_response', JSON.stringify(body_data.govt_response));		
			
				var is_success =	body_data.govt_response.Success;
				
				
				if(is_success == 'Y'){
				var success_msg = 'Success';	
				error_msg = "";
				var EwbNo = (body_data.govt_response.EwbNo).toString();
				objRecord.setValue({ fieldId: 'custbody_in_eway_bill_no', value: EwbNo});
				objRecord.setValue({ fieldId: 'custbody_eway_bill_date', value: body_data.govt_response.EwbDt});
				objRecord.setValue({ fieldId: 'custbody_eway_bill_valid_untill', value: body_data.govt_response.EwbValidTill});
				objRecord.setValue({ fieldId: 'custbody_eway_bill_error', value: error_msg });
				
				
				}else{
					
					objRecord.setValue({ fieldId: 'custbody_eway_bill_error', value: JSON.stringify(body_data.govt_response.ErrorDetails) });				
					
				}
				var recordId = objRecord.save();


	}else{
		var product = 'EInvoice';
		
		var headerObj = new Array();
		headerObj['X-Cleartax-Auth-Token'] = token_val;	
		headerObj['x-cleartax-product'] = product;	
		headerObj['gstin'] = gstin_val;	
		headerObj['Content-Type'] = 'application/json';	
		headerObj['Accept'] = 'application/json';	
		
		
		//var url_new = 'https://api-sandbox.clear.in/einv/v2/eInvoice/ewaybill';
		var url_new = 'https://api-sandbox.clear.in/einv/v1/govt/api/einvewb/ewaybill';
		
		var response = https.post({ url: url_new,body: JSON.stringify(eway_bill),headers: headerObj});

	
				log.debug('json_obj values body', JSON.parse(response.body));
				var body_val = JSON.parse(response.body);
				
				log.debug('body_val body_val body_val', JSON.stringify(body_val));
				
				
				var is_success =	body_val.Success;
				log.debug('body_val is_success is_success', JSON.stringify(is_success));
				var error_msg;
				if(is_success == 'Y'){
				var success_msg = 'Success';	
				error_msg = "";
				var EwbNo = (body_val.EwbNo).toString();
				objRecord.setValue({ fieldId: 'custbody_in_eway_bill_no', value: EwbNo});
				objRecord.setValue({ fieldId: 'custbody_eway_bill_date', value: body_val.EwbDt});
				objRecord.setValue({ fieldId: 'custbody_eway_bill_valid_untill', value: body_val.EwbValidTill});
				objRecord.setValue({ fieldId: 'custbody_eway_bill_error', value: error_msg });
				
				
				}else{
					error_msg = body_val.ErrorDetails[0];
					log.debug('error_msg error_msg error_msg', JSON.stringify(error_msg));
					objRecord.setValue({ fieldId: 'custbody_eway_bill_error', value: JSON.stringify(body_val.ErrorDetails) });				
					
				}
				var recordId = objRecord.save();
				log.debug('recordId recordId recordId', JSON.stringify(recordId));
				
		}
				
					
				
			var otherId = 200;
			  context.response.write(JSON.stringify(otherId));
            
            

        }
		
		
		
		function GetItemDetails(objRecord,invoice_id)
	{
		
		log.debug('GetItemDetails invoice_id', JSON.stringify(invoice_id)); 
		
		
		
		
		 var filters=[ ["type","anyof","CustInvc","CustCred"], 
      "AND", 
      ["mainline","is","F"], 
      "AND", 
      ["shipping","is","F"], 
      "AND", 
      ["taxline","is","F"], 
      "AND", 
      ["internalid","anyof",invoice_id]
   ];
	  
	  var columns=[
	   search.createColumn({name: "item", label: "item"}),
	   search.createColumn({name: "line", label: "line"}),
      search.createColumn({name: "quantity", label: "quantity"}),
      search.createColumn({name: "memo", label: "memo"}),
      search.createColumn({name: "amount", label: "fxrate"}),
      search.createColumn({ name: "custrecord_in_gst_hsn_code",join: "CUSTCOL_IN_HSN_CODE", label: "gst_hsn_code" }),
	  search.createColumn({name: "custrecord_uqc_code", join: "CUSTCOL_IN_UQC", label: "uqc" }),
      search.createColumn({ name: "type", join: "item", label: "type"})
     
	  
	  ]; 
	  
	  var item_data = common.searchAllRecord('transaction',null,filters,columns); 
			var item_Details = common.pushSearchResultIntoArray(item_data);
			
			log.debug('item_Details item_Details', JSON.stringify(item_Details)); 		
		
				var items = [];
			
				 for (var i = 0; i < item_Details.length; i++) {
					 	var item = {};
					 
					 	var item_id = item_Details[i].item;
					 	var line = item_Details[i].line;
						var tax_data = GetTaxDetailsItemWise(invoice_id,item_id,line);
					log.debug('tax_data tax_data', JSON.stringify(tax_data)); 


						
					 	var quantity = item_Details[i].quantity;
					 	var type = item_Details[i].type;
					 	var memo = item_Details[i].memo;
					 	var fxrate = item_Details[i].fxrate;
					 	var uqc = item_Details[i].uqc;
					 	
					 	var gst_hsn_code = item_Details[i].gst_hsn_code;
					   if((type == 'Service') || (type == 'NonInvtPart')){
						var IsServc = 'Y';  
					   }else{
						var IsServc = 'N';     
					   }
					   item['quantity'] = quantity;
					   item['memo'] = memo;
					   item['fxrate'] = fxrate;
					   item['uqc'] = 'OTH';
					   item['gst_hsn_code'] = gst_hsn_code;
					   item['IsServc'] = IsServc;
					   item['sgst_amt'] = tax_data[0].sgst_amt;
					   item['cgst_amt'] = tax_data[0].cgst_amt;
					   item['igst_amt'] = tax_data[0].igst_amt;
					   item['gst_rate'] = tax_data[0].gst_rate;
					 
					 items.push(item);
					 
				 }
				 
				 	log.debug('items items', JSON.stringify(items)); 
			
		return 	items;	 
	
	}
	
	
	
	
	function GetTaxDetailsItemWise(invoice_id,item_id,line)
	{
			log.debug('GetTaxDetailsItemWise item_id', JSON.stringify(item_id)); 
		
		 var filters=[  ["type","anyof","CustInvc","CustCred"], 
      "AND", 
      ["mainline","is","F"], 
      "AND", 
      ["shipping","is","F"], 
      "AND", 
      ["taxline","is","F"], 
      "AND", 
      ["internalid","anyof",invoice_id], 
      "AND", 
      ["item","anyof",item_id],"AND", 
      ["taxdetail.linenumber","equalto",line]
   ];
	  
	  var columns=[
	     search.createColumn({  name: "details", join: "taxDetail", label: "details"  }),
     
      search.createColumn({name: "taxamount", join: "taxDetail", label: "taxamount"}),
      
      search.createColumn({ name: "taxbasis",  join: "taxDetail",  label: "taxbasis" }),
      search.createColumn({ name: "taxcode",  join: "taxDetail",  label: "taxcode" }),
      search.createColumn({ name: "taxrate", join: "taxDetail", label: "taxrate" }),
      search.createColumn({name: "taxtype", join: "taxDetail",label: "taxtype" })
	  
	  ]; 
	  
	  var cgst_amt = 0;
	  var sgst_amt = 0;
	  var igst_amt = 0;
	  
	  var cgst_rate = 0;
	  var sgst_rate = 0;
	  var igst_rate = 0;
	  
	  var tax_data = common.searchAllRecord('transaction',null,filters,columns); 
			var tax_Details = common.pushSearchResultIntoArray(tax_data);
			
		log.debug('tax_data ---'+item_id, JSON.stringify(tax_data)); 
		log.debug('GetTaxDetailsItemWise ---'+item_id, JSON.stringify(tax_Details)); 
			var taxs_array = [];
				var tax_val = {};
			 for (var t = 0; t < tax_Details.length; t++) {
			var taxcode = tax_data[t].getText({name: 'taxcode', join: 'taxDetail' });
			log.debug('taxcode ---'+item_id, JSON.stringify(taxcode)); 
			if(taxcode == 'CGST'){
				cgst_amt = tax_Details[t].taxamount;
				cgst_rate = parseFloat(tax_Details[t].taxrate);
			}
			
			if(taxcode == 'SGST'){
				sgst_amt = tax_Details[t].taxamount;
				sgst_rate = parseFloat(tax_Details[t].taxrate);
			}
			
			if(taxcode == 'IGST'){
				igst_amt = tax_Details[t].taxamount;
				igst_rate = parseFloat(tax_Details[t].taxrate);
			}
			
			 }
			 
			 
						tax_val['sgst_amt'] = sgst_amt;
					   tax_val['cgst_amt'] = cgst_amt;
					   tax_val['igst_amt'] = igst_amt;
					   tax_val['gst_rate'] = cgst_rate+sgst_rate+igst_rate;
					   taxs_array.push(tax_val); 
			 
				
			
		
	return taxs_array;
	}
		
			function GetBuyersDetails(entity) 
	{
		log.debug('GetBuyersDetails entity', JSON.stringify(entity)); 
		
		 var filters=[ ["internalid","anyof",entity]
   ];
	  
	  var columns=[
	  search.createColumn({name: "entityid",label: "name"}),
      search.createColumn({name: "defaulttaxreg", label: "defaulttaxreg"}),
      search.createColumn({name: "address1", label: "address1"}),
      search.createColumn({name: "address2", label: "address2"}),
      search.createColumn({name: "city", label: "city"}),
      search.createColumn({name: "state", label: "state"}),
      search.createColumn({name: "zipcode", label: "zipcode"}),
      search.createColumn({name: "email", label: "email"})
     
	  
	  ]; 
	  
	  var customer_data = common.searchAllRecord('customer',null,filters,columns); 
			var Buyers_Details = common.pushSearchResultIntoArray(customer_data);
		log.debug('Buyers_Details entity', JSON.stringify(Buyers_Details)); 		
		
return Buyers_Details;		
	
	}
		
		function GetApiToken(gstin) 
	{
		
		 var filters=[  ["internalid","is",1] ];
	  
	  var columns=[
	 search.createColumn({name: "custrecord_api_gstin", label: "gstin"}),
      search.createColumn({name: "custrecord_api_token", label: "token"})
     
	  
	  ]; 
	  
	  var token_data = common.searchAllRecord('customrecord_gstin_token_for_api',null,filters,columns); 
			var Token_Details = common.pushSearchResultIntoArray(token_data);
		
		log.debug('Token_Details Token_Details', JSON.stringify(Token_Details)); 
return Token_Details;		
	
	}
		

		
		
		
		
	
	
		


	function GetShippingDetails(invoice_id) 
	{
		
		 log.debug('Ship_Details GetShippingDetails', JSON.stringify(invoice_id)); 
		
		 var filters=[    ["type","anyof","CustInvc"], 
      "AND", 
      ["mainline","is","T"], 
      "AND", 
      ["internalid","anyof",invoice_id] ];
	  
	  var columns=[
	  search.createColumn({name: "shipaddress1", label: "shipaddress1"}),
      search.createColumn({name: "shipaddress2", label: "shipaddress2"}),
      search.createColumn({name: "shipcity", label: "shipcity"}),
      search.createColumn({name: "shipstate", label: "shipstate"}),
      search.createColumn({name: "shipzip", label: "shipzip"}),
	  search.createColumn({name: "billaddress1", label: "billaddress1"}),
      search.createColumn({name: "billaddress2", label: "billaddress2"}),
      search.createColumn({name: "billcity", label: "billcity"}),
      search.createColumn({name: "billstate", label: "billstate"}),
      search.createColumn({name: "billzip", label: "billzip"})
     
	  
	  ]; 
	  
	  var ship_data = common.searchAllRecord('invoice',null,filters,columns); 
			var Ship_Details = common.pushSearchResultIntoArray(ship_data);
		
		 log.debug('Ship_Details Ship_Details', JSON.stringify(Ship_Details)); 
return Ship_Details;		
	
	}
			 
			 
			 function GetDispatchDetails(location_val) 
	{
		log.debug('GetDispatchDetails location_val', JSON.stringify(location_val)); 
		
		 var filters=[ ["internalid","anyof",location_val]
   ];
	  
	  var columns=[
	  search.createColumn({ name: "name",sort: search.Sort.ASC,label: "name"}),
      search.createColumn({name: "phone", label: "phone"}),
      search.createColumn({name: "city", label: "city"}),
      search.createColumn({name: "state", label: "state"}),
      search.createColumn({name: "country", label: "country"}),
      search.createColumn({name: "address1", label: "address1"}),
      search.createColumn({name: "address2", label: "address2"}),
      search.createColumn({name: "zip", label: "zip"})
     
	  
	  ]; 
	  
	  var location_data = common.searchAllRecord('location',null,filters,columns); 
			var Dispatch_Details = common.pushSearchResultIntoArray(location_data);
				
		
return Dispatch_Details;		
	
	}
          

		
	
		
		
		function GetSellerDetails(subsidiary,nexus) 
	{
		
		 
		
		 var filters=[  ["internalid","anyof",subsidiary] ];
	  
	  var columns=[
	  search.createColumn({name: "namenohierarchy",label: "name"}),
      search.createColumn({name: "city", label: "city"}),
      search.createColumn({name: "state", label: "state"}),
      search.createColumn({name: "country", label: "country"}),
      search.createColumn({name: "currency", label: "currency"}),
      search.createColumn({name: "legalname", label: "legalname"}),
      search.createColumn({name: "address1", label: "address1"}),
      search.createColumn({name: "address2", label: "address2"}),
	   search.createColumn({name: "taxregistrationnumber", label: "taxregistrationnumber"}),
      search.createColumn({name: "zip", label: "zip"})
     
	  
	  ]; 
	  
	  var subsidiary_data = common.searchAllRecord('subsidiary',null,filters,columns); 
			var Seller_Details = common.pushSearchResultIntoArray(subsidiary_data);
	log.debug('Seller_Details nexus', JSON.stringify(Seller_Details)); 	
		
return Seller_Details;		
	
	}
		
		

function FormatDateString(dateString,userDateFormat) 
	{
		
		return moment(dateString).format(userDateFormat);
	}
       

        return {
            onRequest: onRequest
        };

    })