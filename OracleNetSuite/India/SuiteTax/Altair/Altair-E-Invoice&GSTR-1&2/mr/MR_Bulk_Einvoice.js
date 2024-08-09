/**
 * @NApiVersion 2.0
 * @NScriptType MapReduceScript
 * @NModuleScope Public
 */

var emailObj = {};

define(['N/record', 'N/search', 'N/runtime', "N/error", 'N/file', 'N/task', "../lib/common_2.0","../lib/moment.js",'N/url','N/https','N/email','N/render', "../lib/lodash.min"],

		
function(record, search, runtime, error, file, task,common,moment,url,https,email,render,_) {
	var sessionobj = runtime.getCurrentSession();
	var scriptObj = runtime.getCurrentScript();
	var userObj = runtime.getCurrentUser();
	var invoice_data = scriptObj.getParameter('custscript_invoice_data_map');
	var gen_edoc_folder = scriptObj.getParameter('custscript_gen_edoc_folder');
	var inv_pdf_folder = scriptObj.getParameter('custscript_inv_pdf_folder');
	var certify_edoc_folder = scriptObj.getParameter('custscript_certify_edoc_folder');
	var email_sender = scriptObj.getParameter('custscript_edoc_email_sender');
	var bulk_tax_url = scriptObj.getParameter('custscript_bulk_tax_url');
		var invoice_data =	JSON.parse(invoice_data);
		 var message_array="";
	  var sub_gstin = ["36AAFCD5862R014","29AAFCD5862R000","07AAFCD5862R007","33AAFCD5862R009","27AAFCD5862R013"]
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
	// log.debug('contextVal internal_id', JSON.stringify(contextVal.internal_id)); 
		var invoice_id_map =  contextVal.internal_id;
    	
		try {
		var Generates_Details = GeneratesEdocInvoice(invoice_id_map);
    	}catch (e) {
			log.debug('Generates_Details', JSON.stringify(e));
		}
    	
		var certify_Details = CertifyEdocInvoice(invoice_id_map);
		var Create_Invoicepdf = CreateInvoicePdf(invoice_id_map);
		
		context.write(invoice_id_map, Generates_Details);
   }
	
	
	function GeneratesEdocInvoice(invoice_id) 
	{
		
	//	 log.debug('GeneratesEdocInvoice invoice_id', JSON.stringify(invoice_id)); 
		var rec_type = 'Invoice';
		var req_type = 'INV';
		try {
			
		 var objRecord = record.load({
			type: record.Type.INVOICE,
				id: invoice_id
			});
		}catch (e) {
			 var objRecord = record.load({
			type: 'creditmemo',
				id: invoice_id
			});
			
			rec_type = 'CreditMemo';
			req_type = 'CRN';
			
		}
			 var tranid = objRecord.getValue({fieldId: 'tranid'});
			 var trandate = objRecord.getValue({fieldId: 'trandate'});
			 
			  trandate = FormatDateString(trandate,'DD/MM/YYYY');	
			  
			   var otherrefnum = objRecord.getValue({ fieldId: "otherrefnum" });
     var clientpo_date = objRecord.getValue({ fieldId: "custbody_bpc_po_date" });

    if(clientpo_date != ""){
			  clientpo_date = FormatDateString(clientpo_date, "DD/MM/YYYY");
			
		}
			  
			 var nexus = objRecord.getValue({fieldId: 'nexus'});
			
			 var subsidiary = objRecord.getValue({fieldId: 'subsidiary'});
			 var entity = objRecord.getValue({fieldId: 'entity'});
			 var endcustomer = objRecord.getValue({fieldId: 'custbody_bpc_endcustomer'});
			if(endcustomer == ""){
			endcustomer	= entity;
			}
			var location_val = objRecord.getValue({fieldId: 'location'});
			var seller_location = objRecord.getValue({fieldId: 'custbody_bpc_india_seller_location'});
			var remittance_info = objRecord.getValue({fieldId: 'custbody_bpc_remittance_info'});
			  
			 var subtotal = objRecord.getValue({fieldId: 'subtotal'});
			
			 var taxtotal = objRecord.getValue({fieldId: 'taxtotal'});
			 var customer_po = objRecord.getValue({fieldId: 'custbody_customer_po'});
			 var buyer_gstin = objRecord.getText({fieldId: 'entitytaxregnum'});
			  var supply_type = objRecord.getText({fieldId: 'custbody_bpc_india_etax_supply_type'});
			  var reg_type = objRecord.getText({fieldId: 'custbody_bpc_in_reg_type'});
			  var terms = objRecord.getText({fieldId: 'terms'});
			 
		 log.debug('buyer_gstin fetch', JSON.stringify(buyer_gstin));
		
			 var taxtotal25 = objRecord.getValue({fieldId: 'taxtotal32'});
			 if(taxtotal25 != undefined){
				taxtotal25 = taxtotal25; 
			 }else{
				taxtotal25 = 0; 
			 }
		
		log.debug('taxtotal25 IGST', JSON.stringify(taxtotal25));
		
			 var taxtotal26 = objRecord.getValue({fieldId: 'taxtotal33'});
			  if(taxtotal26 != undefined){
				taxtotal26 = taxtotal26; 
			 }else{
				taxtotal26 = 0; 
			 }
			 
			
			 var taxtotal27 = objRecord.getValue({fieldId: 'taxtotal34'});
			  if(taxtotal27 != undefined){
				taxtotal27 = taxtotal27; 
			 }else{
				taxtotal27 = 0; 
			 }
			
			 var total = objRecord.getValue({fieldId: 'total'});
			
			  if(reg_type == 'SEZ'){
				
					 if (taxtotal == 0) {
						var supply_type = "SEZWOP";
					  } else {
						var supply_type = "SEZWP";
					  }
								 
			 }
			 
			 
			 
			 
			 var subsidiary_val = objRecord.getText({fieldId: 'subsidiary'});
		// log.debug('GeneratesEdocInvoice nexus', JSON.stringify(nexus)); 
		var Seller_Details = GetSellerDetails(subsidiary, nexus);	
	 log.debug('Seller_Details Seller_Details', JSON.stringify(Seller_Details)); 
		var Buyers_Details = GetBuyersDetails(entity);	 
		 
		if(location_val != ""){
		var Dispatch_Details = GetDispatchDetails(location_val);
		// log.debug('Dispatch_ Dispatch_Details', JSON.stringify(Dispatch_Details)); 
				
				 sellerAddr1 = Dispatch_Details[0].address1;
				 sellerAddr2 = Dispatch_Details[0].address2;
				 sellerLoc = Dispatch_Details[0].city;
				 sellerPin = Dispatch_Details[0].zip;
				 sellerStcd = Dispatch_Details[0].state;
				 sellerStcd = Dispatch_Details[0].state.substring(0, 2);
				 dispatchNm = Dispatch_Details[0].name;
				 dispatchAddr1 = Dispatch_Details[0].address1;
				 dispatchAddr2 = Dispatch_Details[0].address2;
				 dispatchLoc = Dispatch_Details[0].city;
				 dispatchStcd = Dispatch_Details[0].state.substring(0, 2);
				 dispatchPin = Dispatch_Details[0].zip;
		}else{
			
				 sellerAddr1 = Seller_Details[0].address1;
				 sellerAddr2 = Seller_Details[0].address2;
				 sellerLoc = Seller_Details[0].city;
				 sellerPin = Seller_Details[0].zip;
				 sellerStcd = Seller_Details[0].state;
				 sellerStcd = Seller_Details[0].state.substring(0, 2);
				 dispatchNm = Seller_Details[0].name;
				 dispatchAddr1 = Seller_Details[0].address1;
				 dispatchAddr2 = Seller_Details[0].address2;
				 dispatchLoc = Seller_Details[0].city;
				 dispatchStcd = Seller_Details[0].state.substring(0, 2);
				 dispatchPin = Seller_Details[0].zip;
			
			
		}

			if(seller_location != ""){
			var seller_loc = GetSellerLocation(seller_location);
					 var sellerPin = seller_loc.getValue({fieldId: 'custrecord_bpc_state_pin'});
					 var sellerLoc = seller_loc.getValue({fieldId: 'custrecord_bpc_india_office_location'});
					 var sellerStcd = seller_loc.getValue({fieldId: 'custrecord_bpc_india_state_code'});
					 var sellerAddr1 = seller_loc.getValue({fieldId: 'custrecord_bpc_india_address_1'});
					 var sellerAddr2 = seller_loc.getValue({fieldId: 'custrecord_bpc_india_office_address_2'});
			}
			
			 var payee_name,ulti_beni,purpose_code,intermediary_bank;
					var acc_no = "";
					var branch_no = "";
					var swift_code = "";
			if(remittance_info != ""){
			var remit_info = GetBankRemitInfo(remittance_info);
					  payee_name = remit_info.getValue({fieldId: 'custrecord_bpc_bankremit_bankname'});
					  ulti_beni = remit_info.getValue({fieldId: 'custrecord_bpc_remit_special_info'});
					  purpose_code = remit_info.getValue({fieldId: 'custrecord_bpc_bankremit_aba'});
					  intermediary_bank = remit_info.getValue({fieldId: 'custrecord_bpc_intermediary_bank'});
					  swift_code = remit_info.getValue({fieldId: 'custrecord_bpc_bankremit_swift'});
					  acc_no = remit_info.getValue({fieldId: 'custrecord_bpc_bankremit_bankacct'});
					  branch_no = remit_info.getValue({fieldId: 'custrecord_bpc_bankremit_branch'});
					
			}
			
			
			
		if(rec_type == 'Invoice'){
		var Item_Details = GetItemDetails(objRecord,invoice_id);	 
		}else{
		var Item_Details = GetItemDetails_Creditmemo(objRecord,invoice_id);	 
		}
			 log.debug('Item_Details fetch', JSON.stringify(Item_Details)); 
			 
		
			 
			
			
			var ship_Details = GetShippingDetails(invoice_id);	
				
				var shipaddr1 = ship_Details[0].shipaddress1;
				var shipaddr2 = ship_Details[0].shipaddress2;
				var shipcity = ship_Details[0].shipcity;
				var shipstate = ship_Details[0].shipstate;
				var shipzip = ship_Details[0].shipzip;
				var billcountrycode = ship_Details[0].billcountrycode;
			  var state_code_buyer = shipstate;
				state_code_buyer = state_code_buyer.split("-");
	  
			var state_code = Seller_Details[0].state;
				state_code = state_code.split("-");
				if(state_code_buyer == ""){
				var state_code_buyer = Buyers_Details[0].state;
				state_code_buyer = state_code_buyer.split("-");
				}
				
	  
				var billaddress1 = ship_Details[0].billaddress1;
				var billaddress2 = ship_Details[0].billaddress2;
				var billcity = ship_Details[0].billcity;
				var billstate = ship_Details[0].billstate;
				state_code_buyer_detail = billstate.split("-");
				var billzip = ship_Details[0].billzip;
				var entitytaxregnum = ship_Details[0].entitytaxregnum;
			
			
			//var buyer_gstin = GetShippingGstin(endcustomer);	
			//buyer_gstin = GetShippingGstin(endcustomer,state_code_buyer[0],buyer_gstin);
			
		if(billcountrycode != 'IN'){
			entitytaxregnum = 'URP';
          buyer_gstin = 'URP';
			var buyer_pos = '96';
			var ship_state = '96';
			var cnt_code = billcountrycode;
            billzip = '999999';
			shipzip = '999999';
		}else{
			
			
			var buyer_pos = state_code_buyer_detail[0];
			var ship_state = state_code_buyer[0];
			var cnt_code = null;
			
			buyer_gstin = GetShippingGstin(endcustomer,ship_state,buyer_gstin);
		}
		 var dis_patch_state = Seller_Details[0].taxregistrationnumber.substring(0, 2); 
		  var seller_gstin = "29AAFCD5862R000";
		  
		  
		  
		   for (var r = 0; r < sub_gstin.length; r++) {
			  var gstin_val = sub_gstin[r].substring(0, 2);
			
			  
			  if(gstin_val == dis_patch_state){
				seller_gstin =  sub_gstin[r];
			  }
		   }
		   
		  if(supply_type != 'EXPWOP'){
			  purpose_code = null;
		  }
		  
		   if(supply_type == 'EXPWOP'){
			  
				 billaddress2 = ship_Details[0].billstate+' '+ship_Details[0].billzip;  
				 shipaddr2 = ship_Details[0].shipstate+' '+ship_Details[0].shipzip;  
			  
			 
		  }
		  
		  if(customer_po != ""){
			  
			 var customerpo_info = GetCustomerPoInfo(customer_po); 
			
			  otherrefnum = customerpo_info.getValue({fieldId: 'name'});
			  clientpo_date = customerpo_info.getValue({fieldId: 'custrecord_proj_po_date'});
              clientpo_date = FormatDateString(clientpo_date,'DD/MM/YYYY');	
			  terms = customerpo_info.getText({fieldId: 'custrecord_proj_po_inv_terms'});
		  }
		  
		   log.debug('Item_Details newwww', JSON.stringify(Item_Details)); 
		  
		  var values = [];
		  
		   var bpc_productcla = Item_Details[0].bpc_productcla;
		    
			 if(bpc_productcla == 'Paidup' || bpc_productcla == 'Lease'){
				var g = 0;
				var Item_Details_paidup =  _.orderBy(Item_Details, ['fxrate'],['desc']);
				
				 var qty_item =  Math.abs(Item_Details_paidup[g].quantity);
			 var TotAmt =  Math.abs(Item_Details_paidup[g].fxrate*1);
			 
			 var bpc_productcla = Item_Details_paidup[g].bpc_productcla;
			
             
		  values[g] =
		  {
                    "SlNo": 1,
                    "PrdDesc": Item_Details_paidup[g].memo,
                    "IsServc": Item_Details_paidup[g].IsServc,
                    "HsnCd": Item_Details_paidup[g].gst_hsn_code,
                    "BchDtls": null,
                    "Barcde": null,
                    "Qty": qty_item,
                    "FreeQty": null,
                    "Unit": Item_Details_paidup[g].uqc,
                    "UnitPrice": 0,
                    "TotAmt": subtotal,
                    "Discount": 0,
                    "PreTaxVal": null,
                    "AssAmt": subtotal,
                    "GstRt": Item_Details_paidup[g].gst_rate,
                    "IgstAmt": taxtotal25,
                    "CgstAmt": taxtotal26,
                    "SgstAmt": taxtotal27,
                    "CesRt": 0,
                    "CesAmt": 0,
                    "CesNonAdvlAmt": 0,
                    "StateCesRt": null,
                    "StateCesAmt": null,
                    "StateCesNonAdvlAmt": null,
                    "OthChrg": null,
                    "OrdLineRef": null,
                    "TotItemVal": total,
                    "OrgCntry": null,
                    "PrdSlNo": null,
                    "AttribDtls": null
                }
				
				 
			 }else{
		   
		   for (var p = 0; p < Item_Details.length; p++) {
			  //  log.debug('Item_Details Item_Details  '+p, JSON.stringify(Item_Details[p])); 
			 var qty_item =  Math.abs(Item_Details[p].quantity);
			 var TotAmt =  Math.abs(Item_Details[p].fxrate*1);
			 
			 var bpc_productcla = Item_Details[p].bpc_productcla;
			
				
					 var q = (p)+Number(1);
             
		  values[p] =
		  {
                    "SlNo": q,
                    "PrdDesc": Item_Details[p].memo,
                    "IsServc": Item_Details[p].IsServc,
                    "HsnCd": Item_Details[p].gst_hsn_code,
                    "BchDtls": null,
                    "Barcde": null,
                    "Qty": qty_item,
                    "FreeQty": null,
                    "Unit": Item_Details[p].uqc,
                    "UnitPrice": 0,
                    "TotAmt": TotAmt,
                    "Discount": 0,
                    "PreTaxVal": null,
                    "AssAmt": TotAmt,
                    "GstRt": Item_Details[p].gst_rate,
                    "IgstAmt": Math.abs(Item_Details[p].igst_amt*1),
                    "CgstAmt": Math.abs(Item_Details[p].cgst_amt*1),
                    "SgstAmt": Math.abs(Item_Details[p].sgst_amt*1),
                    "CesRt": 0,
                    "CesAmt": 0,
                    "CesNonAdvlAmt": 0,
                    "StateCesRt": null,
                    "StateCesAmt": null,
                    "StateCesNonAdvlAmt": null,
                    "OthChrg": null,
                    "OrdLineRef": null,
                    "TotItemVal": parseFloat(TotAmt+(parseFloat(Item_Details[p].igst_amt)+parseFloat(Item_Details[p].cgst_amt)+parseFloat(Item_Details[p].sgst_amt))).toFixed(2),
                    "OrgCntry": null,
                    "PrdSlNo": null,
                    "AttribDtls": null
                }
				 
			 }

             }
		  
		   
		   
		if(supply_type == 'B2C') {


		
			var edocContent =  {
    "transaction": {
      "Version": "1.1",
      "TranDtls": {
        "TaxSch": "GST",
        "SupTyp": "B2C",
        "RegRev": "Y",
        "EcmGstin": null,
        "IgstOnIntra": "N"
      },
      "DocDtls": {
                 "Typ": req_type,
                "No": tranid,
                "Dt": trandate
            },
     "SellerDtls": {
                "Gstin": seller_gstin,
                "LglNm": Seller_Details[0].legalname,
                "TrdNm": Seller_Details[0].name,	 
                "Addr1": sellerAddr1,
                "Addr2": sellerAddr2,
                "Loc": sellerLoc,
                "Pin": sellerPin,
                "Stcd": dis_patch_state,
                "Ph": null,
                "Em": null
            },
			
			"BuyerDtls": {
                "Gstin": entitytaxregnum,
                "LglNm": ship_Details[0].billaddressee,
                "TrdNm": Buyers_Details[0].name,
                "Pos": buyer_pos,
                "Addr1": billaddress1,
                "Addr2": billaddress2,
                "Loc": billcity,
                "Pin": billzip,
                "Stcd": buyer_pos,
                "Ph": null,
                "Em": Buyers_Details[0].email
            },
			
			"DispDtls": {				 
                "Nm": dispatchNm,
                "Addr1": dispatchAddr1,
                "Addr2": dispatchAddr2,
                "Loc": dispatchLoc,
                "Stcd": dis_patch_state,
                "Pin": dispatchPin,
            },
			 "ShipDtls": {
                "LglNm": ship_Details[0].shipaddressee,
                "TrdNm": Buyers_Details[0].name,
                "Gstin": buyer_gstin,
                "Addr1": shipaddr1,
                "Addr2": shipaddr2,
                "Loc": shipcity,
                "Pin": shipzip,
                "Stcd": ship_state
            },
      "ItemList": values,
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
            },
		 
		  "PayDtls": {
        "Nm": payee_name,
        "AccDet": acc_no,
        "Mode": "Direct Transfer",
        "FinInsBr": branch_no,
        "PayTerm": terms,
        "PayInstr": "",
        "CrTrn": "",
        "DirDr": "" ,
        "CrDay": "" ,
        "PaidAmt": "",
        "PaymtDue":"",
		 "PayeeUPI": "altair@sb"
      },
     RefDtls: {
                InvRm: tranid,
                ContrDtls: [
                  {
                    RecAdvRefr: null,
                    RecAdvDt: null,
                    TendRefr: null,
                    ContrRefr: null,
                    ExtRefr: null,
                    ProjRefr: null,
                    PORefr: otherrefnum,
                    PORefDt: clientpo_date,
                  },
                ],
              },
	  "ExpDtls": null,
      
      "custom_fields": {
       "doc_no": tranid,
       "name": subsidiary_val,
	   "Ultimate Beneficiary":ulti_beni,
	   "Purpose Code":purpose_code,
	   "Swift Code": swift_code,
	   "Intermediary Bank": intermediary_bank
    }
    }
  };
  

		}else{			
		  
		  var edocContent = [
    {
        "transaction": {
            "Version": "1.1",
            "TranDtls": {
                "TaxSch": "GST",
                "RegRev": null,
                "SupTyp": supply_type,
                "EcmGstin": null,
                "IgstOnIntra": "N"
            },
             RefDtls: {
                InvRm: tranid,
                ContrDtls: [
                  {
                    RecAdvRefr: null,
                    RecAdvDt: null,
                    TendRefr: null,
                    ContrRefr: null,
                    ExtRefr: null,
                    ProjRefr: null,
                    PORefr: otherrefnum,
                    PORefDt: clientpo_date,
                  },
                ],
              },
            "AddlDocDtls": null,
            "DocDtls": {
                "Typ": req_type,
                "No": tranid,
                "Dt": trandate
            },
            "ExpDtls": {
				"ForCur": null,
				"Port": null,
				"ShipBNo": null,
				"ShipBDt": null,
				"RefClm": null,
				"CntCode": cnt_code
				},
            "EwbDtls": null,
            "SellerDtls": {
                "Gstin": seller_gstin,
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
                "LglNm": ship_Details[0].billaddressee,
                "TrdNm": Buyers_Details[0].name,
                "Pos": buyer_pos,
                "Addr1": billaddress1,
                "Addr2": billaddress2,
                "Loc": billcity,
                "Pin": billzip,
                "Stcd": buyer_pos,
                "Ph": null,
                "Em": Buyers_Details[0].email
            },
            "PayDtls": {
		"Nm": payee_name,
        "AccDet": acc_no,
        "Mode": "Direct Transfer",
        "FinInsBr": branch_no,
        "PayTerm": terms,
        "PayInstr": "",
        "CrTrn": "",
        "DirDr": "" ,
        "CrDay": "" ,
        "PaidAmt": "",
        "PaymtDue":"" 
      },
            "DispDtls": {				 
                "Nm": dispatchNm,
                "Addr1": dispatchAddr1,
                "Addr2": dispatchAddr2,
                "Loc": dispatchLoc,
                "Stcd": dispatchStcd,
                "Pin": dispatchPin,
            },
            "ShipDtls": {
                "LglNm": ship_Details[0].shipaddressee,
                "TrdNm": Buyers_Details[0].name,
                "Gstin": buyer_gstin,
                "Addr1": shipaddr1,
                "Addr2": shipaddr2,
                "Loc": shipcity,
                "Pin": shipzip,
                "Stcd": ship_state
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
       "name": subsidiary_val,
	   "Ultimate Beneficiary":ulti_beni,
	   "Purpose Code":purpose_code,
	   "Swift Code": swift_code,
	   "Intermediary Bank": intermediary_bank
        },
        "meta_data": {
            "tag": rec_type
        }
    }
];
		}

var fileName = rec_type+'_'+tranid+'_edoc.json';
				var File = file.create({
					name: fileName,
					fileType: file.Type.JSON,
					contents: JSON.stringify(edocContent,null,4)
				});

					File.folder = gen_edoc_folder;
					var edoc_id = File.save();
					 var today = new Date();
		if(rec_type == 'Invoice'){		 
var otherId = record.submitFields({type: record.Type.INVOICE,id: invoice_id,values: {'custbody_psg_ei_content': JSON.stringify(edocContent),'custbody_psg_ei_status' : 19,'custbody_psg_ei_generated_bulk_edoc' : edoc_id,'custbody_bulk_einvoice_gen_date' : today,'custbody_custom_gstin' : seller_gstin}});
	
log.debug('otherId otherId', JSON.stringify(otherId));
	
		}else{
		var otherId = record.submitFields({type: 'creditmemo',id: invoice_id,values: {'custbody_psg_ei_content': JSON.stringify(edocContent),'custbody_psg_ei_status' : 19,'custbody_psg_ei_generated_bulk_edoc' : edoc_id,'custbody_bulk_einvoice_gen_date' : today,'custbody_custom_gstin' : seller_gstin}});	
			
		}

log.debug('edocContent edocContent', JSON.stringify(edocContent));
		
		
	}
	
	
	function GetCustomerPoInfo(customer_po) {
       
			 var customer_po = record.load({
			type: 'customrecord_bpc_project_po',
				id: customer_po
			});
       log.debug('customer_po', JSON.stringify(customer_po)); 

        return customer_po;
    }
	
	function GetBankRemitInfo(seller_location) {
       
			 var seller_Record = record.load({
			type: 'customrecord_bpc_bank_remit_info',
				id: seller_location
			});
       log.debug('seller_Record', JSON.stringify(seller_Record)); 

        return seller_Record;
    }
	
	
	function GetSellerLocation(seller_location) {
       
			 var seller_Record = record.load({
			type: 'customrecord_bpc_india_state_mapping',
				id: seller_location
			});
       log.debug('seller_Record', JSON.stringify(seller_Record)); 

        return seller_Record;
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
	
	function GetShippingGstin(endcustomer,ship_state,buyer_gstin)
	{
		
		 log.debug('GetShippingGstin GetShippingGstin', JSON.stringify(endcustomer)); 
		
		 var filters=[ ["internalid","anyof",endcustomer] ];
	  
	  var columns=[
	  search.createColumn({
         name: "taxregistrationnumber",
         join: "taxRegistration",
         label: "taxregistrationnumber"
      }),
      search.createColumn({
         name: "formulatext",
         formula: "substr(to_char({taxregistration.taxregistrationnumber}), 1, 2)",
         label: "tax_det"
      })
     
	  
	  ]; 
	  
	  var ship_tax_data = common.searchAllRecord('customer',null,filters,columns); 
			var ship_tax_Details = common.pushSearchResultIntoArray(ship_tax_data);
		var taxregistrationnumber = buyer_gstin;
		 for (var e = 0; e < ship_tax_Details.length; e++) {
			var  tax_det = ship_tax_Details[e].tax_det;
			if(tax_det == ship_state){
				taxregistrationnumber = ship_tax_Details[e].taxregistrationnumber;
			}
		 }
	 log.debug('taxregistrationnumber taxregistrationnumber', JSON.stringify(taxregistrationnumber)); 
return taxregistrationnumber;		
	
	}
	
	function GetPaymentDetails(invoice_id) 
	{
		
		 log.debug('Ship_Details GetShippingDetails', JSON.stringify(invoice_id)); 
		
		 var filters=[    ["type","anyof","CustInvc","CustCred"], 
      "AND", 
      ["mainline","is","T"], 
      "AND", 
      ["internalid","anyof",invoice_id] ];
	  
	  var columns=[
	  search.createColumn({
         name: "custrecord_bpc_bankremit_swift",
         join: "CUSTBODY_BPC_REMITTANCE_INFO",
         label: "swift_code"
      }),
      search.createColumn({
         name: "custrecord_bpc_bankremit_bankacct",
         join: "CUSTBODY_BPC_REMITTANCE_INFO",
         label: "bankacct_no"
      }),
      search.createColumn({
         name: "custrecord_bpc_bankremit_branch",
         join: "CUSTBODY_BPC_REMITTANCE_INFO",
         label: "branch_id"
      }),
     
	  
	  ]; 
	  
	  var ship_data = common.searchAllRecord('transaction',null,filters,columns); 
			var Ship_Details = common.pushSearchResultIntoArray(ship_data);
		
		// log.debug('Ship_Details Ship_Details', JSON.stringify(Ship_Details)); 
return Ship_Details;		
	
	}
	
	
	function GetShippingDetails(invoice_id) 
	{
		
		 log.debug('Ship_Details GetShippingDetails', JSON.stringify(invoice_id)); 
		
		 var filters=[    ["type","anyof","CustInvc","CustCred"], 
      "AND", 
      ["mainline","is","T"], 
      "AND", 
      ["internalid","anyof",invoice_id] ];
	  
	  var columns=[
	   search.createColumn({name: "billaddressee", label: "billaddressee"}),
      search.createColumn({name: "shipaddressee", label: "shipaddressee"}),
	  search.createColumn({name: "shipaddress1", label: "shipaddress1"}),
      search.createColumn({name: "shipaddress2", label: "shipaddress2"}),
      search.createColumn({name: "shipcity", label: "shipcity"}),
      search.createColumn({name: "shipstate", label: "shipstate"}),
      search.createColumn({name: "shipzip", label: "shipzip"}),
	  search.createColumn({name: "billaddress1", label: "billaddress1"}),
      search.createColumn({name: "billaddress2", label: "billaddress2"}),
      search.createColumn({name: "billcity", label: "billcity"}),
      search.createColumn({name: "billstate", label: "billstate"}),
	   search.createColumn({name: "billcountrycode", label: "billcountrycode"}),
      search.createColumn({name: "billzip", label: "billzip"}),
      search.createColumn({name: "entitytaxregnum", label: "entitytaxregnum"})
     
	  
	  ]; 
	  
	  var ship_data = common.searchAllRecord('transaction',null,filters,columns); 
			var Ship_Details = common.pushSearchResultIntoArray(ship_data);
		
		// log.debug('Ship_Details Ship_Details', JSON.stringify(Ship_Details)); 
return Ship_Details;		
	
	}
	
	
	function GetSellerDetails(subsidiary,nexus) 
	{
		
		// log.debug('GetSellerDetails nexus', JSON.stringify(subsidiary)); 
		
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
		//log.debug('GetBuyersDetails entity', JSON.stringify(entity)); 
		
		 var filters=[ ["internalid","anyof",entity]
   ];
	  
	  var columns=[
	  search.createColumn({name: "altname",label: "name"}),
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
		//log.debug('Buyers_Details entity', JSON.stringify(Buyers_Details)); 		
		
return Buyers_Details;		
	
	}
	
	function FormatDateString(dateString,userDateFormat) 
	{
		
		return moment(dateString).format(userDateFormat);
	}
	
	
	function GetDispatchDetails(location_val) 
	{
		//log.debug('GetDispatchDetails location_val', JSON.stringify(location_val)); 
		
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
	
	
	function GetItemDetails_Creditmemo(objRecord,invoice_id)
	{
		
		//log.debug('GetItemDetails_Creditmemo invoice_id', JSON.stringify(invoice_id)); 
		
		
		
		
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
      search.createColumn({name: "fxamount", label: "fxrate"}),
	  search.createColumn({
         name: "formulatext",
         formula: "{line.cseg_bpc_productcla}",
         label: "bpc_productcla"
      }),
	
	   search.createColumn({name: "custcol_in_nature_of_item", label: "nature_of_item"}),
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


						
					 	var bpc_productcla = item_Details[i].bpc_productcla;
					 	var quantity = item_Details[i].quantity;
					 	var type = item_Details[i].type;
					 	var memo = item_Details[i].memo;
					 	var fxrate = item_Details[i].fxrate;
					 	var uqc = item_Details[i].uqc;
					 	
					 	var gst_hsn_code = item_Details[i].gst_hsn_code;
					   
					    var nature_of_item = item_Details[i].nature_of_item;
					   if(nature_of_item == '3'){
						var IsServc = 'Y';  
					   }else{
						var IsServc = 'N';     
					   }
					   
					   item['bpc_productcla'] = bpc_productcla;
					   item['quantity'] = quantity;
					   item['memo'] = memo;
					   item['fxrate'] = fxrate;
					   item['uqc'] = 'OTH';
					   item['gst_hsn_code'] = gst_hsn_code;
					   item['IsServc'] = IsServc;
					   item['sgst_amt'] = Math.abs(tax_data[0].sgst_amt);
					   item['cgst_amt'] = Math.abs(tax_data[0].cgst_amt);
					   item['igst_amt'] = Math.abs(tax_data[0].igst_amt);
					   item['gst_rate'] = tax_data[0].gst_rate;
					 
					 items.push(item);
					 
				 }
			
		return 	items;	 
	
	}
	function GetItemDetails(objRecord,invoice_id)
	{
		
		//log.debug('GetItemDetails invoice_id', JSON.stringify(invoice_id)); 
		
		
		
		
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
      search.createColumn({name: "fxamount", label: "fxrate"}),
	    search.createColumn({
         name: "formulatext",
         formula: "{line.cseg_bpc_productcla}",
         label: "bpc_productcla"
      }),
	   search.createColumn({name: "custcol_in_nature_of_item", label: "nature_of_item"}),
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
					//log.debug('tax_data tax_data', JSON.stringify(tax_data)); 


						
					 	var quantity = item_Details[i].quantity;
					 	var bpc_productcla = item_Details[i].bpc_productcla;
					 	var type = item_Details[i].type;
					 	var memo = item_Details[i].memo;
					 	var fxrate = item_Details[i].fxrate;
					 	var uqc = item_Details[i].uqc;
					 	
					 	var gst_hsn_code = item_Details[i].gst_hsn_code;
					   
					   var nature_of_item = item_Details[i].nature_of_item;
					   if(nature_of_item == '3'){
						var IsServc = 'Y';  
					   }else{
						var IsServc = 'N';     
					   }
					   
					   item['quantity'] = quantity;
					   item['bpc_productcla'] = bpc_productcla;
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
     
      search.createColumn({name: "taxfxamount", join: "taxDetail", label: "taxamount"}),
      
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
	
	var email_body7 = '<tr><td><strong>Invoice #</strong></td><td><strong>Status </strong></td><td><strong>Error </strong></td></tr>';
	
	
	
	var email_body2 = '</table>';	
	var email_body3 = '<br>';	
	var email_body4 = 'Thanks<br>';

	
	var email_bodyy = 	email_body+email_body3+email_body1+email_body7+msg_val+email_body2+email_body3+email_body4;

          	var resp = userObj.email;
	
		var recipientId = resp;
          
		
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

      log.debug(' CertifyEdocInvoice start', JSON.stringify(invoice_id));

			var rec_type = 'Invoice';
			try {
		 var objRecord = record.load({
			type: record.Type.INVOICE,
				id: invoice_id
			});
		}catch (e) {
			 var objRecord = record.load({
			type: 'creditmemo',
				id: invoice_id
			});
			
			rec_type = 'CreditMemo';
			
		}
			
			var tranid = objRecord.getValue({fieldId: 'tranid'});
			var psg_ei_content = JSON.parse(objRecord.getValue({fieldId: 'custbody_psg_ei_content'}));
			var nexus = objRecord.getValue({fieldId: 'nexus'});
			var subsidiary = objRecord.getValue({fieldId: 'subsidiary'});
			 var supply_type = objRecord.getText({fieldId: 'custbody_bpc_india_etax_supply_type'});
			 var custom_gstin = objRecord.getText({fieldId: 'custbody_custom_gstin'});
			 
			var Seller_Details = GetSellerDetails(subsidiary, nexus);	 
		var Api_Token = GetApiToken(Seller_Details[0].taxregistrationnumber);
		
		var token_val = Api_Token[0].token;			
		var gstin_val = custom_gstin;	
		
		var headerObj = new Array();
		headerObj['X-Cleartax-Auth-Token'] = token_val;	
		headerObj['Content-Type'] = 'application/json';	
		headerObj['Accept'] = 'application/json';	
		headerObj['gstin'] = gstin_val;	
		
		if(supply_type == 'B2C') {
			
			var url_new = 'https://api-sandbox.clear.in/einv/v1/b2c/generate-qr-code';	 
			
	var response = https.post({ url: url_new,body: JSON.stringify(psg_ei_content),headers: headerObj});		
	
	log.debug('json_obj values', JSON.stringify(response));
	
				log.debug('json_obj values body', JSON.parse(response.body));
				
				var body_val = JSON.parse(response.body);
				
				var fileName = rec_type+'_'+tranid+'.json';
				
				var File = file.create({
					name: fileName,
					fileType: file.Type.JSON,
					contents: JSON.stringify(body_val)
				});

					File.folder = certify_edoc_folder;
					var file_id = File.save();
					

var is_success =	body_val.error_code;
	log.debug('json_obj values', JSON.stringify(is_success));
if(is_success == null){
var ei_qrcode = 'data:image/png;base64, '+body_val.qr_code;
  
	objRecord.setValue({ fieldId: 'custbody_b2c_transaction_id', value: body_val.transaction_id});
objRecord.setValue({ fieldId: 'custbody_in_ei_qrcode', value: ei_qrcode});
	objRecord.setValue({ fieldId: 'custbody_psg_ei_status', value: 3});
	objRecord.setValue({ fieldId: 'custbody_in_ei_irn_status', value: 'Y'});
}else{

					var success_msg = 'Failled';
					objRecord.setValue({ fieldId: 'custbody_psg_ei_status', value: 21});	
	
}	
	objRecord.setValue({ fieldId: 'custbody_psg_ei_certified_edoc', value: file_id});
				var recordId = objRecord.save();
				
			
			
		}else{
		
		
		var url_new = bulk_tax_url;
		
			var response = https.put({ url: url_new,body: JSON.stringify(psg_ei_content),headers: headerObj});

				log.debug('json_obj values', JSON.stringify(response));
				log.debug('json_obj values body', JSON.parse(response.body));
				
				
				var body_val = JSON.parse(response.body);
				log.debug('govt_response.ErrorDetails', JSON.stringify(body_val[0].govt_response.ErrorDetails));
				var fileName = rec_type+'_'+tranid+'.json';
				var File = file.create({
					name: fileName,
					fileType: file.Type.JSON,
					contents: JSON.stringify(body_val)
				});

					File.folder = certify_edoc_folder;
					var file_id = File.save();
					var error_msg = JSON.stringify(body_val[0].govt_response.ErrorDetails);
					log.debug('error_msg.error_msg', error_msg);
					log.debug('error_msg.error_msg ----', JSON.stringify(error_msg));
				var is_success =	body_val[0].govt_response.Success;
				if(is_success == 'Y'){
				var success_msg = 'Success';	
				error_msg = "";
				objRecord.setValue({ fieldId: 'custbody_in_ei_irn', value: body_val[0].govt_response.Irn});
			objRecord.setValue({ fieldId: 'custbody_in_ei_ackno', value: body_val[0].govt_response.AckNo});
            objRecord.setValue({ fieldId: 'custbody_ack_date_bulk_einvoice', value: body_val[0].govt_response.AckDt});
			objRecord.setValue({ fieldId: 'custbody_in_ei_irn_status', value: body_val[0].govt_response.Success});
			objRecord.setValue({ fieldId: 'custbody_in_ei_qrcode', value: body_val[0].govt_response.SignedQRCode});
			objRecord.setValue({ fieldId: 'custbody_in_ei_signedinv', value: body_val[0].govt_response.SignedInvoice});
			objRecord.setValue({ fieldId: 'custbody_psg_ei_status', value: 3});

             var currentDateTime = new Date();
			objRecord.setValue({ fieldId: 'custbody_e_doc_generation_time', value: currentDateTime });
                  
			objRecord.setValue({ fieldId: 'custbody_bulk_einvoice_error', value: error_msg });
				
				}else{
					var success_msg = 'Failled';
					objRecord.setValue({ fieldId: 'custbody_psg_ei_status', value: 21});
					objRecord.setValue({ fieldId: 'custbody_bulk_einvoice_error', value: error_msg });
				}
				
				objRecord.setValue({ fieldId: 'custbody_psg_ei_certified_edoc', value: file_id});
				var recordId = objRecord.save();
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
		
		var msg_val = GetEinvoice_status(invoice_data);
		
		log.debug('msg_val msg_val', JSON.stringify(msg_val)); 
		var Create_Invoicepdf = SendFileEmail(msg_val);		
	    	
    }
    
	

	function GetEinvoice_status(invoice_data) 
	{
		
		 var filters=[  ["type","anyof","CustInvc","CustCred"], 
      "AND", 
      ["mainline","is","T"], 
      "AND", 
      ["internalid","anyof",invoice_data] ];
	  
	  var columns=[
	   search.createColumn({name: "custbody_in_ei_irn_status", label: "irn_status"}),
	   search.createColumn({name: "custbody_bulk_einvoice_error", label: "einvoice_error"}),
	   search.createColumn({name: "tranid", label: "tranid"})
     
	  
	  ]; 
	  
	  var invoice_data = common.searchAllRecord('transaction',null,filters,columns); 
			var invoice_Details = common.pushSearchResultIntoArray(invoice_data);
			
			 for (var b = 0; b < invoice_Details.length; b++) {
			var irn_status = invoice_Details[b].irn_status;
			var tranid = invoice_Details[b].tranid;
			var einvoice_error = invoice_Details[b].einvoice_error;
			if(irn_status == 'Y'){
				var success_msg = 'Success';	
			}else{
				
			var success_msg = 'Failled';		
			}
				var msg_val = "<tr><td>"+tranid+"</td><td>"+success_msg+"</td><td>"+einvoice_error+"</td></tr>";
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
