/**
 * @NApiVersion 2.0
 * @NScriptType ScheduledScript
 * @NModuleScope Public
 */
define(
		[ 'N/search', 'N/record', 'N/render', 'N/file', 'N/runtime', 'N/log',"../lib/common_2.0",'N/xml','N/encode','N/email',"N/https", "N/url","../lib/lodash.min",'../lib/moment.js' ],
		/**
		 * @param {file}
		 *            file
		 * @param {format}
		 *            format
		 * @param {runtime}
		 *            runtime
		 * @param {search}
		 *            search
		 */
		function(search, record, render, file, Runtime, Log,common,xml,encode,email,https,url,_,moment) {

			var DELIMITER = ",", NEWLINE = "\n",zero=0,blank_field="";
			/**
			 * Definition of the Scheduled script trigger point.
			 * 
			 * @param {Object}
			 *            scriptContext
			 * @param {string}
			 *            scriptContext.type - The context in which the script
			 *            is executed. It is one of the values from the
			 *            scriptContext.InvocationType enum.
			 * @Since 2015.2
			 */
			function createGSTRFileToSend(scriptContext) {
var scriptObj = Runtime.getCurrentScript();
var userObj = Runtime.getCurrentUser();
var acc_period = scriptObj.getParameter('custscript_acc_period');
var report_type = scriptObj.getParameter('custscript_report_type');

log.debug('scriptObj  '+acc_period, JSON.stringify(report_type));
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
      ["postingperiod","abs",acc_period], 
      "AND", 
      ["taxline","is","F"], 
      "AND", 
      ["mainline","is","F"], "AND",
      ["memorized","is","F"],"AND",	  
      ["custcol_in_hsn_code","noneof","@NONE@"], "AND", 
      ["custcol_in_hsn_code.custrecord_in_gst_hsn_code","doesnotstartwith","00000"] ];
	  
	  
	  var Filter_bill =[    ["type","anyof","VendBill","VendCred"], 
      "AND", 
      ["postingperiod","abs",acc_period], 
      "AND", 
      ["taxline","is","F"], 
      "AND", 
      ["mainline","is","F"], "AND",
      ["memorized","is","F"],"AND",	  
      ["custcol_in_hsn_code","noneof","@NONE@"],
		"AND", 
       ["custbody_tcp_jv_type","anyof","6","7","10"],
	   "AND", 
      ["quantity","notequalto","0"], "AND", 
      ["custcol_in_hsn_code.custrecord_in_gst_hsn_code","doesnotstartwith","00000"]


	  ];
	  
	  
	  var Filter_bill_tax =[    ["type","anyof","VendBill","VendCred"], 
      "AND", 
      ["postingperiod","abs",acc_period], 
      "AND", 
      ["mainline","is","F"], 
      "AND", 
      ["taxline","is","F"], 
      "AND", 
      ["shipping","is","F"], "AND", 
      ["taxdetail.taxcode","noneof","@NONE@"],
"AND", 
       ["custbody_tcp_jv_type","anyof","6","7","10"],
	    "AND", 
      ["custcol_in_hsn_code.custrecord_in_gst_hsn_code","doesnotstartwith","00000"]

	  ];
	  
	  
	  
var Filter_Tax =[    ["type","anyof","CustInvc","CustCred"], 
      "AND", 
      ["postingperiod","abs",acc_period], 
      "AND", 
      ["mainline","is","F"], 
      "AND", 
      ["taxline","is","F"], 
      "AND", 
      ["shipping","is","F"], "AND", 
      ["taxdetail.taxcode","noneof","@NONE@"],
		"AND", 
      ["custcol_in_hsn_code.custrecord_in_gst_hsn_code","doesnotstartwith","00000"]
	  ];
	  
	  
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
         name: "taxamount",
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
      search.createColumn({name: "entitytaxregnum", label: "entitytaxregnum"}),
      search.createColumn({name: "rate", label: "rate"}),
      search.createColumn({name: "amount", label: "amount"}),
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
         name: "itemid",
         join: "item",
         label: "itemid"
      }),
	  
	   search.createColumn({name: "billcity", label: "billcity"}),
      search.createColumn({name: "billaddress1", label: "billaddress1"}),
		search.createColumn({name: "billstate", label: "billstate"}),
       search.createColumn({name: "billaddressee", label: "billaddressee"})
      ];
	  
	  
	    var Inv_tax_Obj = common.searchAllRecord('transaction',null,Filter_Tax,Columns_tax);
		var data_inv_tax = common.pushSearchResultIntoArray(Inv_tax_Obj);
		log.debug('data_inv_tax  ', JSON.stringify(data_inv_tax.length));
		
		
	    var bill_tax_Obj = common.searchAllRecord('transaction',null,Filter_bill_tax,Columns_tax);
		var data_bill_tax = common.pushSearchResultIntoArray(bill_tax_Obj);
		log.debug('data_bill_tax  ', JSON.stringify(data_bill_tax.length));
		
		
	  
	   var bill_Obj = common.searchAllRecord('transaction',null,Filter_bill,Columns);
		var data_bill = common.pushSearchResultIntoArray(bill_Obj);
		
		log.debug('data_bill  ', JSON.stringify(data_bill.length));	
	  
	  	   var InvObj = common.searchAllRecord('transaction',null,Filter,Columns);
		var data_inv = common.pushSearchResultIntoArray(InvObj);
		log.debug('data_inv  ', JSON.stringify(data_inv.length));	
		
			var fileContent = '';
		
					for (var i = 0; i < data_headers.length; i++) {
						
						fileContent += data_headers[i] + DELIMITER;
						
					}
					fileContent += NEWLINE;
			
				for (var j = 0; j < data_inv.length; j++) {
					
					
					
					var filtered_array = _.filter(data_inv_tax, { 'linenumber': data_inv[j].line, 'tranid': data_inv[j].internalid });
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
						
						//log.debug('tax_total_amt  ', JSON.stringify(tax_total_amt));
						if(filtered_array){
						//log.debug('filtered_array  ---'+data_inv[j].internalid, JSON.stringify(filtered_array));	
						var tax_data = filtered_array[0];
						
						if(tax_data.taxtype == 3 || tax_data.taxtype == 4){
						
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
						
						 var item = InvObj[j].itemid;
						
						 var nature_of_item = InvObj[j].nature_of_item;
						if(nature_of_item == '3'){
							var nature_of_items = 'S';
						}else{
							var nature_of_items = 'G';
						}
							
						
					if(data_inv[j].type == 'CustInvc'){
						var type = 'INVOICE';
					}else{
							var type = 'CREDIT';
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
					fileContent += data_inv[j].subsidiarytaxregnum  + DELIMITER;
					fileContent += blank_field + DELIMITER;
					fileContent += data_inv[j].entitytaxregnum + DELIMITER;
					
					var entityid = data_inv[j].billaddressee;
					var entityid = entityid.replace(/,/g, " ");
					var billaddress1 = data_inv[j].billaddress1;
					var billaddress1 = billaddress1.replace(/,/g, " ");
					
					fileContent += entityid + DELIMITER;
					fileContent += billaddress1 + DELIMITER;
					fileContent += data_inv[j].billcity + DELIMITER;
					fileContent += data_inv[j].billstate + DELIMITER;
					fileContent += blank_field + DELIMITER;
					fileContent += item + DELIMITER;
					fileContent += nature_of_items + DELIMITER;
					fileContent += data_inv[j].hsn_code + DELIMITER;
					fileContent += Math.abs(data_inv[j].quantity) + DELIMITER;
					fileContent += data_inv[j].uqc_code + DELIMITER;
					fileContent += Math.abs(data_inv[j].rate) + DELIMITER;
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
				
				
				for (var p = 0; p < data_bill.length; p++) {
					
					
					
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
						//log.debug('filtered_array  ---'+data_bill[p].internalid, JSON.stringify(filtered_array));	
						
						if(filtered_array){
	
						var tax_data = filtered_array[0];
						
						if(tax_data.taxtype == 3 || tax_data.taxtype == 4){
						
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
						
						 var nature_of_item = data_bill[p].nature_of_item;
						if(nature_of_item == '3'){
							var nature_of_items = 'S';
						}else{
							var nature_of_items = 'G';
						}
							
						
				if(data_bill[p].type == 'VendBill'){
						var type = 'CREDIT';
						
					}else{
						var type = 'INVOICE';	
					}
					
					//data_inv[j].quantity;
					
					fileContent += type + DELIMITER;
					fileContent += data_bill[p].transactionnumber + DELIMITER;
					fileContent += data_bill[p].trandate + DELIMITER;
					fileContent += data_bill[p].return_filling_month + DELIMITER;
					fileContent += data_bill[p].pos + DELIMITER;
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
					fileContent += data_bill[p].subsidiarytaxregnum  + DELIMITER;
					fileContent += blank_field + DELIMITER;
					fileContent += data_bill[p].entitytaxregnum + DELIMITER;
					
					var entityid_vendor = data_bill[p].billaddressee;
					var entityid_vendor = entityid_vendor.replace(/,/g, " ");
					var billaddress1_vendor = data_bill[p].billaddress1;
					var billaddress1_vendor = billaddress1_vendor.replace(/,/g, " ");
					
					
					fileContent += entityid_vendor + DELIMITER;
					fileContent += billaddress1_vendor + DELIMITER;
					fileContent += data_bill[p].billcity + DELIMITER;
					fileContent += data_bill[p].billstate + DELIMITER;
					fileContent += blank_field + DELIMITER;
					fileContent += item + DELIMITER;
					fileContent += nature_of_items + DELIMITER;
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
					fileContent += blank_field + DELIMITER;
					fileContent += blank_field + DELIMITER;
					fileContent += blank_field + DELIMITER;
					fileContent += blank_field + NEWLINE;
					
					
				}
				
				var file_id = writeFileIntoFileCabinet(fileContent,report_type,userObj);
				
			log.debug('file_id  ', JSON.stringify(file_id));	
				
		

			}
			
			
			
			function writeFileIntoFileCabinet(fileContent,report_type) {

           
                FOLDER_ID = 7479;
           
            var fileName = getFileName();
            
            try {
                var fileRec = file.create({
                    name: fileName,
                    fileType: file.Type.CSV,
                    contents: fileContent
                });
                fileRec.folder = FOLDER_ID;
             var file_id =  fileRec.save();
			 
			 
			
			var gstr_file_record = record.load({type: 'customrecord_gstr_file_record', id: 1 })
			
		  gstr_file_record.setValue({ fieldId: 'custrecord_gstr_file_type', value: report_type});
		  gstr_file_record.setValue({ fieldId: 'custrecord_gstr_file_name', value: fileName });
		  gstr_file_record.setValue({ fieldId: 'custrecord_gstr_file_id', value: file_id });
		  gstr_file_record.setValue({ fieldId: 'custrecord_gstr_file_status', value: 'In-Progress' });
		  
		    var  record_id =  gstr_file_record.save();
            
		var RecordID = SendFileToClearTax(file_id,fileName,report_type,record_id);
			
			} catch (E) {
                log.error('Error while creating file', E);
                throw E;
            }
			
			//return file_id;

        }
			
			
			function FormatDateString(dateString,userDateFormat) 
	{
		
		return moment(dateString).format(userDateFormat);
	}
			
			
			function SendFileToClearTax(file_id,fileName,report_type,record_id) {
				
					var base_url = 'https://api.clear.in/integration/v1/generatePreSign/'+report_type+'?fileName='+fileName;
						log.debug('base_url base_url', JSON.stringify(base_url));
					
					var Api_Token = GetApiToken(1);
		
		var token_val = Api_Token[0].token;			

			
			
				var headerObj = new Array();
		headerObj['x-cleartax-auth-token'] = token_val;	
		headerObj['fileContentType'] = 'CSV';	
		headerObj['Accept'] = 'application/json';	
		
		
		var response = https.get({url: base_url,headers: headerObj});
		
			log.debug('json_obj values', JSON.stringify(response));
		log.debug('json_obj values body', JSON.parse(response.body));
		
			var body_data = JSON.parse(response.body);
		
		var pre_url = body_data.preSignedS3Url;
			log.debug('json_obj preSignedS3Url', JSON.stringify(pre_url));
			
				var fileContent = file.load(file_id).getContents();
				
				var headerObj_new = new Array();
		headerObj_new['Content-Type'] = 'application/vnd.ms-excel';	
	
		headerObj_new['Accept'] = 'application/json';


var response_new = https.put({ url: pre_url,body: fileContent,headers: headerObj_new});		

if(report_type == 'sales'){
	
	var temp_id = "618a5623836651c01c1498ad";
}else{
var temp_id = "60e5613ff71f4a7aeca4336b";	
	
}


	var post_body_for_ingest ={
    "userInputArgs": {
        "gstins": [],
        "templateId": temp_id
    },
    "fileInfo": {
        "s3FileUrl": pre_url,
        "userFileName": fileName
    }
};

	var	igest_url = 'https://api.clear.in/integration/v1/ingest/file/'+report_type;
		var headerObj_ingest = new Array();
		headerObj_ingest['x-cleartax-auth-token'] = token_val;		
		headerObj_ingest['Content-Type'] = 'application/json';	
		headerObj_ingest['Accept'] = 'application/json';	

var response_ingest = https.post({ url: igest_url,body: JSON.stringify(post_body_for_ingest),headers: headerObj_ingest});	
			
log.debug('json_obj response_ingest response_ingest', JSON.stringify(response_ingest));
log.debug('json_obj values body', JSON.parse(response_ingest.body));
		
			var body_data_ingest = JSON.parse(response_ingest.body);
			
			var activityId = body_data_ingest.activityId;
			
			record.submitFields({
		    			type : 'customrecord_gstr_file_record',
		    			id : 1,
		    			values : {
		    				custrecord_gstr_file_activityid : activityId
		    			}
		    		});
			log.debug('activityId activityId', JSON.stringify(activityId));
			
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
			
			
			function getFileName() {
				
				var formattedDate = moment().format('YYMMDD');
				return 'gstr_report_' + formattedDate +'.csv';
				
				
			}
			
			
			
			
			
			
			
			
				
			


			return {
				execute : createGSTRFileToSend
			};

		});