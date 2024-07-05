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
			
			  var addressRecord = record.load({
                type: record.Type.ADDRESS,
                id: 393269,
                isDynamic: false // Set this to true if you want to edit the record
            });
			log.debug('addressRecord addressRecord', JSON.stringify(addressRecord));  	
		//	var invoice_id = 3679657;
			 var objRecord = record.load({
			type: record.Type.INVOICE,
				id: invoice_id
			});
			 var tranid = objRecord.getValue({fieldId: 'tranid'});
			 var trandate = objRecord.getValue({fieldId: 'trandate'});
			 
			  trandate = FormatDateString(trandate,'DD/MM/YYYY');	
			  
			 var nexus = objRecord.getValue({fieldId: 'nexus'});
			
			 var subsidiary = objRecord.getValue({fieldId: 'subsidiary'});
			 var entity = objRecord.getValue({fieldId: 'entity'});
			 var location_val = objRecord.getValue({fieldId: 'location'});
			  
			 var subtotal = objRecord.getValue({fieldId: 'subtotal'});
			
			 var taxtotal = objRecord.getValue({fieldId: 'taxtotal'});
	
			
			 var total = objRecord.getValue({fieldId: 'total'});
			
			 var subsidiary_val = objRecord.getText({fieldId: 'subsidiary'});
			 
			 var Seller_Details = GetSellerDetails(subsidiary, nexus);	
			 
			 var Buyers_Details = GetBuyersDetails(entity);	 
			 var State_Details = GetGstStateCode();	 
			 
			 if(location_val != ""){
		var Dispatch_Details = GetDispatchDetails(location_val);
		 log.debug('Dispatch_ Dispatch_Details', JSON.stringify(Dispatch_Details)); 
		  sellerAddr1 = Dispatch_Details[0].address1;
				 sellerAddr2 = Dispatch_Details[0].address2;
				 sellerLoc = Dispatch_Details[0].city;
				 sellerPin = Dispatch_Details[0].zip;
				 sellStcd = Dispatch_Details[0].state;
				sellStcd_index = _.findIndex(State_Details, function(o) { return o.alpha_code == sellStcd; }); 
				 sellerStcd = State_Details[sellStcd_index].state_code;
				 dispatchNm = Dispatch_Details[0].name;
				 dispatchAddr1 = Dispatch_Details[0].address1;
				 dispatchAddr2 = Dispatch_Details[0].address2;
				 dispatchLoc = Dispatch_Details[0].city;
				 dispatchStcd = Dispatch_Details[0].state.substring(0, 2);
				  dispatchStcd_index = _.findIndex(State_Details, function(o) { return o.alpha_code == dispatchStcd; }); 
				 dispatchStcd = State_Details[dispatchStcd_index].state_code;
				 dispatchPin = Dispatch_Details[0].zip;
		 
			 }else{
				 
				  sellerAddr1 = Seller_Details[0].address1;
				 sellerAddr2 = Seller_Details[0].address2;
				 sellerLoc = Seller_Details[0].city;
				 sellerPin = Seller_Details[0].zip;
				 sellStcd = Seller_Details[0].state;
				 sellStcd_index = _.findIndex(State_Details, function(o) { return o.alpha_code == sellStcd; }); 
				 sellerStcd = State_Details[sellStcd_index].state_code;
				
				dispatchNm = Seller_Details[0].name;
				 dispatchAddr1 = Seller_Details[0].address1;
				 dispatchAddr2 = Seller_Details[0].address2;
				 dispatchLoc = Seller_Details[0].city;
				 dispatchStcd = Seller_Details[0].state.substring(0, 2);
				  dispatchStcd_index = _.findIndex(State_Details, function(o) { return o.alpha_code == dispatchStcd; }); 
				 dispatchStcd = State_Details[dispatchStcd_index].state_code;
				 
				 dispatchPin = Seller_Details[0].zip;
			 }
			 
			 	var ship_Details = GetShippingDetails(invoice_id);	
			  log.debug('ship_Details', JSON.stringify(ship_Details));
			 
			 var shipaddr1 = ship_Details[0].shipaddress1;
				var shipaddr2 = ship_Details[0].shipaddress2;
				var shipcity = ship_Details[0].shipcity;
				var shipstate = ship_Details[0].shipstate;
				var shipzip = ship_Details[0].shipzip;
			  var state_code_buyer = shipstate;
				state_code_buyer_index = _.findIndex(State_Details, function(o) { return o.alpha_code == state_code_buyer; }); 
				 state_code_buyer = State_Details[state_code_buyer_index].state_code;
	  
			
				
	  
				var billaddress1 = ship_Details[0].billaddress1;
				var billaddress2 = ship_Details[0].billaddress2;
				var billcity = ship_Details[0].billcity;
				var billstate = ship_Details[0].billstate;
				 billstate_index = _.findIndex(State_Details, function(o) { return o.alpha_code == billstate; }); 
				 state_code_buyer_detail = State_Details[billstate_index].state_code;
				 
				
				var billzip = ship_Details[0].billzip;
				var entitytaxregnum = ship_Details[0].bill_gstin;
				
				
			 var Item_Details = GetItemDetails(objRecord,invoice_id);	 
		
			 log.debug('Item_Details fetch', JSON.stringify(Item_Details)); 
			 
			   
		  
		  var values = [];
		   for (var p = 0; p < Item_Details.length; p++) {
			    log.debug('Item_Details Item_Details  '+p, JSON.stringify(Item_Details[p])); 
			 var qty_item =  Math.abs(Item_Details[p].quantity);
			 var TotAmt =  Math.abs(Item_Details[p].fxrate*1);
		  values[p] =
		  {
                    "SlNo": p,
                    "PrdDesc": Item_Details[p].memo,
                    "IsServc": "Y",
                    "HsnCd": "998313",
                    "BchDtls": null,
                    "Barcde": null,
                    "Qty": qty_item,
                    "FreeQty": null,
                    "Unit": "OTH",
                    "UnitPrice": 0,
                    "TotAmt": TotAmt,
                    "Discount": 0,
                    "PreTaxVal": null,
                    "AssAmt": TotAmt,
                    "GstRt": Item_Details[p].tax_rate,
                    "IgstAmt": Item_Details[p].tax_amt*1,
                    "CgstAmt": 0,
                    "SgstAmt": 0,
                    "CesRt": 0,
                    "CesAmt": 0,
                    "CesNonAdvlAmt": 0,
                    "StateCesRt": null,
                    "StateCesAmt": null,
                    "StateCesNonAdvlAmt": null,
                    "OthChrg": null,
                    "OrdLineRef": null,
                    "TotItemVal": TotAmt+(parseFloat(Item_Details[p].tax_amt)),
                    "OrgCntry": null,
                    "PrdSlNo": null,
                    "AttribDtls": null
                }
		  
		   }
		   
		    
		  
		  var edocContent = [
    {
        "transaction": {
            "Version": "1.1",
            "TranDtls": {
                "TaxSch": "GST",
                "RegRev": null,
                "SupTyp": "B2B",
                "EcmGstin": null,
                "IgstOnIntra": "N"
            },
            "RefDtls": null,
            "AddlDocDtls": null,
            "DocDtls": {
                "Typ": "INV",
                "No": tranid,
                "Dt": trandate
            },
            "ExpDtls": null,
            "EwbDtls": null,
            "SellerDtls": {
                "Gstin": "29AAFCD5862R000",
                "LglNm": Seller_Details[0].legalname,
                "TrdNm": Seller_Details[0].name,	 
                "Addr1": sellerAddr1,
                "Addr2": sellerAddr2,
                "Loc": sellerLoc,
                "Pin": sellerPin,
                "Stcd": sellerStcd,
                "Ph": null,
                "Em": null
            },
			
			
				
            "BuyerDtls": {
                "Gstin": entitytaxregnum,
                "LglNm": Buyers_Details[0].name,
                "TrdNm": Buyers_Details[0].name,
                "Pos": state_code_buyer_detail,
                "Addr1": billaddress1,
                "Addr2": billaddress2,
                "Loc": billcity,
                "Pin": billzip,
                "Stcd": state_code_buyer_detail,
                "Ph": null,
                "Em": Buyers_Details[0].email
            },
            "PayDtls": null,
            "DispDtls": {				 
                "Nm": dispatchNm,
                "Addr1": dispatchAddr1,
                "Addr2": dispatchAddr2,
                "Loc": dispatchLoc,
                "Stcd": dispatchStcd,
                "Pin": dispatchPin,
            },
            "ShipDtls": {
                "LglNm": Buyers_Details[0].name,
                "TrdNm": Buyers_Details[0].name,
                "Gstin": entitytaxregnum,
                "Addr1": shipaddr1,
                "Addr2": shipaddr2,
                "Loc": shipcity,
                "Pin": shipzip,
                "Stcd": state_code_buyer
            },
            "ItemList":values,
            "ValDtls": {
                "AssVal": subtotal,
                "CgstVal": 0,
                "SgstVal": 0,
                "IgstVal": taxtotal,
                "CesVal": 0,
                "StCesVal": null,
                "Discount": 0,
                "OthChrg": 0,
                "RndOffAmt": null,
                "TotInvVal": total,
                "TotInvValFc": null
            }
        },
        "custom_fields": {
            "doc_no": tranid,
            "name": subsidiary_val
        },
        "meta_data": {
            "tag": "Invoice"
        }
    }
];
			 
			 var Api_Token = GetApiToken(1);
		
		var token_val = Api_Token[0].token;			
		var gstin_val = "29AAFCD5862R000";
		
		var headerObj = new Array();
		headerObj['X-Cleartax-Auth-Token'] = token_val;	
		headerObj['Content-Type'] = 'application/json';	
		headerObj['Accept'] = 'application/json';	
		headerObj['gstin'] = gstin_val;	
		
		var url_new = 'https://api-sandbox.clear.in/einv/v2/eInvoice/generate';
		
		var response = https.put({ url: url_new,body: JSON.stringify(edocContent),headers: headerObj});

				log.debug('json_obj values', JSON.stringify(response));
				log.debug('json_obj values body', JSON.parse(response.body));
			 
			  context.response.write(JSON.stringify(response));
            
            

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
		
	
	 function GetGstStateCode() 
	{
		 
		
		 var filters=[  ["isinactive","is","F"] ];
	  
	  var columns=[
	   search.createColumn({name: "custrecord_gst_state_code", label: "state_code"}),
      search.createColumn({name: "custrecordgst_alpha_code", label: "alpha_code"})
     
	  
	  ]; 
	  
	  var state_data = common.searchAllRecord('customrecord_gst_state_code',null,filters,columns); 
			var state_Details = common.pushSearchResultIntoArray(state_data);
				
		
return state_Details;		
	
	}	
		
		
		
		
		function GetItemDetails(objRecord,invoice_id)
	{
		
		log.debug('GetItemDetails invoice_id', JSON.stringify(invoice_id)); 
		
		var item_list = objRecord.getLineCount({sublistId: 'item'}) ;
		var sublistName = objRecord.getSublists();
		
		
		
		 var filters=[ ["type","anyof","CustInvc"], 
      "AND", 
      ["mainline","is","F"], 
      "AND", 
      ["shipping","is","F"], 
      "AND", 
      ["taxline","is","F"], 
      "AND", 
      ["internalid","anyof",invoice_id],
	   "AND", 
      ["amount","greaterthan","0.00"]
   ];
	  
	  var columns=[
	   search.createColumn({name: "item", label: "item"}),
	   search.createColumn({name: "line", label: "line"}),
      search.createColumn({name: "quantity", label: "quantity"}),
      search.createColumn({name: "memo", label: "memo"}),
      search.createColumn({name: "fxamount", label: "fxrate"}),
	   search.createColumn({ name: "custitem22",join: "item", label: "hsn" }),
	    search.createColumn({ name: "formulacurrency",formula: "({fxamount}/{amount})*{taxamount}",label: "tax_amt"}),
      search.createColumn({ name: "type", join: "item", label: "type"}),
	   search.createColumn({ name: "formulanumeric", formula: "{taxitem.rate}", label: "tax_rate"})
     
	  
	  ]; 
	  
	  var item_data = common.searchAllRecord('invoice',null,filters,columns); 
			var item_Details = common.pushSearchResultIntoArray(item_data);
			
			log.debug('item_Details item_Details', JSON.stringify(item_Details)); 		
		
		return item_Details;		 
	
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
	  search.createColumn({name: "custrecord1555", join: "billingAddress",label: "bill_gstin" }),
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
          

		
		
		function GetBuyersDetails(entity) 
	{
		log.debug('GetBuyersDetails entity', JSON.stringify(entity)); 
		
		 var filters=[ ["internalid","anyof",entity]
   ];
	  
	  var columns=[
	  search.createColumn({name: "entityid",label: "name"}),
    
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