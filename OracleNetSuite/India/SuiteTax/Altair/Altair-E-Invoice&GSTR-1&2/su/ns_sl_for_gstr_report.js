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
					var periodFilters=[   ["closed","is","F"], 
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
				  search.createColumn({name: "periodname", label: "periodname"}),
      search.createColumn({name: "internalid", label: "internalid"})]
		var PeriodObj = common.searchAllRecord('accountingperiod',null,periodFilters,periodColumns);
		var data_period = common.pushSearchResultIntoArray(PeriodObj);
		
		 var data_period =  _.orderBy(data_period, ['internalid'],['asc']);
		
		var SubsiFilters=[   ["taxregistrationnumber","isnotempty",""],"AND", ["internalid","anyof","43"] ];
			
			 var SubsiColumns = [	
				  search.createColumn({  name: "taxregistrationnumber",  summary: "GROUP",  label: "taxregistrationnumber"  }),
      search.createColumn({ name: "namenohierarchy",  summary: "GROUP",label: "namenohierarchy" }),
      search.createColumn({  name: "internalid", summary: "GROUP", label: "internalid" })
				 
				 ];
		var SubsiObj = common.searchAllRecord('subsidiary',null,SubsiFilters,SubsiColumns);
		var data_subsi = common.pushSearchResultIntoArray(SubsiObj);
		
		 log.debug('data_period', JSON.stringify(data_subsi));
		 
		 
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
            value: 'sales',
            text: 'Sales'
        });
		

		
		 var gstr_gstin = Form.addField({
            id: 'custpage_gstin',
            type: serverWidget.FieldType.MULTISELECT,
            label: 'GSTIN'
        });
		
		 for (var p = 0; p < data_subsi.length; p++) {
			 var gstin_val =data_subsi[p].internalid+'~'+data_subsi[p].taxregistrationnumber;
			 
			
		 gstr_gstin.addSelectOption({
            value: data_subsi[p].internalid+'~'+data_subsi[p].taxregistrationnumber,
            text: data_subsi[p].namenohierarchy+' ('+data_subsi[p].taxregistrationnumber+')'
        });
		
		 }
		
		
			
            
				
	  
					
				
				 Form.addButton({
                id: 'submitBtn',
                label: 'Generate & Send GSTR Report',
				functionName: "generategstrreport"
            });
			
				 var exportButton = Form.addButton({
                id: 'custpage_export_excel',
                label: 'Export to Excel',
                functionName: 'exportToExcel'
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
			var DELIMITER = ",", NEWLINE = "\n",zero=0,blank_field="";
data_headers = [
    "Document Type",
    "Document Number",
    "Document Date",
    "Return Filing Month",
    "Place of Supply",
    "Applicable Tax Rate",
    "Is this a Bill of Supply",
    "Is Reverse Charge",
    "Is GST TDS Deducted",
    "Linked Advance Document Number",
    "Linked Advance Document Date",
    "Linked Advance Adjustment Amount",
    "Original Document Number",
    "Original Document Date",
    "Original Document Customer GSTIN",
    "Linked Invoice Number",
    "Linked Invoice Date",
    "Linked Invoice Customer GSTIN",
    "Is Linked Invoice Pre GST",
    "Reason for Issuing CDN",
    "Ecommerce GSTIN",
    "Supplier GSTIN",
    "Supplier Name",
    "Customer GSTIN",
    "Customer Name",
    "Customer Address",
    "Customer City",
    "Customer State",
    "Customer Taxpayer Type",
    "Item Description",
    "Item Category",
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
    "Document CGST Amount",
    "Document SGST Amount",
    "Document IGST Amount",
    "Document Cess Amount",
    "Document Total Amount",
    "Export Type",
    "Export Bill Number",
    "Export Bill Date",
    "Export Port Code",
    "ERP Source",
    "Company Code",
    "Voucher Type",
    "Voucher Number",
    "Voucher date",
    "Is this Document Cancelled",
    "Is this Document Deleted",
    "External ID",
    "External Line item ID"
];		


	log.debug('data_headers  ', JSON.stringify(data_headers));	
	log.debug('data_headers  length', JSON.stringify(data_headers.length));	

var Filter =[    ["type","anyof","CustInvc","CustCred"], 
      "AND", 
      ["postingperiod","abs",custpage_period], 
      "AND", 
      ["taxline","is","F"], 
      "AND", 
      ["mainline","is","F"], "AND",
      ["memorized","is","F"] ];
	 
	  
	 
	  
	  
var Filter_Tax =[    ["type","anyof","CustInvc","CustCred"], 
      "AND", 
      ["postingperiod","abs",custpage_period], 
      "AND", 
      ["mainline","is","F"], 
      "AND", 
      ["taxline","is","F"], 
      "AND", 
      ["shipping","is","F"]

	  ];
	  
	  if(subsid.length > 0) {
		
		Filter.push("AND", ["subsidiary","anyof",subsid]);
		Filter_Tax.push("AND", ["subsidiary","anyof",subsid]);
		
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
	   search.createColumn({name: "billaddress1", label: "billaddress1"}),
	   search.createColumn({
         name: "formulatext",
         formula: "{billingaddress.city}",
         label: "billcity"
      }),
	  
	   search.createColumn({
         name: "formulatext",
         formula: "CASE WHEN {billcountry}='India' THEN SUBSTR({billingaddress.state}, 0 , 2) ELSE 'OTH' END",
         label: "billstate"
      }),
	  
	   search.createColumn({
         name: "formulatext",
         formula: "{name}",
         label: "entityid"
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
      })
      

	  
	  
	  
      ];
	  
	  
	   var Inv_tax_Obj = common.searchAllRecord('transaction',null,Filter_Tax,Columns_tax);
		var data_inv_tax = common.pushSearchResultIntoArray(Inv_tax_Obj);
		log.debug('data_inv_tax  ', JSON.stringify(data_inv_tax.length));
		log.debug('data_inv_tax  value', JSON.stringify(data_inv_tax));
	  
	  	   var InvObj = common.searchAllRecord('transaction',null,Filter,Columns);
		var data_inv = common.pushSearchResultIntoArray(InvObj);
		log.debug('data_inv  ', JSON.stringify(data_inv));	
		
		
        var csvFile = file.create({
            name: 'exported_data.txt',
            fileType: file.Type.PLAINTEXT,
            contents: JSON.stringify(data_inv)
        });

        
        csvFile.folder = 2667224;
        csvFile.save();
		
		
		if(gstin_val.length > 0){
			
var data_inv = data_inv.filter(function (invoice) {
  return gstin_val.indexOf(invoice.subsidiarytaxregnum) !== -1;
});

	
	}
	
	
	log.debug('data_inv  value', JSON.stringify(data_inv));
	
	
			var fileContent = '';

			
				for (var i = 0; i < data_headers.length; i++) {
						
						fileContent += data_headers[i] + DELIMITER;
						
					}
					fileContent += NEWLINE;
			
				for (var j = 0; j < data_inv.length; j++) {
					
					
					
					var filtered_array = _.filter(data_inv_tax, { 'linenumber': data_inv[j].line, 'tranid': data_inv[j].internalid });
					
log.debug('filtered_array  ---- '+data_inv[j].internalid, JSON.stringify(filtered_array));
					
						var filtered_array_tax_total = _.filter(data_inv_tax, { 'tranid': data_inv[j].internalid });
						
						var tax_total_amt = 0;
						for (var t = 0; t < filtered_array_tax_total.length; t++) {
							
							tax_total_amt = parseFloat(tax_total_amt)+parseFloat(filtered_array_tax_total[t].taxamount);
							
						}
						
						var tax_rate_cgst = 0;
						var tax_rate_igst = 0;
						var taxamount_cgst = 0;
						var taxamount_igst = 0;
						var tax_total_amt_cgst = 0;
						var tax_total_amt_igst = 0;
						
				
						if(filtered_array.length > 0){
						//log.debug('filtered_array  ---'+data_inv[j].internalid, JSON.stringify(filtered_array));	
						var tax_data = filtered_array[0];
						
						if(tax_data.taxtype == 33 || tax_data.taxtype == 34){
						
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
						}
						
						
						 var item = data_bill[p].itemid;
						 
						 var item = item.replace(/,/g, " ");
						 
						 var nature_of_item = data_bill[p].nature_of_item;
						
						if(nature_of_item == 'Services'){
							var nature_of_items = 'S';
						}else{
							var nature_of_items = 'G';
						}
							
						
					if(data_inv[j].type == 'CustInvc'){
						var type = 'INVOICE';
					}else{
							var type = 'CREDIT';
					}
					
					
					 var seller_gstin = "29AAFCD5862R000";
					 
					 for (var r = 0; r < sub_gstin.length; r++) {
			  var gstin_val = data_inv[j].subsidiarytaxregnum.substring(0, 2);
			  var dis_patch_state = sub_gstin[r].substring(0, 2);
			
			  
			  if(gstin_val == dis_patch_state){
				seller_gstin =  sub_gstin[r];
			  }
		   }
					
					//data_inv[j].quantity;
					
					fileContent += type + DELIMITER;
					fileContent += data_inv[j].tranid + DELIMITER;
					fileContent += data_inv[j].trandate + DELIMITER;
					fileContent += data_inv[j].return_filling_month + DELIMITER;
					fileContent += data_inv[j].pos + DELIMITER;
					fileContent += zero + DELIMITER;
					fileContent += blank_field + DELIMITER;
					fileContent += blank_field + DELIMITER;
					fileContent += blank_field + DELIMITER;
					fileContent += blank_field + DELIMITER;
					fileContent += blank_field + DELIMITER;
					fileContent += blank_field + DELIMITER;
					fileContent += blank_field + DELIMITER;
					fileContent += blank_field + DELIMITER;
					fileContent += blank_field + DELIMITER;
					fileContent += blank_field + DELIMITER;
					fileContent += blank_field + DELIMITER;
					fileContent += blank_field + DELIMITER;
					fileContent += blank_field + DELIMITER;
					fileContent += blank_field + DELIMITER;
					fileContent += blank_field + DELIMITER;
					fileContent += seller_gstin  + DELIMITER;
					fileContent += blank_field + DELIMITER;
					fileContent += data_inv[j].entitytaxregnum + DELIMITER;
					
					var entityid = data_inv[j].entityid;
					var entityid = entityid.replace(/,/g, " ");
					var billaddress1 = data_inv[j].billaddress1;
					var billaddress1 = billaddress1.replace(/,/g, " ");
					
					var statedisplayname = data_inv[j].billstate;
					
					
					fileContent += entityid + DELIMITER;
					
					
					
					fileContent += billaddress1 + DELIMITER;
					fileContent += data_inv[j].billcity + DELIMITER;
					fileContent += statedisplayname + DELIMITER;
					fileContent += blank_field + DELIMITER;
					fileContent += item + DELIMITER;
					fileContent += nature_of_items + DELIMITER;
					fileContent += data_inv[j].hsn_code + DELIMITER;
					fileContent += Math.abs(data_inv[j].quantity) + DELIMITER;
					fileContent += data_inv[j].uqc_code + DELIMITER;
					fileContent += blank_field + DELIMITER;
					fileContent += zero + DELIMITER;
					fileContent += Math.abs(data_inv[j].amount) + DELIMITER;
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
					fileContent += Math.abs(tax_total_amt_cgst) + DELIMITER;
					fileContent += Math.abs(tax_total_amt_cgst) + DELIMITER;
					fileContent += Math.abs(tax_total_amt_igst) + DELIMITER;
					fileContent += zero + DELIMITER;
					fileContent += Math.abs(data_inv[j].totalaftertaxes) + DELIMITER;
					fileContent += blank_field + DELIMITER;
					fileContent += blank_field + DELIMITER;
					fileContent += blank_field + DELIMITER;
					fileContent += blank_field + DELIMITER;
					fileContent += blank_field + DELIMITER;
					fileContent += blank_field + DELIMITER;
					fileContent += blank_field + DELIMITER;
					fileContent += blank_field + DELIMITER;
					fileContent += blank_field + DELIMITER;
					fileContent += blank_field + DELIMITER;
					fileContent += blank_field + DELIMITER;
					fileContent += blank_field + DELIMITER;
					fileContent += blank_field + NEWLINE;
					
					
				}
				
				
				
				var formattedDate = moment().format('YYMMDD');
				var file_name = 'gstr_report_' + formattedDate +'.csv';
				
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
		
		
		



		
		
		function setSublistReorderPoint(sublist, Form, request, response,custpage_period,custpage_type) {
            

			
			sublist.addField({ id: 'custpage_doc_number',  type: serverWidget.FieldType.TEXT,  label: 'Transaction ID' });
			 sublist.addField({ id: 'custpage_invoice_date', type: serverWidget.FieldType.DATE, label: 'Invoice Date' });
			sublist.addField({ id: 'custpage_doc_type',  type: serverWidget.FieldType.TEXT,  label: 'Type' });
            sublist.addField({ id: 'custpage_customer_name', type: serverWidget.FieldType.TEXT, label: 'Entity' });
            sublist.addField({ id: 'custpage_place_of_supply', type: serverWidget.FieldType.TEXT, label: 'Place of Supply' });
            sublist.addField({ id: 'custpage_seller_gstin', type: serverWidget.FieldType.TEXT, label: 'Supplier GSTIN' });
            sublist.addField({ id: 'custpage_buyer_gstin', type: serverWidget.FieldType.TEXT, label: 'Customer GSTIN' });
           sublist.addField({ id: 'custpage_amount', type: serverWidget.FieldType.TEXT, label: 'Amount' });
    
     
            
            var lineNum = 0;
			if(custpage_period){
				
			var FiltersArray=[   ["type","anyof","CustInvc","CustCred"], 
      "AND", 
      ["postingperiod","abs",custpage_period], 
      "AND", 
      ["mainline","is","T"] ,"AND", 
      ["memorized","is","F"] ];
	  
	  var FiltersArray_bill=[  ["type","anyof","VendBill","VendCred"], 
      "AND", 
      ["mainline","is","T"], 
      "AND", 
       ["postingperiod","abs",custpage_period], 
      "AND", 
      ["memorized","is","F"], 
      "AND", 
       ["custbody_tcp_jv_type","anyof","6","7","10"] ];
			}else{
	  
			var FiltersArray=[  ["type","anyof","CustInvc","CustCred"], 
      "AND", 
      ["mainline","is","T"], 
      "AND", 
	  
      ["custbody_psg_ei_status","anyof","1","3","19","5","21","22","8","2"], 
      "AND", 
      ["memorized","is","F"], 
      "AND", 
      ["custbody_psg_ei_template","noneof","@NONE@"] ];
			}
				 var ColumnsArray = [
				 
				search.createColumn({name: "tranid",sort: search.Sort.DESC, label: "Transaction ID" }),				 
				 search.createColumn({name: "internalid", label: "internalid"}),
				  search.createColumn({name: "type", label: "type"}),
				 search.createColumn({name: "tranid", label: "doc_num"}),
				 search.createColumn({name: "transactionnumber", label: "transactionnumber"}),
      search.createColumn({name: "entity", label: "entity"}),
      search.createColumn({name: "amount", label: "amount"}),
      search.createColumn({name: "trandate", label: "trandate"}),
	  search.createColumn({name: "custbody_in_gst_pos", label: "pos"}),
      search.createColumn({name: "subsidiarytaxregnum", label: "subsidiarytaxregnum"}),
      search.createColumn({name: "entitytaxregnum", label: "entitytaxregnum"}),
      ];
     	
				var InvObj = common.searchAllRecord('transaction',null,FiltersArray,ColumnsArray);
			var data_invoice = common.pushSearchResultIntoArray(InvObj);
			
			var BillObj = common.searchAllRecord('transaction',null,FiltersArray_bill,ColumnsArray);
			var data_bill = common.pushSearchResultIntoArray(BillObj);
			
				 log.debug('data_bill', JSON.stringify(data_bill));	
				 log.debug('data_invoice', JSON.stringify(data_invoice));
					
					
						
							for (var k = 0; k < data_invoice.length; k++) { 
							
							 var internalid = data_invoice[k].internalid;
							 var doc_num = data_invoice[k].doc_num;
							
							 var amount = Math.abs(data_invoice[k].amount);
							 var entity = InvObj[k].getText({ name: 'entity'});
                             var trandate = data_invoice[k].trandate;
                             var pos = data_invoice[k].pos;
                             var subsidiarytaxregnum = data_invoice[k].subsidiarytaxregnum;
                             var entitytaxregnum = data_invoice[k].entitytaxregnum;
                            var type = InvObj[k].getText({ name: 'type'});
                            var gst_pos = InvObj[k].getText({ name: 'custbody_in_gst_pos'});
						
		

		sublist.setSublistValue({ id: 'custpage_doc_number', line: lineNum, value: doc_num });
        sublist.setSublistValue({ id: 'custpage_customer_name', line: lineNum, value: entity });
       sublist.setSublistValue({  id: 'custpage_doc_type', line: lineNum, value: type });
      
        sublist.setSublistValue({  id: 'custpage_amount', line: lineNum, value: amount });
        
		sublist.setSublistValue({  id: 'custpage_place_of_supply', line: lineNum, value: gst_pos });
		
		sublist.setSublistValue({  id: 'custpage_seller_gstin', line: lineNum, value: subsidiarytaxregnum });
		
		if(entitytaxregnum != ""){
		sublist.setSublistValue({  id: 'custpage_buyer_gstin', line: lineNum, value: entitytaxregnum });
		}
		sublist.setSublistValue({  id: 'custpage_amount', line: lineNum, value: amount });
 
        sublist.setSublistValue({  id: 'custpage_invoice_date', line: lineNum, value: trandate });
       
				
				  ++lineNum;			
							}
							
							for (var l = 0; l < data_bill.length; l++) { 
							
							 var internalid = data_bill[l].internalid;
							 var doc_num = data_bill[l].doc_num;
							  var transactionnumber = data_bill[l].transactionnumber;
							 var amount = Math.abs(data_bill[l].amount);
							 var entity = BillObj[l].getText({ name: 'entity'});
                             var trandate = data_bill[l].trandate;
                             var pos = data_bill[l].pos;
                             var subsidiarytaxregnum = data_bill[l].subsidiarytaxregnum;
                             var entitytaxregnum = data_bill[l].entitytaxregnum;
                            var type = BillObj[l].getText({ name: 'type'});
                            var gst_pos = BillObj[l].getText({ name: 'custbody_in_gst_pos'});
						
		
		if(transactionnumber != ""){
		sublist.setSublistValue({ id: 'custpage_doc_number', line: lineNum, value: transactionnumber });
		}
        sublist.setSublistValue({ id: 'custpage_customer_name', line: lineNum, value: entity });
       sublist.setSublistValue({  id: 'custpage_doc_type', line: lineNum, value: type });
      
        sublist.setSublistValue({  id: 'custpage_amount', line: lineNum, value: amount });
        
		sublist.setSublistValue({  id: 'custpage_place_of_supply', line: lineNum, value: gst_pos });
		
		sublist.setSublistValue({  id: 'custpage_seller_gstin', line: lineNum, value: subsidiarytaxregnum });
		
		if(entitytaxregnum != ""){
		sublist.setSublistValue({  id: 'custpage_buyer_gstin', line: lineNum, value: entitytaxregnum });
		}
		sublist.setSublistValue({  id: 'custpage_amount', line: lineNum, value: amount });
 
        sublist.setSublistValue({  id: 'custpage_invoice_date', line: lineNum, value: trandate });
       
				
				  ++lineNum;			
							}
          
        }

       

        return {
            onRequest: onRequest
        };

    })