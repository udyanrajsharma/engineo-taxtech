/**
 * @NApiVersion 2.0
 * @NScriptType MapReduceScript
 * @NModuleScope Public
 */

var emailObj = {};

define(['N/record', 'N/search', 'N/runtime', "N/error", 'N/file', 'N/task', "../lib/common_2.0","../lib/moment.js",'N/url','N/https','N/email','N/render'],

		
function(record, search, runtime, error, file, task,common,moment,url,https,email,render) {
	var sessionobj = runtime.getCurrentSession();
	var scriptObj = runtime.getCurrentScript();
	
	var invoice_data = scriptObj.getParameter('custscript_invoice_data_map');
	var gen_edoc_folder = scriptObj.getParameter('custscript_gen_edoc_folder');
	var inv_pdf_folder = scriptObj.getParameter('custscript_inv_pdf_folder');
	var certify_edoc_folder = scriptObj.getParameter('custscript_certify_edoc_folder');
	var email_sender = scriptObj.getParameter('custscript_edoc_email_sender');
	var bulk_tax_url = scriptObj.getParameter('custscript_bulk_tax_url');
		var invoice_data =	JSON.parse(invoice_data);
		 var message_array="";
	
    /**
     * Marks the beginning of the Map/Reduce process and generates input data.
     *
     * @typedef {Object} ObjectRef
     * @property {number} id - Internal ID of the record instance
     * @property {string} type - Record type id
     *
     * @return {Array|Object|Search|RecordRef} inputSummary
     * @since 2015.1
     */
    function getInputData() {
     
	    var inputData = convertToInputData(invoice_data);
    	return inputData;
    }
    
    /**
     * Executes when the map entry point is triggered and applies to each key/value pair.
     *
     * @param {MapSummary} context - Data collection containing the key/value pairs to process through the map stage
     * @since 2015.1
     */
    function map(context) {
         var contextVal = JSON.parse(context.value);
		log.debug('contextVal contextVal', JSON.stringify(contextVal)); 
	 log.debug('contextVal internal_id', JSON.stringify(contextVal.internal_id)); 
		var invoice_id_map =  contextVal.internal_id;
    	var Generates_Details = GeneratesEdocInvoice(invoice_id_map);
    	var certify_Details = CertifyEdocInvoice(invoice_id_map);
		var Create_Invoicepdf = CreateInvoicePdf(invoice_id_map);
		
		context.write(invoice_id_map, certify_Details);
   }
	
	
	function GeneratesEdocInvoice(invoice_id) 
	{
		
		 log.debug('GeneratesEdocInvoice invoice_id', JSON.stringify(invoice_id)); 
		
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
		
			 var taxtotal25 = objRecord.getValue({fieldId: 'taxtotal94'});
			 if(taxtotal25 != undefined){
				taxtotal25 = taxtotal25; 
			 }else{
				taxtotal25 = 0; 
			 }
		
			 var taxtotal26 = objRecord.getValue({fieldId: 'taxtotal95'});
			  if(taxtotal26 != undefined){
				taxtotal26 = taxtotal26; 
			 }else{
				taxtotal26 = 0; 
			 }
			 
			
			 var taxtotal27 = objRecord.getValue({fieldId: 'taxtotal96'});
			  if(taxtotal27 != undefined){
				taxtotal27 = taxtotal27; 
			 }else{
				taxtotal27 = 0; 
			 }
			
			 var total = objRecord.getValue({fieldId: 'total'});
			
			 
			 
			 
			 
			 
			 var subsidiary_val = objRecord.getText({fieldId: 'subsidiary'});
		 log.debug('GeneratesEdocInvoice nexus', JSON.stringify(nexus)); 
		var Seller_Details = GetSellerDetails(subsidiary, nexus);	
		 log.debug('Seller_Details Seller_Details', JSON.stringify(Seller_Details)); 
		var Buyers_Details = GetBuyersDetails(entity);	 
		if(location_val != ""){
		var Dispatch_Details = GetDispatchDetails(location_val);
		var state_code_dispatch = Dispatch_Details[0].state;
				state_code_dispatch = state_code_dispatch.split("-");
		}		
		
		var Item_Details = GetItemDetails(objRecord,invoice_id);	 
		 
			 
			

	  
			var state_code = Seller_Details[0].state;
				state_code = state_code.split("-");
				
				var state_code_buyer = Buyers_Details[0].state;
				state_code_buyer = state_code_buyer.split("-");
				
				
				
		
		  
		  
		  var values = [];
		   for (var p = 0; p < Item_Details.length; p++) {
			 var qty_item =  Math.abs(Item_Details[p].quantity);
			 var TotAmt =  Math.abs(Item_Details[p].fxrate*1);
		  values[p] =
		  {
                    "SlNo": p,
                    "PrdDesc": Item_Details[p].memo,
                    "IsServc": Item_Details[p].IsServc,
                    "HsnCd": Item_Details[p].gst_hsn_code,
                    "BchDtls": null,
                    "Barcde": null,
                    "Qty": qty_item,
                    "FreeQty": null,
                    "Unit": null,
                    "UnitPrice": 0,
                    "TotAmt": TotAmt,
                    "Discount": 0,
                    "PreTaxVal": null,
                    "AssAmt": TotAmt,
                    "GstRt": Item_Details[p].gst_rate,
                    "IgstAmt": Item_Details[p].igst_amt*1,
                    "CgstAmt": Item_Details[p].cgst_amt*1,
                    "SgstAmt": Item_Details[p].sgst_amt*1,
                    "CesRt": 0,
                    "CesAmt": 0,
                    "CesNonAdvlAmt": 0,
                    "StateCesRt": null,
                    "StateCesAmt": null,
                    "StateCesNonAdvlAmt": null,
                    "OthChrg": null,
                    "OrdLineRef": null,
                    "TotItemVal": TotAmt+(parseFloat(Item_Details[p].igst_amt)+parseFloat(Item_Details[p].cgst_amt)+parseFloat(Item_Details[p].sgst_amt)),
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
                "Gstin": Seller_Details[0].taxregistrationnumber,
                "LglNm": Seller_Details[0].legalname,
                "TrdNm": Seller_Details[0].name,
               
                "Addr1": Seller_Details[0].address1,
                "Addr2": Seller_Details[0].address2,
                "Loc": Seller_Details[0].city,
                "Pin": Seller_Details[0].zip,
                "Stcd": state_code[0],
                "Ph": null,
                "Em": null
            },
            "BuyerDtls": {
                "Gstin": Buyers_Details[0].defaulttaxreg,
                "LglNm": Buyers_Details[0].name,
                "TrdNm": Buyers_Details[0].name,
                "Pos": state_code_buyer[0],
                "Addr1": Buyers_Details[0].address1,
                "Addr2": Buyers_Details[0].address2,
                "Loc": Buyers_Details[0].city,
                "Pin": Buyers_Details[0].zipcode,
                "Stcd": state_code_buyer[0],
                "Ph": null,
                "Em": Buyers_Details[0].email
            },
            "PayDtls": null,
            "DispDtls": {
                "Nm": Buyers_Details[0].name,
                "Addr1": Seller_Details[0].address1,
                "Addr2": Seller_Details[0].address2,
                "Loc": Seller_Details[0].city,
                "Stcd": state_code[0],
                "Pin": Seller_Details[0].zip,
            },
            "ShipDtls": {
                "LglNm": Buyers_Details[0].name,
                "TrdNm": Buyers_Details[0].name,
                "Gstin": Buyers_Details[0].defaulttaxreg,
                "Addr1": Buyers_Details[0].address1,
                "Addr2": Buyers_Details[0].address2,
                "Loc": Buyers_Details[0].city,
                "Pin": Buyers_Details[0].zipcode,
                "Stcd": state_code_buyer[0]
            },
            "ItemList":values,
            "ValDtls": {
                "AssVal": subtotal,
                "CgstVal": taxtotal26,
                "SgstVal": taxtotal27,
                "IgstVal": taxtotal25,
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


var fileName = 'Invoice_'+tranid+'_edoc.json';
				var File = file.create({
					name: fileName,
					fileType: file.Type.JSON,
					contents: JSON.stringify(edocContent)
				});

					File.folder = gen_edoc_folder;
					var edoc_id = File.save();
					
var otherId = record.submitFields({type: record.Type.INVOICE,id: invoice_id,values: {'custbody_psg_ei_content': JSON.stringify(edocContent),'custbody_psg_ei_status' : 19,'custbody_psg_ei_generated_bulk_edoc' : edoc_id}});


log.debug('edocContent edocContent', JSON.stringify(edocContent));
		
		
	}
	
	
	 function convertToInputData(invoice_data) {
       

        var inputData = [];
        for (var a = 0; a < invoice_data.length; a++) {
            var inputObj = {};

			inputObj['internal_id'] = invoice_data[a];
			inputData.push(inputObj);
        }

        return inputData;
    }
	
	
	function GetApiToken(gstin) 
	{
		
		 var filters=[  ["custrecord_api_gstin","is",gstin] ];
	  
	  var columns=[
	 search.createColumn({name: "custrecord_api_gstin", label: "gstin"}),
      search.createColumn({name: "custrecord_api_token", label: "token"})
     
	  
	  ]; 
	  
	  var token_data = common.searchAllRecord('customrecord_gstin_token_for_api',null,filters,columns); 
			var Token_Details = common.pushSearchResultIntoArray(token_data);
		
		log.debug('Token_Details Token_Details', JSON.stringify(Token_Details)); 
return Token_Details;		
	
	}
	
	
	
	
	function GetSellerDetails(subsidiary,nexus) 
	{
		
		 log.debug('GetSellerDetails nexus', JSON.stringify(subsidiary)); 
		
		 var filters=[  ["internalid","anyof",subsidiary], 
      "AND", 
      ["nexuscountry","anyof","IN"], 
      "AND", 
      ["nexus","anyof",nexus] ];
	  
	  var columns=[
	  search.createColumn({name: "namenohierarchy",label: "name"}),
      search.createColumn({name: "city", label: "city"}),
      search.createColumn({name: "state", label: "state"}),
      search.createColumn({name: "country", label: "country"}),
      search.createColumn({name: "currency", label: "currency"}),
      search.createColumn({name: "legalname", label: "legalname"}),
      search.createColumn({name: "address1", label: "address1"}),
      search.createColumn({name: "address2", label: "address2"}),
      search.createColumn({name: "zip", label: "zip"}),
      search.createColumn({name: "taxregistrationnumber", label: "taxregistrationnumber"})
     
	  
	  ]; 
	  
	  var subsidiary_data = common.searchAllRecord('subsidiary',null,filters,columns); 
			var Seller_Details = common.pushSearchResultIntoArray(subsidiary_data);
		
		
return Seller_Details;		
	
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
				
		
return Buyers_Details;		
	
	}
	
	function FormatDateString(dateString,userDateFormat) 
	{
		
		return moment(dateString).format(userDateFormat);
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
      ["internalid","anyof",invoice_id]
   ];
	  
	  var columns=[
	   search.createColumn({name: "item", label: "item"}),
      search.createColumn({name: "quantity", label: "quantity"}),
      search.createColumn({name: "memo", label: "memo"}),
      search.createColumn({name: "fxamount", label: "fxrate"}),
      search.createColumn({ name: "custrecord_in_gst_hsn_code",join: "CUSTCOL_IN_HSN_CODE", label: "gst_hsn_code" }),
      search.createColumn({ name: "type", join: "item", label: "type"})
     
	  
	  ]; 
	  
	  var item_data = common.searchAllRecord('invoice',null,filters,columns); 
			var item_Details = common.pushSearchResultIntoArray(item_data);
			
			log.debug('item_Details item_Details', JSON.stringify(item_Details)); 		
		
				var items = [];
			
				 for (var i = 0; i < item_Details.length; i++) {
					 	var item = {};
					 
					 	var item_id = item_Details[i].item;
						var tax_data = GetTaxDetailsItemWise(invoice_id,item_id);
						
					 	var quantity = item_Details[i].quantity;
					 	var type = item_Details[i].type;
					 	var memo = item_Details[i].memo;
					 	var fxrate = item_Details[i].fxrate;
					 	var gst_hsn_code = item_Details[i].gst_hsn_code;
					   if((type == 'Service') || (type == 'NonInvtPart')){
						var IsServc = 'Y';  
					   }else{
						var IsServc = 'N';     
					   }
					   item['quantity'] = quantity;
					   item['memo'] = memo;
					   item['fxrate'] = fxrate;
					   item['gst_hsn_code'] = gst_hsn_code;
					   item['IsServc'] = IsServc;
					   item['sgst_amt'] = tax_data[0].sgst_amt;
					   item['cgst_amt'] = tax_data[0].cgst_amt;
					   item['igst_amt'] = tax_data[0].igst_amt;
					   item['gst_rate'] = tax_data[0].gst_rate;
					 
					 items.push(item);
					 
				 }
			
		return 	items;	 
	
	}
	
	
	
	
	function GetTaxDetailsItemWise(invoice_id,item_id)
	{
			log.debug('GetTaxDetailsItemWise item_id', JSON.stringify(item_id)); 
		
		 var filters=[  ["type","anyof","CustInvc"], 
      "AND", 
      ["mainline","is","F"], 
      "AND", 
      ["shipping","is","F"], 
      "AND", 
      ["taxline","is","F"], 
      "AND", 
      ["internalid","anyof",invoice_id], 
      "AND", 
      ["item","anyof",item_id]
   ];
	  
	  var columns=[
	     search.createColumn({  name: "details", join: "taxDetail", label: "details"  }),
     
      search.createColumn({name: "taxamount", join: "taxDetail", label: "taxamount"}),
      search.createColumn({  name: "taxfxamount",  join: "taxDetail",   label: "taxfxamount" }),
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
	  
	  var tax_data = common.searchAllRecord('invoice',null,filters,columns); 
			var tax_Details = common.pushSearchResultIntoArray(tax_data);
		
			var taxs_array = [];
				var tax_val = {};
			 for (var t = 0; t < tax_Details.length; t++) {
			var taxcode = tax_data[t].getText({name: 'taxcode', join: 'taxDetail' });
			
			if(taxcode == 'CGST'){
				cgst_amt = tax_Details[t].taxfxamount;
				cgst_rate = parseFloat(tax_Details[t].taxrate);
			}
			
			if(taxcode == 'SGST'){
				sgst_amt = tax_Details[t].taxfxamount;
				sgst_rate = parseFloat(tax_Details[t].taxrate);
			}
			
			if(taxcode == 'IGST'){
				igst_amt = tax_Details[t].taxfxamount;
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
	
	
	
	function CreateInvoicePdf(invoice_id) {
			
		invoice_id =	Number(invoice_id);
			 log.debug('invoice_data CreateInvoicePdf', invoice_id); 
			
				var transactionFile = render.transaction({entityId: invoice_id,printMode: render.PrintMode.PDF,formId: 166});
	

					transactionFile.folder = inv_pdf_folder;
					var file_id = transactionFile.save();

         var otherId = record.submitFields({type: record.Type.INVOICE,id: invoice_id,values: {'custbody_edoc_generated_pdf': file_id}});
	

        }
		
		
		function SendFileEmail(msg_val) {

         
		  
		  var senderId = email_sender;
			var email_body = '<p > E-Documents Generation and Certification process complete. </p>';
		
	var email_body1 = '<table border="1">';
	
	var email_body7 = '<tr><td><strong>Invoice #</strong></td><td><strong>Status </strong></td></tr>';
	
	
	
	var email_body2 = '</table>';	
	var email_body3 = '<br>';	
	var email_body4 = 'Thanks<br>';

	
	var email_bodyy = 	email_body+email_body3+email_body1+email_body7+msg_val+email_body2+email_body3+email_body4;
	
		var recipientId = 'imam08013@gmail.com';
		
		var emailattributes = {
					author : senderId,
					recipients : recipientId,
					subject: 'E-Documents Generation and Certification Process Email',
					body :  email_bodyy
			};
		
		
		
		email.send(emailattributes);
	

        }
		
		
		function CertifyEdocInvoice(invoice_id) 
	{
		 var objRecord = record.load({
			type: record.Type.INVOICE,
				id: invoice_id
			});
			
			var tranid = objRecord.getValue({fieldId: 'tranid'});
			var psg_ei_content = JSON.parse(objRecord.getValue({fieldId: 'custbody_psg_ei_content'}));
			var nexus = objRecord.getValue({fieldId: 'nexus'});
			var subsidiary = objRecord.getValue({fieldId: 'subsidiary'});
			var Seller_Details = GetSellerDetails(subsidiary, nexus);	 
		var Api_Token = GetApiToken(Seller_Details[0].taxregistrationnumber);
		
		var token_val = Api_Token[0].token;			
		var gstin_val = Api_Token[0].gstin;	
		
		
		var headerObj = new Array();
		headerObj['X-Cleartax-Auth-Token'] = token_val;	
		headerObj['Content-Type'] = 'application/json';	
		headerObj['Accept'] = 'application/json';	
		headerObj['gstin'] = gstin_val;	
		
		var url_new = bulk_tax_url;
		
			var response = https.put({ url: url_new,body: JSON.stringify(psg_ei_content),headers: headerObj});

				log.debug('json_obj values', JSON.stringify(response));
				log.debug('json_obj values body', JSON.parse(response.body));
				var body_val = JSON.parse(response.body);
				var fileName = 'Invoice_'+tranid+'.json';
				var File = file.create({
					name: fileName,
					fileType: file.Type.JSON,
					contents: JSON.stringify(body_val)
				});

					File.folder = certify_edoc_folder;
					var file_id = File.save();
					
				var is_success =	body_val[0].govt_response.Success;
				if(is_success == 'Y'){
				var success_msg = 'Success';	
				
				objRecord.setValue({ fieldId: 'custbody_in_ei_irn', value: body_val[0].govt_response.Irn});
			objRecord.setValue({ fieldId: 'custbody_in_ei_ackno', value: body_val[0].govt_response.AckNo});
			objRecord.setValue({ fieldId: 'custbody_in_ei_irn_status', value: body_val[0].govt_response.Success});
			objRecord.setValue({ fieldId: 'custbody_in_ei_qrcode', value: body_val[0].govt_response.SignedQRCode});
			objRecord.setValue({ fieldId: 'custbody_in_ei_signedinv', value: body_val[0].govt_response.SignedInvoice});
			objRecord.setValue({ fieldId: 'custbody_psg_ei_status', value: 3});
				
				}else{
					var success_msg = 'Failled';
					objRecord.setValue({ fieldId: 'custbody_psg_ei_status', value: 21});
				}
				
				objRecord.setValue({ fieldId: 'custbody_psg_ei_certified_edoc', value: file_id});
				var recordId = objRecord.save();	
			
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
		
		var msg_val = GetEinvoice_status(invoice_data);
		
		log.debug('msg_val msg_val', JSON.stringify(msg_val)); 
		var Create_Invoicepdf = SendFileEmail(msg_val);		
	    	
    }
    
	

	function GetEinvoice_status(invoice_data) 
	{
		
		 var filters=[  ["type","anyof","CustInvc"], 
      "AND", 
      ["mainline","is","T"], 
      "AND", 
      ["internalid","anyof",invoice_data] ];
	  
	  var columns=[
	   search.createColumn({name: "custbody_in_ei_irn_status", label: "irn_status"}),
	   search.createColumn({name: "tranid", label: "tranid"})
     
	  
	  ]; 
	  
	  var invoice_data = common.searchAllRecord('invoice',null,filters,columns); 
			var invoice_Details = common.pushSearchResultIntoArray(invoice_data);
			
			 for (var b = 0; b < invoice_Details.length; b++) {
			var irn_status = invoice_Details[b].irn_status;
			var tranid = invoice_Details[b].tranid;
			if(irn_status == 'Y'){
				var success_msg = 'Success';	
			}else{
				
			var success_msg = 'Failled';		
			}
				var msg_val = "<tr><td>"+tranid+"</td><td>"+success_msg+"</td></tr>";
			 message_array+=msg_val;
			
			}
		
		
return message_array;		
	
	}


    return {
        getInputData: getInputData,
        map: map,
        summarize: summarize
    };
    
});
