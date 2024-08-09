 /**
 * @NApiVersion 2.0
 * @NScriptType Suitelet
 * @NModuleScope Public
 */
define(['N/record', 'N/runtime', 'N/search', 'N/ui/serverWidget', 'N/encode', 'N/file', "../lib/common_2.0", "N/https", "N/url","../lib/lodash.min",'../lib/moment.js'],
    /**
     * @param {record} record
     * @param {runtime} runtime
     * @param {search} search
     */
    function(record, runtime, search, serverWidget, encode, file,common, https,url,_,moment) {

        var itemDetailsMapObject = {};
		 var sub_gstin = ["36AAFCD5862R014","29AAFCD5862R000","07AAFCD5862R007","33AAFCD5862R009","27AAFCD5862R013"];
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
            if (request.method == 'GET') {
                try {
					
					 var selection_value = parameters.selection_value;
					 log.debug('selection_value', selection_value);
                   // getSalesOrderData();
				  
					   
                    var Form = serverWidget.createForm({
                        title: 'Generate and Send GSTR Report',
                        hideNavBar: false
                    }); //Create a form
                    Form.addTab({
                        id: 'tab1',
                        label: 'Invoice'
                    });
					var periodFilters=[    ["closed","is","F"], 
      "AND", 
      ["isadjust","is","F"], 
      "AND", 
      ["isyear","is","F"], 
      "AND", 
      ["isquarter","is","F"],
"AND", 
      ["startdate","within","01/01/2024","31/03/2026"]

	  ];
			
			 var periodColumns = [	
				  search.createColumn({name: "periodname", label: "periodname",
        sort: search.Sort.ASC}),
      search.createColumn({name: "internalid", label: "internalid"})]
		var PeriodObj = common.searchAllRecord('accountingperiod',null,periodFilters,periodColumns);
		var data_period = common.pushSearchResultIntoArray(PeriodObj);
 var data_period =  _.orderBy(data_period, ['internalid'],['asc']);



		 log.debug('data_period', JSON.stringify(data_period));
		 
		 var SubsiFilters=[   ["taxregistrationnumber","isnotempty",""],"AND", ["internalid","anyof","43"] ];
			
			 var SubsiColumns = [	
				  search.createColumn({  name: "taxregistrationnumber",  summary: "GROUP",  label: "taxregistrationnumber"  }),
      search.createColumn({ name: "namenohierarchy",  summary: "GROUP",label: "namenohierarchy" }),
      search.createColumn({  name: "internalid", summary: "GROUP", label: "internalid" })
				 
				 ];
		var SubsiObj = common.searchAllRecord('subsidiary',null,SubsiFilters,SubsiColumns);
		var data_subsi = common.pushSearchResultIntoArray(SubsiObj);
		
		
		 
		 var dropdownField = Form.addField({
            id: 'custpage_period',
            type: serverWidget.FieldType.SELECT,
            label: 'Accounting Period'
        });
		
		
		  for (var p = 0; p < data_period.length; p++) {
		 dropdownField.addSelectOption({
            value: data_period[p].internalid,
            text: data_period[p].periodname
        });
		  }
		  
		   var gstr_type = Form.addField({
            id: 'custpage_type',
            type: serverWidget.FieldType.SELECT,
            label: 'Type'
        });
		
		 gstr_type.addSelectOption({
            value: 'purchase',
            text: 'Purchase'
        });
		
		
		 var gstr_gstin = Form.addField({
            id: 'custpage_gstin',
            type: serverWidget.FieldType.MULTISELECT,
            label: 'GSTIN'
        });
		
		 for (var p = 0; p < data_subsi.length; p++) {
			 var gstin_val =data_subsi[p].internalid+'~'+data_subsi[p].taxregistrationnumber;
			 
			if(gstin_val != '2~23AAACW7565P1ZP'){
		 gstr_gstin.addSelectOption({
            value: data_subsi[p].internalid+'~'+data_subsi[p].taxregistrationnumber,
            text: data_subsi[p].namenohierarchy+' ('+data_subsi[p].taxregistrationnumber+')'
        });
		
		}
		 }
		
			 var exportButton = Form.addButton({
                id: 'custpage_export_excel',
                label: 'Download & Validate GSTR2 Report',
                functionName: 'exportToExcel'
            });
					
				
				 Form.addButton({
                id: 'submitBtn',
                label: 'Send GSTR2 Report to ClearTax Portal',
				functionName: "generategstrreport"
            });
			
				
				
				var hiddenField = Form.addField({
                    id: 'custpage_submitter',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Submitter'
                });
				hiddenField.updateDisplayType({ displayType: serverWidget.FieldDisplayType.HIDDEN });	
					Form.addField({
                    id: 'custpage_main_form',
                    type: serverWidget.FieldType.INLINEHTML,
                    label: 'Main Form'
                }).defaultValue = '<form id="main_form"></form>';
					
				Form.clientScriptModulePath = '../lib/cs_bulk_einvoicing.js';
           
              
                 response.writePage(Form);
				   
                } catch (e) {
                    log.error('e,message', JSON.stringify(e));
                }
            } else {
                try {
					
					 var custpage_period = context.request.parameters.custpage_period;
					 var custpage_type = context.request.parameters.custpage_type;
					 var submitter = request.parameters.custpage_submitter;
					 
					  var custpage_gstin = request.parameters.custpage_gstin;
					 custpage_gstin = custpage_gstin.split("\u0005");
					 log.debug('custpage_gstin  ', JSON.stringify(custpage_gstin));
					
					var separatedData = custpage_gstin.map(function(str) { return str.split('~');});
					 log.debug('separatedData  ', JSON.stringify(separatedData));
					   var subsid = [];
					var gstin_val = [];
						separatedData.forEach(function(pair) {
							subsid.push(pair[0]);
						gstin_val.push(pair[1]);
							});
					  
					   log.debug('subsid  ', JSON.stringify(subsid));
					   log.debug('gstin_val  ', JSON.stringify(gstin_val));
					   
					  if(submitter == 'submit_button_1'){
			var DELIMITER = ",", NEWLINE = "\n",zero=0,no='N',blank_field="",erp_type="Netsuite";
 var data_headers = [   
	
	"Document Type",
    "Document Number",
    "Document Date",
    "Return Filing Month",
    "Place of Supply",
    "Is this a Bill of Supply",
    "Is Reverse Charge",
    "Linked Advance Document Number",
    "Linked Advance Document Date",
    "Linked Advance Adjustment Amount",
    "Linked Invoice Number",
    "Linked Invoice Date",
    "Supplier GSTIN",
    "Supplier Name",
    "Supplier Address",
    "Supplier City",
    "Supplier State",
    "Is Supplier Composition Dealer",
    "Customer GSTIN",
    "Item Category",
    "Item Description",
    "HSN or SAC code",
    "Item Quantity",
    "Item Unit Code",
    "Item Unit Price",
    "Item Discount Amount",
    "Item Taxable Amount",
    "Zero Tax Category",
    "GST Rate",
    "CGST Rate",
    "CGST Amount",
    "SGST Rate",
    "SGST Amount",
    "IGST Rate",
    "IGST Amount",
    "CESS Rate",
    "CESS Amount",
    "ITC Claim Type",
    "ITC Claim CGST Amount",
    "ITC Claim SGST Amount",
    "ITC Claim IGST Amount",
    "ITC Claim CESS Amount",
    "Document CGST Amount",
    "Document SGST Amount",
    "Document IGST Amount",
    "Document Cess Amount",
    "Document Total Amount",
    "Import Type",
    "Import Bill Number",
    "Import Bill Date",
    "Import Port Code",
    "Goods Receipt Note Number",
    "Goods Receipt Note Date",
    "Goods Receipt Note Quantity",
    "Goods Receipt Note Amount",
    "Payment Due Date",
    "ERP Source",
    "Company Code",
    "Vendor Code",
    "Voucher Type",
    "Voucher Number",
    "Voucher Date",
    "Is this Document Cancelled",
    "Is this Document Deleted",
    "External ID",
    "External Line Item ID"
];		


	log.debug('data_headers  ', JSON.stringify(data_headers));	
	log.debug('data_headers  length', JSON.stringify(data_headers.length));	

	  
	  
	  var Filter_bill =[    ["type","anyof","VendBill","VendCred"], 
      "AND", 
      ["postingperiod","abs",custpage_period], 
      "AND", 
      ["taxline","is","F"], 
      "AND", 
       
      ["mainline","is","F"], "AND",
      ["memorized","is","F"]


	  ];
	  
	  
	   var Filter_bill_tax =[    ["type","anyof","VendBill","VendCred"], 
      "AND", 
      ["postingperiod","abs",custpage_period], 
      "AND", 
      ["mainline","is","F"], 
      "AND", 
      ["taxline","is","F"], 
      "AND", 
      ["mainline","is","F"], "AND",
      ["memorized","is","F"],
	  "AND", 
      ["taxdetail.taxtype","noneof","133","52"]
	  ];
	  
	  
	   if(subsid.length > 0) {
		
		Filter_bill.push("AND", ["subsidiary","anyof",subsid]);
		Filter_bill_tax.push("AND", ["subsidiary","anyof",subsid]);
		
		
	}
	

	  
	  
	  var Columns_tax =[
	
	search.createColumn({
         name: "linenumber",
         join: "taxDetail",
         label: "linenumber"
      }),
      search.createColumn({
         name: "taxcode",
         join: "taxDetail",
         label: "taxcode"
      }),
      search.createColumn({
         name: "taxrate",
         join: "taxDetail",
         label: "taxrate"
      }),
      search.createColumn({
         name: "taxtype",
         join: "taxDetail",
         label: "taxtype"
      }),
      search.createColumn({
         name: "tranid",
         join: "taxDetail",
         label: "tranid"
      }),
      search.createColumn({
         name: "taxbasis",
         join: "taxDetail",
         label: "taxbasis"
      }),
      search.createColumn({
         name: "taxfxamount",
         join: "taxDetail",
         label: "taxamount"
      })
      ];
	  
	  
		
	  
			var Columns =[
	search.createColumn({name: "type", label: "type"}),
      search.createColumn({name: "tranid", label: "tranid"}),
      search.createColumn({name: "transactionnumber", label: "transactionnumber"}),
      search.createColumn({name: "trandate", label: "trandate"}),
      search.createColumn({name: "custbody_in_gst_pos", label: "pos"}),
      search.createColumn({name: "subsidiarytaxregnum", label: "subsidiarytaxregnum"}),
       search.createColumn({
         name: "formulatext",
         formula: "CASE WHEN {billcountry}='India' THEN {entitytaxregnum} ELSE 'URP' END",
         label: "entitytaxregnum"
      }),
      search.createColumn({name: "fxrate", label: "rate"}),
      search.createColumn({name: "fxamount", label: "amount"}),
      search.createColumn({name: "internalid", label: "internalid"}),
      search.createColumn({name: "entity", label: "entity"}),
      search.createColumn({name: "item", label: "item"}),
      search.createColumn({name: "line", label: "line"}),
      search.createColumn({name: "quantity", label: "quantity"}),
	   search.createColumn({
         name: "formulatext",
         formula: "TO_CHAR({trandate}, 'MM') || '-' ||TO_CHAR({trandate}, 'YYYY')",
         label: "return_filling_month"
      }),
	   search.createColumn({name: "totalaftertaxes", label: "totalaftertaxes"}),
      search.createColumn({
         name: "custrecord_uqc_code",
         join: "CUSTCOL_IN_UQC",
         label: "uqc_code"
      }),
	  search.createColumn({name: "custcol_in_nature_of_item", label: "nature_of_item"}),
   
	  search.createColumn({
         name: "custrecord_in_gst_hsn_code",
         join: "CUSTCOL_IN_HSN_CODE",
         label: "hsn_code"
      }),
	   search.createColumn({
         name: "custentity_in_gst_vendor_regist_type",
         join: "vendor",
         label: "regist_type"
      }),
    
	  search.createColumn({
         name: "custitem_in_nature",
         join: "item",
         label: "nature"
      }),
	   search.createColumn({
         name: "itemid",
         join: "item",
         label: "itemid"
      }),
	   search.createColumn({
         name: "formulatext",
         formula: "{custbody_in_gst_pos}",
         label: "gst_pos"
      }),
	   search.createColumn({name: "trandate", label: "billdate"}),
	   search.createColumn({name: "billaddress1", label: "billaddress1"}),
	   search.createColumn({
         name: "formulatext",
         formula: "{billingaddress.city}",
         label: "billcity"
      }),
	  
	   search.createColumn({
         name: "formulatext",
         formula: "CASE WHEN {billcountry}='India' THEN SUBSTR({billingaddress.state}, 0 , 2) ELSE '96' END",
         label: "billstate"
      }),
	  
	   search.createColumn({
         name: "formulatext",
         formula: "{name}",
         label: "entityid"
      }),
       search.createColumn({name: "billaddressee", label: "billaddressee"})
      ];
	  
	  
	
	  
	    var bill_tax_Obj = common.searchAllRecord('transaction',null,Filter_bill_tax,Columns_tax);
		var data_bill_tax = common.pushSearchResultIntoArray(bill_tax_Obj);
		log.debug('data_bill_tax  ', JSON.stringify(data_bill_tax.length));

      log.debug('data_bill_tax  data', JSON.stringify(data_bill_tax));
		
	  
	   var bill_Obj = common.searchAllRecord('transaction',null,Filter_bill,Columns);
		var data_bill = common.pushSearchResultIntoArray(bill_Obj);
		
		log.debug('data_bill length ', JSON.stringify(data_bill.length));	
		log.debug('data_bill  ', JSON.stringify(data_bill));	
	  
	  
	  if(gstin_val.length > 0){
			
var data_bill = data_bill.filter(function (invoice) {
  return gstin_val.indexOf(invoice.subsidiarytaxregnum) !== -1;
});
	
		log.debug('data_bill  ', JSON.stringify(data_bill));	
		log.debug('data_bill  ', JSON.stringify(data_bill.length));	
	}
	  	  
		
			var fileContent = '';

			
				for (var i = 0; i < data_headers.length; i++) {
						
						fileContent += data_headers[i] + DELIMITER;
						
					}
					fileContent += NEWLINE;
			
				
				
				
				for (var p = 0; p < data_bill.length; p++) {
					var itc_type = 'INPUT';
					var bill_of_supply = 'N';
					 var is_rev = 'N';
					
					
					
					var filtered_array = _.filter(data_bill_tax, { 'linenumber': data_bill[p].line, 'tranid': data_bill[p].internalid });
						var filtered_array_tax_total = _.filter(data_bill_tax, { 'tranid': data_bill[p].internalid });
						
						var tax_total_amt = 0;
						for (var c = 0; c < filtered_array_tax_total.length; c++) {
							
							tax_total_amt = parseFloat(tax_total_amt)+parseFloat(filtered_array_tax_total[c].taxamount);
							
						}
						
						var tax_rate_cgst = 0;
						var tax_rate_igst = 0;
						var taxamount_cgst = 0;
						var taxamount_igst = 0;
						var tax_total_amt_cgst = 0;
						var tax_total_amt_igst = 0;

						
						if(filtered_array.length > 0){
	
						var tax_data = filtered_array[0];
						
						if(tax_data.taxtype == 33 || tax_data.taxtype == 34 || tax_data.taxtype == 37 || tax_data.taxtype == 38 || tax_data.taxtype == 41 || tax_data.taxtype == 42 || tax_data.taxtype == 45 || tax_data.taxtype == 46   ){
						
						 tax_rate_cgst = (tax_data.taxrate).replace(/%/g, '');
						 tax_rate_igst = 0;
						 taxamount_cgst = tax_data.taxamount;
						 taxamount_igst = 0;
						 tax_total_amt_cgst = tax_total_amt/2;
						 tax_total_amt_igst = 0;
						}else{
							 tax_rate_igst = (tax_data.taxrate).replace(/%/g, '');
						 tax_rate_cgst = 0;
						 taxamount_igst = tax_data.taxamount;
						 taxamount_cgst = 0;
						 tax_total_amt_cgst = 0;
						 tax_total_amt_igst = tax_total_amt;
							
						}
						
						if(data_bill[p].nature == 1){
						 itc_type = 'INPUT';	
						}else if (data_bill[p].nature == 2){
							itc_type = 'CAPITAL GOODS';
						}else if (data_bill[p].nature == 3){
							itc_type = 'INPUT SERVICES';
						}
						
					if(data_bill[p].hsn_code == '99633' || data_bill[p].hsn_code == '99979' || data_bill[p].hsn_code == '996331' || data_bill[p].hsn_code == '996337' || data_bill[p].hsn_code == '99660' || data_bill[p].hsn_code == '996511' || data_bill[p].hsn_code == '99641'){
							 itc_type = 'Ineligible';
						}
						
						
						if(tax_data.taxtype == 40 || tax_data.taxtype == 41 || tax_data.taxtype == 42){
							
							 is_rev = 'Y';
						}else{
							 is_rev = 'N';
						}
						
						}
						
						
						
						 var item = data_bill[p].itemid;
						 
						 var item = item.replace(/,/g, " ");
						 
						 var nature_of_item = data_bill[p].nature_of_item;
						if(nature_of_item == '3'){
							var nature_of_items = 'S';
						}else{
							var nature_of_items = 'G';
						}
						
					if(data_bill[p].regist_type == '2'){
					var	is_compo = 'Y';
					var	bill_of_supply = 'Y';
					}else{
						var	is_compo = '';
						var	bill_of_supply = 'N';
					}
					if(data_bill[p].type == 'VendBill'){
						var type = 'INVOICE';
						var voucher_type = 'Bill';
						
					}else{
							var type = 'CREDIT';
							var voucher_type = 'Bill Credit';
					}
					
					
					 var seller_gstin = "29AAFCD5862R000";
					 
					 for (var r = 0; r < sub_gstin.length; r++) {
			  var gstin_val = data_bill[p].subsidiarytaxregnum.substring(0, 2);
			  var dis_patch_state = sub_gstin[r].substring(0, 2);
			
			  
			  if(gstin_val == dis_patch_state){
				seller_gstin =  sub_gstin[r];
			  }
		   }
					
					if(data_bill[p].billdate != ''){
						var date_val = data_bill[p].billdate;
					}else{
						var date_val = data_bill[p].trandate;
						
					}
					
					//data_inv[j].quantity;
					
					fileContent += type + DELIMITER;
					fileContent += data_bill[p].tranid + DELIMITER;
					fileContent += date_val + DELIMITER;
					fileContent += data_bill[p].return_filling_month + DELIMITER;
					fileContent += data_bill[p].gst_pos + DELIMITER;
					fileContent += bill_of_supply + DELIMITER;
					fileContent += is_rev + DELIMITER;
					fileContent += blank_field + DELIMITER;
					fileContent += blank_field + DELIMITER;
					fileContent += blank_field + DELIMITER;
					fileContent += blank_field + DELIMITER;
					fileContent += blank_field + DELIMITER;
				fileContent += data_bill[p].entitytaxregnum + DELIMITER;
					
					var entityid = data_bill[p].billaddressee;
					var entityid = entityid.replace(/,/g, " ");
					var billaddress1 = data_bill[p].billaddress1;
					var billaddress1 = billaddress1.replace(/,/g, " ");
					
					var billcity = data_bill[p].billcity;
					
					billcity = billcity.replace(/,/g, " ");
					
					fileContent += entityid + DELIMITER;
					fileContent += billaddress1 + DELIMITER;
					fileContent += billcity + DELIMITER;
					fileContent += data_bill[p].billstate + DELIMITER;
					fileContent += is_compo + DELIMITER;
				fileContent += seller_gstin  + DELIMITER;
					fileContent += nature_of_items + DELIMITER;
					fileContent += item + DELIMITER;
					fileContent += data_bill[p].hsn_code + DELIMITER;
					fileContent += Math.abs(data_bill[p].quantity) + DELIMITER;
					fileContent += data_bill[p].uqc_code + DELIMITER;
					fileContent += Math.abs(data_bill[p].rate) + DELIMITER;
					fileContent += zero + DELIMITER;
					fileContent += Math.abs(data_bill[p].amount) + DELIMITER;
					fileContent += blank_field + DELIMITER;
					fileContent += zero + DELIMITER;
					fileContent += Math.abs(tax_rate_cgst) + DELIMITER;
					fileContent += Math.abs(taxamount_cgst) + DELIMITER;
					fileContent += Math.abs(tax_rate_cgst) + DELIMITER;
					fileContent += Math.abs(taxamount_cgst) + DELIMITER;
					fileContent += Math.abs(tax_rate_igst) + DELIMITER;
					fileContent += Math.abs(taxamount_igst) + DELIMITER;
					fileContent += zero + DELIMITER;
					fileContent += zero + DELIMITER;
					fileContent += itc_type + DELIMITER;
					fileContent += blank_field + DELIMITER;
					fileContent += blank_field + DELIMITER;
					fileContent += blank_field + DELIMITER;
					fileContent += blank_field + DELIMITER;
					fileContent += Math.abs(tax_total_amt_cgst) + DELIMITER;
					fileContent += Math.abs(tax_total_amt_cgst) + DELIMITER;
					fileContent += Math.abs(tax_total_amt_igst) + DELIMITER;
					fileContent += zero + DELIMITER;
					fileContent += Math.abs(data_bill[p].totalaftertaxes) + DELIMITER;
					fileContent += blank_field + DELIMITER;
					fileContent += blank_field + DELIMITER;
					fileContent += blank_field + DELIMITER;
					fileContent += blank_field + DELIMITER;
					fileContent += blank_field + DELIMITER;
					fileContent += blank_field + DELIMITER;
					fileContent += blank_field + DELIMITER;
					fileContent += blank_field + DELIMITER;
					fileContent += blank_field + DELIMITER;
					fileContent += erp_type + DELIMITER;
					fileContent += blank_field + DELIMITER;
					fileContent += blank_field + DELIMITER;
					fileContent += voucher_type + DELIMITER;
					fileContent += data_bill[p].transactionnumber + DELIMITER;
					fileContent += data_bill[p].trandate + DELIMITER;
					fileContent += no + DELIMITER;
					fileContent += blank_field + DELIMITER;
					fileContent += blank_field + DELIMITER;
					fileContent += blank_field + NEWLINE;
					
					
				}
				
				var formattedDate = moment().format('YYMMDD');
				var file_name = 'gstr2_report_' + formattedDate +'.csv';
				
				var fileRec = file.create({
                    name: file_name,
                    fileType: file.Type.CSV,
                    contents: fileContent
                });
						  
						  
						  context.response.writeFile({
					file : fileRec
				});
						
						  }else{
					var Form = serverWidget.createForm({
                        title: 'Generate and Send GSTR Report',
                        hideNavBar: false
                    }); //Create a form
					
					
					 var hiddenField = Form.addField({
                id: 'custpage_acc_period',
                type: serverWidget.FieldType.TEXT,
                label: 'Hidden Field'
            });

      
           hiddenField.updateDisplayType({ displayType: serverWidget.FieldDisplayType.HIDDEN });

          
            hiddenField.defaultValue = custpage_period;
			
			
			 var hiddenField1 = Form.addField({
                id: 'custpage_report_type',
                type: serverWidget.FieldType.TEXT,
                label: 'Hidden Field'
            });

      
            hiddenField1.updateDisplayType({ displayType: serverWidget.FieldDisplayType.HIDDEN  });

          
            hiddenField1.defaultValue = custpage_type;
			
					Form.addButton({
                    id: 'goBack',
                    label: 'Back',
                    functionName: "goBack"
                });
                    Form.addTab({
                        id: 'tab1',
                        label: 'Invoice'
                    });
					
					
					 Form.addButton({
                id: 'submitBtn',
                label: 'Generate & Send GSTR Report',
				functionName: "generategstrreport"
            });
			
				
					
					  var sublist = Form.addSublist({
                        id: 'custpage_sublist',
                        type: serverWidget.SublistType.LIST,
                        label: 'Invoice'
                    });
                 
                 //  var SetSublist = setSublistReorderPoint(sublist, Form, request, response,custpage_period,custpage_type);
                    
					Form.clientScriptModulePath = '../lib/cs_bulk_einvoicing.js';
                 response.writePage(Form);
					
				
						  }
                  
			
			
                } catch (e) {
                    log.error('e.message', JSON.stringify(e));
                }
            }

        }
		
		

       

        return {
            onRequest: onRequest
        };

    })