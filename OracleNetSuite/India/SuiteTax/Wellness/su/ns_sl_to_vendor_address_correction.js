 /**
 * @NApiVersion 2.0
 * @NScriptType Suitelet
 * @NModuleScope Public
 */
define(['N/record', 'N/runtime', 'N/search', 'N/ui/serverWidget', 'N/encode', 'N/file', "../lib/common_2.0", "N/https", "N/url", "../lib/lodash.min.js"],
    /**
     * @param {record} record
     * @param {runtime} runtime
     * @param {search} search
     */
    function(record, runtime, search, serverWidget, encode, file,common, https,url, _) {

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
            if (request.method == 'GET') {
             //   try {
					
					 var selection_value = parameters.selection_value;
					 log.debug('selection_value', selection_value);
                   // getSalesOrderData();
				  
					   
                    var Form = serverWidget.createForm({
                        title: 'Vendor Address Report',
                        hideNavBar: false
                    }); //Create a form
                    Form.addTab({
                        id: 'tab1',
                        label: 'Vendor Data'
                    });
					
					var CategoryField = Form.addField({
                    id: 'custpage_category',
                    type: serverWidget.FieldType.SELECT,
                    label: 'Category'
                });
				
				 CategoryField.addSelectOption({value: '',text: 'Select'});
				 CategoryField.addSelectOption({value: 5,text: 'All Franchisees'});
				 CategoryField.addSelectOption({value: 6,text: 'All Inter Group Entities'});
				 CategoryField.addSelectOption({value: 108,text: 'Carrier Vendors'});
				 CategoryField.addSelectOption({value: 109,text: 'Non-Carrier Vendors'});
				
					
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
					
					Form.addSubmitButton({  label: 'Search'  });
				
                  
                    var sublist = Form.addSublist({
                        id: 'custpage_sublist',
                        type: serverWidget.SublistType.LIST,
                        label: 'Vendor'
                    });
                  var custpage_category = 'default';
                   var SetSublist = setSublistReorderPoint(sublist, Form, request, response,custpage_category);
                    
					Form.clientScriptModulePath = '../lib/cs_entiy_address_report.js';
					Form.addField({
                    id: 'custpage_main_form',
                    type: serverWidget.FieldType.INLINEHTML,
                    label: 'Main Form'
                }).defaultValue = '<form id="main_form"></form>';
                 
				 response.writePage(Form);
		
            } else {
                try {
					
					 var submitter = request.parameters.custpage_submitter;
					 var custpage_category = request.parameters.custpage_category;
					 log.debug('parameters submitter', JSON.stringify(submitter));
					 log.debug('parameters custpage_category', JSON.stringify(custpage_category));
					 if(submitter == 'submit_button_1'){
					 var lineNum = 0;
			if(custpage_category != ""){
	  
			var FiltersArray=[   ["subsidiary","anyof","14"], 
      "AND", 
      ["isinactive","is","F"], "AND", 
      ["category","anyof",custpage_category]
	  
	  ];
			}else{
			FiltersArray=[   ["subsidiary","anyof","14"], 
      "AND", 
      ["isinactive","is","F"]];	
				
			}
			
				 var ColumnsArray = [
				 search.createColumn({name: "category", label: "category"}),
      search.createColumn({ name: "entityid", sort: search.Sort.ASC, label: "entityid" }),
      search.createColumn({name: "email", label: "email"}),
      search.createColumn({name: "phone", label: "phone"}),
      search.createColumn({name: "contact", label: "contact"}),
      search.createColumn({name: "custentity_address_count", label: "address_count"}),
      search.createColumn({ name: "addressinternalid",  join: "Address", label: "add_id" }),
      search.createColumn({
         name: "addresslabel",
         join: "Address",
         label: "addresslabel"
      }),
      search.createColumn({
         name: "address",
         join: "Address",
         label: "address"
      }),
      search.createColumn({
         name: "custrecord_ic_ixps_tst_state",
         join: "Address",
         label: "tst_state"
      }),
      search.createColumn({
         name: "state",
         join: "Address",
         label: "state"
      }),
      search.createColumn({name: "defaulttaxreg", label: "defaulttaxreg"}),
      search.createColumn({
         name: "custrecord_ic_ixps_add_franchise",
         join: "Address",
         label: "franchise"
      }),
      search.createColumn({
         name: "custrecordic_ixps_xms",
         join: "Address",
         label: "xms"
      }),
      search.createColumn({
         name: "custrecord_ic_ixps_tly_cstmr",
         join: "Address",
         label: "tly_cstmr"
      }),
	   search.createColumn({
         name: "formulatext",
         formula: "SUBSTR({address.state}, 1,2)",
         label: "state_two_digit"
      }),
search.createColumn({
         name: "formulatext",
         formula: "SUBSTR({defaulttaxreg}, 1,2) ",
         label: "def_gstin_two"
      }),
	   search.createColumn({name: "companyname",label: "companyname"}),
      search.createColumn({name: "firstname",label: "firstname"}),
      search.createColumn({name: "lastname",label: "lastname"}),
	    search.createColumn({name: "custentity_in_gst_vendor_regist_type", label: "regist_type"}),
	   search.createColumn({name: "internalid", label: "internalid"}),
	   search.createColumn({ name: "custentity_permanent_account_number",label: "pan"})
				];
				
			var ColumnsArray_tax_field = [
			 search.createColumn({name: "internalid", label: "internalid"}),
			search.createColumn({ name: "address", join: "taxRegistration", label: "tax_address" }),
      search.createColumn({ name: "taxregistrationnumber", join: "taxRegistration", label: "GSTIN"}),
	    search.createColumn({ name: "id", join: "taxRegistration", label: "tax_id" }),
	  search.createColumn({ name: "formulatext", formula: "SUBSTR({taxregistration.taxregistrationnumber}, 1,2)",label: "gstin_two_digit"})

		];			
     	
				var InvObj = common.searchAllRecord('vendor',null,FiltersArray,ColumnsArray);
			var data_invoice = common.pushSearchResultIntoArray(InvObj);
			
			var InvObj_tax_field = common.searchAllRecord('vendor',null,FiltersArray,ColumnsArray_tax_field);
			var data_invoice_tax_field = common.pushSearchResultIntoArray(InvObj_tax_field);
			
				// log.debug('InvObj post', JSON.stringify(InvObj));
					var tax_address_val = '-';
					
					
					var xmlString = '<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>'; 
				xmlString += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" ';
				xmlString += 'xmlns:o="urn:schemas-microsoft-com:office:office" ';
				xmlString += 'xmlns:x="urn:schemas-microsoft-com:office:excel" ';
				xmlString += 'xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" ';
				xmlString += 'xmlns:html="http://www.w3.org/TR/REC-html40">'; 
				
				xmlString += '<Worksheet ss:Name="Vendor Address Report">';

				
				
				xmlString += '<Table>';
				
				
			
				xmlString += '<Row>' + 
				
				'<Cell><Data ss:Type="String"><strong>Category</strong></Data></Cell>' +
				'<Cell><Data ss:Type="String"><strong> Franchise #</strong></Data></Cell>' +
				'<Cell><Data ss:Type="String"><strong> XMS #</strong></Data></Cell>' +
				'<Cell><Data ss:Type="String"><strong> Tally Customer</strong></Data></Cell>' +
				'<Cell><Data ss:Type="String"><strong> Entity Code</strong></Data></Cell>' +
				'<Cell><Data ss:Type="String"><strong> Name</strong></Data></Cell>' +
				'<Cell ><Data ss:Type="String"><B>INTERNAL ID </B></Data></Cell>' +
				'<Cell><Data ss:Type="String"><strong>Address Count</strong></Data></Cell>' +
				'<Cell><Data ss:Type="String"><strong> Address ID</strong></Data></Cell>' +
				'<Cell><Data ss:Type="String"><strong> Address Label</strong></Data></Cell>' +
				'<Cell><Data ss:Type="String"><strong> Address</strong></Data></Cell>' +
				'<Cell><Data ss:Type="String"><strong> State (Custom)</strong></Data></Cell>' +
				'<Cell><Data ss:Type="String"><strong> State/Province</strong></Data></Cell>' +
					'<Cell><Data ss:Type="String"><strong> REGISTRATION TYPE</strong></Data></Cell>' +
				'<Cell><Data ss:Type="String"><strong>ID</strong></Data></Cell>' +
				'<Cell><Data ss:Type="String"><strong> Tax Address</strong></Data></Cell>' +
				'<Cell><Data ss:Type="String"><strong> Default Tax Reg.</strong></Data></Cell>' +
				'<Cell><Data ss:Type="String"><strong> GSTIN</strong></Data></Cell>' +
				'<Cell><Data ss:Type="String"><strong> PAN #</strong></Data></Cell>' +
				'<Cell><Data ss:Type="String"><strong> IS Address and GSTIN Match</strong></Data></Cell>' +
				
				
			

				
				'</Row>';
				
				
				
				
				
				
				
				
						
						for (var k = 0; k < data_invoice.length; k++) { 
							var tax_address = '-';
							var tax_gstin_one = '-';
							var is_address_match = 'No';
							var tax_id = '-';
                          var gstin = '-';
							  var state_two_digit = data_invoice[k].state_two_digit;
							 var internalid = data_invoice[k].internalid;
							   var address = data_invoice[k].address;
							   
							 var obj_vvr =   _.filter(data_invoice_tax_field, { 'internalid': internalid });
							if(obj_vvr){
							 tax_gstin_one = obj_vvr[0].GSTIN;
							}
							  var tax_address_val = '-';
							 for (var t = 0; t < obj_vvr.length; t++) {
								
								 var tax_address = obj_vvr[t].tax_address;
								  var gstin_two_digit = obj_vvr[t].gstin_two_digit;
								 if(tax_address == address){
								 var gstin = obj_vvr[t].GSTIN;
								tax_address_val = tax_address;
								 tax_id = obj_vvr[t].tax_id;
								if(gstin_two_digit == state_two_digit){
									  var is_address_match = 'Yes';
								}
								 }else{
									  tax_id = obj_vvr[t].tax_id;
									 if(state_two_digit != "" ){
									 if(gstin_two_digit == state_two_digit){
									   is_address_match = 'Yes';
									 }
								}	
								 }
							 
							 }
							
							  if(address == ""){address = '-'; }
							 // var category = data_invoice[k].category;
							  var category =  InvObj[k].getText({ name: 'category'});;
							 var regist_type =  InvObj[k].getText({ name: 'custentity_in_gst_vendor_regist_type'});;
							
							  var entity = data_invoice[k].entityid;
							  var email = data_invoice[k].email;
							  var defaulttaxreg = data_invoice[k].defaulttaxreg;
							   if(email == ""){email = '-'; }
							 
							  var phone = data_invoice[k].phone;
							  if(phone == ""){phone = '-'; }
							  var address_count = data_invoice[k].address_count;
							  var add_id = data_invoice[k].add_id;
							  
							 var pan = data_invoice[k].pan;
							  var addresslabel = data_invoice[k].addresslabel;
							  
							    var companyname = data_invoice[k].companyname;
							  var firstname = data_invoice[k].firstname;
							  var lastname = data_invoice[k].lastname;
							  
							  if(companyname == ""){
								  companyname = firstname+' '+lastname;
								  }
							
							 // var tst_state = data_invoice[k].tst_state;
							   var tst_state = InvObj[k].getText({ name: 'custrecord_ic_ixps_tst_state', join: 'Address' });
							  var state = data_invoice[k].state;
							  var franchise = data_invoice[k].franchise;
							  var xms = data_invoice[k].xms;
							  var tly_cstmr = data_invoice[k].tly_cstmr;
							
							  if(addresslabel == ""){addresslabel = '-'; }
							  if(add_id == ""){add_id = '-'; }
							  if(tax_id == ""){tax_id = '-'; }
							  if(pan == ""){pan = '-'; }
							  if(tst_state == ""){tst_state = '-'; }
							  if(state == ""){state = '-'; }
							  if(franchise == ""){franchise = '-'; }
							  if(xms == ""){xms = '-'; }
							  if(tly_cstmr == ""){tly_cstmr = '-'; }
							  if(defaulttaxreg == ""){defaulttaxreg = '-'; }
							  if(tax_address_val == ""){tax_address_val = '-'; }
							  if(regist_type == ""){regist_type = '-'; }
							   if(gstin == ""){gstin = defaulttaxreg; }
							   if(gstin == "-"){gstin = defaulttaxreg; }
							   if(gstin == "-"){
								   
								   gstin = tax_gstin_one;

								   }
							  
							   if(gstin == ""){gstin = '-'; }
							   
							   xmlString += '<Row>' + 
							   
				
				'<Cell><Data ss:Type="String">' + category  + '</Data></Cell>' +
				'<Cell><Data ss:Type="String">' + franchise + '</Data></Cell>' +				  
				'<Cell><Data ss:Type="String">' + xms + '</Data></Cell>' +				  
				'<Cell><Data ss:Type="String">' + tly_cstmr + '</Data></Cell>' +
				'<Cell><Data ss:Type="String">' + entity  + '</Data></Cell>' +
				'<Cell><Data ss:Type="String">' + companyname  + '</Data></Cell>' +
				'<Cell><Data ss:Type="String">' + internalid  + '</Data></Cell>' +
				'<Cell><Data ss:Type="String">' + address_count  + '</Data></Cell>' +
				'<Cell><Data ss:Type="String">' + add_id  + '</Data></Cell>' +
				'<Cell><Data ss:Type="String">' + addresslabel  + '</Data></Cell>' +
				'<Cell><Data ss:Type="String">' + address  + '</Data></Cell>' +
				'<Cell><Data ss:Type="String">' + tst_state + '</Data></Cell>' +				  
				'<Cell><Data ss:Type="String">' + state + '</Data></Cell>' +
				'<Cell><Data ss:Type="String">' + regist_type + '</Data></Cell>' +	
				'<Cell><Data ss:Type="String">' + tax_id + '</Data></Cell>' +
				
				'<Cell><Data ss:Type="String">' + tax_address_val  + '</Data></Cell>' +
				'<Cell><Data ss:Type="String">' + defaulttaxreg + '</Data></Cell>' +
				'<Cell><Data ss:Type="String">' + gstin  + '</Data></Cell>' +
				'<Cell><Data ss:Type="String">' + pan + '</Data></Cell>' +		
								  
				'<Cell><Data ss:Type="String">' + is_address_match + '</Data></Cell>' +				  
							  
						  
								  
							  
				'</Row>';
							   
						}
						xmlString += '</Table></Worksheet></Workbook>';	
						var strXmlEncoded = encode.convert({
					string : xmlString,
					inputEncoding : encode.Encoding.UTF_8,
					outputEncoding : encode.Encoding.BASE_64
				});
			var fileName = 'Vendor_address_report.xls';
				var File = file.create({
					name: fileName,
					fileType: file.Type.EXCEL,
					contents: strXmlEncoded,
				});
				
				context.response.writeFile({
					file : File
				});
					
					 }else{
						 
						 var Form = serverWidget.createForm({
                        title: 'Vendor Address Report',
                        hideNavBar: false
                    }); //Create a form
                    Form.addTab({
                        id: 'tab1',
                        label: 'Vendor Data'
                    }); 
					
					var exportButton = Form.addButton({
                id: 'custpage_go_back',
                label: 'Back',
                functionName: 'goBack'
            });
			
					 var exportButton = Form.addButton({
                id: 'custpage_export_excel',
                label: 'Export to Excel',
                functionName: 'exportToExcel'
            });
			
			var CategoryField = Form.addField({
                    id: 'custpage_category',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Category'
                });
				CategoryField.defaultValue = custpage_category;
				CategoryField.updateDisplayType({ displayType: serverWidget.FieldDisplayType.HIDDEN });	
				
			var hiddenField = Form.addField({
                    id: 'custpage_submitter',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Submitter'
                });
				hiddenField.updateDisplayType({ displayType: serverWidget.FieldDisplayType.HIDDEN });	
			
			 var sublist = Form.addSublist({
                        id: 'custpage_sublist',
                        type: serverWidget.SublistType.LIST,
                        label: 'Vendor'
                    });
                  
                   var SetSublist = setSublistReorderPoint(sublist, Form, request, response,custpage_category);
                    
					Form.clientScriptModulePath = '../lib/cs_entiy_address_report.js';
					Form.addField({
                    id: 'custpage_main_form',
                    type: serverWidget.FieldType.INLINEHTML,
                    label: 'Main Form'
                }).defaultValue = '<form id="main_form"></form>';
                 
				 response.writePage(Form);
						 
					 }
                } catch (e) {
                    log.error('e.message', e.message);
                }
            }

        }
		
		
		



		
		
		function setSublistReorderPoint(sublist, Form, request, response,custpage_category) {
            
			  sublist.addField({
                    id: 'custpage_redirect',
                    type: serverWidget.FieldType.TEXT,
                    label: 'View'
                });
			
			
			
			sublist.addField({ id: 'custpage_category',  type: serverWidget.FieldType.TEXT,  label: 'Category' });
            sublist.addField({ id: 'custpage_franchise', type: serverWidget.FieldType.TEXT, label: 'Franchise #' });
			 sublist.addField({ id: 'custpage_xms', type: serverWidget.FieldType.TEXT, label: 'XMS #' });
          sublist.addField({ id: 'custpage_tly_cstmr', type: serverWidget.FieldType.TEXT, label: 'Tally Customer' });
         
			sublist.addField({ id: 'custpage_customer_name', type: serverWidget.FieldType.TEXT, label: 'Entity' });
            sublist.addField({ id: 'custpage_companyname', type: serverWidget.FieldType.TEXT, label: 'Name' });
        sublist.addField({ id: 'custpage_internal_id',  type: serverWidget.FieldType.TEXT,  label: 'Internal ID' });
		sublist.addField({ id: 'custpage_address_count', type: serverWidget.FieldType.TEXT, label: 'Address Count' });
		 sublist.addField({ id: 'custpage_addressinternalid', type: serverWidget.FieldType.TEXT, label: 'Address ID' });
             sublist.addField({ id: 'custpage_addresslabel', type: serverWidget.FieldType.TEXT, label: 'Address Label' });
			sublist.addField({ id: 'custpage_address', type: serverWidget.FieldType.TEXT, label: 'Address' });
			sublist.addField({ id: 'custpage_tst_state', type: serverWidget.FieldType.TEXT, label: 'State (Custom)' });
            sublist.addField({ id: 'custpage_state', type: serverWidget.FieldType.TEXT, label: 'State/Province' });
			sublist.addField({ id: 'custpage_reg_type', type: serverWidget.FieldType.TEXT, label: 'REGISTRATION TYPE' });
        
			sublist.addField({ id: 'custpage_tax_internal_id',  type: serverWidget.FieldType.TEXT,  label: 'ID' });
			sublist.addField({ id: 'custpage_tax_address', type: serverWidget.FieldType.TEXT, label: 'Tax Address' });
			  sublist.addField({ id: 'custpage_defaulttaxreg', type: serverWidget.FieldType.TEXT, label: 'Default Tax Reg.' });
            sublist.addField({ id: 'custpage_gstin', type: serverWidget.FieldType.TEXT, label: 'GSTIN' });
		    sublist.addField({ id: 'custpage_pan', type: serverWidget.FieldType.TEXT, label: 'PAN #' });
           
          
		   sublist.addField({ id: 'custpage_is_address_match', type: serverWidget.FieldType.TEXT, label: 'IS Address and GSTIN Match' });
          
           
            var lineNum = 0;
			
			if(custpage_category != "default"){
	  
			var FiltersArray=[   ["subsidiary","anyof","14"], 
      "AND", 
      ["isinactive","is","F"], "AND", 
      ["category","is",custpage_category]
	  
	  ];
			}else{
	  
			var FiltersArray=[   ["subsidiary","anyof","14"], 
      "AND", 
      ["isinactive","is","F"] ];
			}
			
				 var ColumnsArray = [
				 search.createColumn({name: "category", label: "category"}),
      search.createColumn({ name: "entityid", sort: search.Sort.ASC, label: "entityid" }),
      search.createColumn({name: "email", label: "email"}),
      search.createColumn({name: "phone", label: "phone"}),
      search.createColumn({name: "contact", label: "contact"}),
      search.createColumn({name: "custentity_address_count", label: "address_count"}),
      search.createColumn({ name: "addressinternalid",  join: "Address", label: "add_id" }),
	  
      search.createColumn({
         name: "addresslabel",
         join: "Address",
         label: "addresslabel"
      }),
      search.createColumn({
         name: "address",
         join: "Address",
         label: "address"
      }),
      search.createColumn({
         name: "custrecord_ic_ixps_tst_state",
         join: "Address",
         label: "tst_state"
      }),
      search.createColumn({
         name: "state",
         join: "Address",
         label: "state"
      }),
      search.createColumn({name: "defaulttaxreg", label: "defaulttaxreg"}),
      search.createColumn({
         name: "custrecord_ic_ixps_add_franchise",
         join: "Address",
         label: "franchise"
      }),
      search.createColumn({
         name: "custrecordic_ixps_xms",
         join: "Address",
         label: "xms"
      }),
      search.createColumn({
         name: "custrecord_ic_ixps_tly_cstmr",
         join: "Address",
         label: "tly_cstmr"
      }),
  search.createColumn({
         name: "formulatext",
         formula: "SUBSTR({address.state}, 1,2)",
         label: "state_two_digit"
      }),
search.createColumn({
         name: "formulatext",
         formula: "SUBSTR({defaulttaxreg}, 1,2) ",
         label: "def_gstin_two"
      }),
	   search.createColumn({name: "companyname",label: "companyname"}),
      search.createColumn({name: "firstname",label: "firstname"}),
      search.createColumn({name: "lastname",label: "lastname"}),
	   search.createColumn({name: "custentity_in_gst_vendor_regist_type", label: "regist_type"}),
	   search.createColumn({name: "internalid", label: "internalid"}),
	   search.createColumn({ name: "custentity_permanent_account_number",label: "pan"})
				];
				
			var ColumnsArray_tax_field = [
			 search.createColumn({name: "internalid", label: "internalid"}),
			search.createColumn({ name: "address", join: "taxRegistration", label: "tax_address" }),
      search.createColumn({ name: "taxregistrationnumber", join: "taxRegistration", label: "GSTIN"}),
	   search.createColumn({ name: "id", join: "taxRegistration", label: "tax_id" }),
	   search.createColumn({ name: "formulatext", formula: "SUBSTR({taxregistration.taxregistrationnumber}, 1,2)",label: "gstin_two_digit"})

		];			
     	
				var InvObj = common.searchAllRecord('vendor',null,FiltersArray,ColumnsArray);
			var data_invoice = common.pushSearchResultIntoArray(InvObj);
			
			var InvObj_tax_field = common.searchAllRecord('vendor',null,FiltersArray,ColumnsArray_tax_field);
			var data_invoice_tax_field = common.pushSearchResultIntoArray(InvObj_tax_field);
			
				 log.debug('InvObj', JSON.stringify(InvObj));	
				 log.debug('data_invoice', JSON.stringify(data_invoice));
				 log.debug('data_invoice_tax_field', JSON.stringify(data_invoice_tax_field));
							var tax_address_val = '-';
							
							for (var k = 0; k < data_invoice.length; k++) { 
							var tax_address = '-';
							var tax_gstin_one = '-';
							var tax_id = '-';
							var gstin = '-';
							
							 var internalid = data_invoice[k].internalid;
							
							   var address = data_invoice[k].address;
							   var state_two_digit = data_invoice[k].state_two_digit;
							    
							   var is_address_match = 'No';
							   
							 var obj_vvr =   _.filter(data_invoice_tax_field, { 'internalid': internalid });
							if(obj_vvr){
							 tax_gstin_one = obj_vvr[0].GSTIN;
							}
							  var tax_address_val = '-';
							 for (var t = 0; t < obj_vvr.length; t++) {
								
								 var tax_address = obj_vvr[t].tax_address;
								  var gstin_two_digit = obj_vvr[t].gstin_two_digit;
								  
								  
								 if(tax_address == address){
									// log.debug('tax_address tax_address', JSON.stringify(obj_vvr[t].GSTIN)); 
								  gstin = obj_vvr[t].GSTIN;
								 // log.debug('gstin gstin 3333', JSON.stringify(gstin)); 
								  tax_id = obj_vvr[t].tax_id;
								
								tax_address_val = tax_address;
									
								if(gstin_two_digit == state_two_digit){
									   is_address_match = 'Yes';
								}
								
							}else{
								
								  tax_id = obj_vvr[t].tax_id;
							 if(state_two_digit != "" ){
									 if(gstin_two_digit == state_two_digit){
									   is_address_match = 'Yes';
									 }
								}
							}
							 
							 }
							 
							//log.debug('gstin gstin', JSON.stringify(gstin)); 
							
							  if(address == ""){address = '-'; }
							 // var category = data_invoice[k].category;
							  var category =  InvObj[k].getText({ name: 'category'});;
							  var regist_type =  InvObj[k].getText({ name: 'custentity_in_gst_vendor_regist_type'});;
							 
							  var entity = data_invoice[k].entityid;
							  var email = data_invoice[k].email;
							  var defaulttaxreg = data_invoice[k].defaulttaxreg;
							  var pan = data_invoice[k].pan;
							   if(email == ""){email = '-'; }
							   if(pan == ""){pan = '-'; }
							 
							  var phone = data_invoice[k].phone;
							  if(phone == ""){phone = '-'; }
							  var address_count = data_invoice[k].address_count;
							  var add_id = data_invoice[k].add_id;
							    var companyname = data_invoice[k].companyname;
							  var firstname = data_invoice[k].firstname;
							  var lastname = data_invoice[k].lastname;
							  
							  if(companyname == ""){
								  companyname = firstname+' '+lastname;
								  }
							 
							  var addresslabel = data_invoice[k].addresslabel;
							
							 // var tst_state = data_invoice[k].tst_state;
							   var tst_state = InvObj[k].getText({ name: 'custrecord_ic_ixps_tst_state', join: 'Address' });
							  var state = data_invoice[k].state;
							  var franchise = data_invoice[k].franchise;
							  var xms = data_invoice[k].xms;
							  var tly_cstmr = data_invoice[k].tly_cstmr;
							
							  if(addresslabel == ""){addresslabel = '-'; }
							  if(add_id == ""){add_id = '-'; }
							  if(tax_id == ""){tax_id = '-'; }
							  if(category == ""){category = '-'; }
							  if(regist_type == ""){regist_type = '-'; }
							 
							  if(tst_state == ""){tst_state = '-'; }
							  if(state == ""){state = '-'; }
							  if(franchise == ""){franchise = '-'; }
							  if(xms == ""){xms = '-'; }
							  if(tly_cstmr == ""){tly_cstmr = '-'; }
							  if(defaulttaxreg == ""){defaulttaxreg = '-'; }
							  if(tax_address_val == ""){tax_address_val = '-'; }
							  
							   if(gstin == ""){gstin = defaulttaxreg; }
							   if(gstin == "-"){gstin = defaulttaxreg; }
							   if(gstin == "-"){ 
								  gstin = tax_gstin_one;
								   }
							  
							   if(gstin == ""){gstin = '-'; }
                              
		  var targetPageUrl = url.resolveRecord({ recordType: 'customer',recordId: internalid, isEditMode: false  });
					
	    sublist.setSublistValue({ id: 'custpage_redirect', line: lineNum, value: '<a href=' + targetPageUrl + ' target="_blank">View</a>' });		
		sublist.setSublistValue({ id: 'custpage_internal_id', line: lineNum, value: internalid });
		sublist.setSublistValue({ id: 'custpage_category', line: lineNum, value: category });
		sublist.setSublistValue({ id: 'custpage_tax_address', line: lineNum, value: tax_address_val });
		sublist.setSublistValue({ id: 'custpage_gstin', line: lineNum, value: gstin });
		sublist.setSublistValue({ id: 'custpage_tax_internal_id', line: lineNum, value: tax_id });
        sublist.setSublistValue({ id: 'custpage_customer_name', line: lineNum, value: entity });
        sublist.setSublistValue({ id: 'custpage_companyname', line: lineNum, value: companyname });
        sublist.setSublistValue({  id: 'custpage_address_count', line: lineNum, value: address_count });
        sublist.setSublistValue({  id: 'custpage_is_address_match', line: lineNum, value: is_address_match });
	    sublist.setSublistValue({  id: 'custpage_addressinternalid', line: lineNum, value: add_id });
        sublist.setSublistValue({  id: 'custpage_addresslabel', line: lineNum, value: addresslabel });
        sublist.setSublistValue({  id: 'custpage_address', line: lineNum, value: address });
        sublist.setSublistValue({  id: 'custpage_tst_state', line: lineNum, value: tst_state });
        sublist.setSublistValue({  id: 'custpage_state', line: lineNum, value: state });
        sublist.setSublistValue({  id: 'custpage_defaulttaxreg', line: lineNum, value: defaulttaxreg });
        sublist.setSublistValue({  id: 'custpage_pan', line: lineNum, value: pan });
        sublist.setSublistValue({  id: 'custpage_franchise', line: lineNum, value: franchise });
        sublist.setSublistValue({  id: 'custpage_xms', line: lineNum, value: xms });
        sublist.setSublistValue({  id: 'custpage_tly_cstmr', line: lineNum, value: tly_cstmr });
        sublist.setSublistValue({  id: 'custpage_reg_type', line: lineNum, value: regist_type });
    
				
				  ++lineNum;			
							}
          
        }

       

        return {
            onRequest: onRequest
        };

    })