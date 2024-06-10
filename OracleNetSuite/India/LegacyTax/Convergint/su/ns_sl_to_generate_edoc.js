/**
 * @NApiVersion 2.0
 * @NScriptType Suitelet
 * @NModuleScope Public
 */
define([
  "N/record",
  "N/runtime",
  "N/search",
  "N/ui/serverWidget",
  "N/encode",
  "N/file",
  "../lib/common_2.0",
  "N/https",
  "N/url",
  "../lib/lodash.min.js",
  "../lib/moment.js",
], /**
 * @param {record} record
 * @param {runtime} runtime
 * @param {search} search
 */ function (
  record,
  runtime,
  search,
  serverWidget,
  encode,
  file,
  common,
  https,
  url,
  _,
  moment
) {
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

    log.debug("parameters parameters", JSON.stringify(parameters.transId));

    log.debug("userObj userObj", JSON.stringify(userObj));
    log.debug("subsidiary subsidiary", JSON.stringify(userObj.subsidiary));
    var date_format = userObj.getPreference({ name: "DATEFORMAT" });
    var invoice_id = parameters.transId;
    var rec_type = "Invoice";
    try {
      var objRecord = record.load({
        type: record.Type.INVOICE,
        id: invoice_id,
      });
    } catch (e) {
      var objRecord = record.load({
        type: "creditmemo",
        id: invoice_id,
      });

      rec_type = "CreditMemo";
    }
    var tranid = objRecord.getValue({ fieldId: "tranid" });
    var trandate = objRecord.getValue({ fieldId: "trandate" });
    var otherrefnum = objRecord.getValue({ fieldId: "otherrefnum" });
     var clientpo_date = objRecord.getValue({ fieldId: "custbody_so_clientpo_date" });
    trandate = FormatDateString(trandate, "DD/MM/YYYY");

    if(clientpo_date != ""){
			  clientpo_date = FormatDateString(clientpo_date, "DD/MM/YYYY");
			
		}
    
    var nexus = objRecord.getValue({ fieldId: "nexus" });

    var subsidiary = objRecord.getValue({ fieldId: "subsidiary" });
    var entity = objRecord.getValue({ fieldId: "entity" });
    var location_val = objRecord.getValue({ fieldId: "location" });

    var subtotal = objRecord.getValue({ fieldId: "subtotal" });
    var createdfrom = objRecord.getValue("createdfrom");
    var taxtotal = objRecord.getValue({ fieldId: "taxtotal" });
    // is SEZ
    var custbody187 = objRecord.getValue({
      fieldId: "custbody_v_invoice_client_sez",
    });
    log.debug("is SEZ custbody187", JSON.stringify(custbody187));

    if (custbody187) {
      if (taxtotal == 0) {
        var SupTyp = "SEZWOP";
      } else {
        var SupTyp = "SEZWP";
      }
    } else {
      var SupTyp = "B2B";
    }

    // var client_gst = objRecord.getValue({fieldId: 'custbody_ein_cus_gstin'});

    var terms = objRecord.getText({ fieldId: "terms" });
    var amountremainingtotalbox = objRecord.getValue({
      fieldId: "amountremainingtotalbox",
    });

    var total = objRecord.getValue({ fieldId: "total" });

    var subsidiary_val = objRecord.getText({ fieldId: "subsidiary" });

    var Seller_Details = GetSellerDetails(subsidiary, nexus);

    var Buyers_Details = GetBuyersDetails(entity);
    var State_Details = GetGstStateCode();

    if (location_val != "") {
      var Dispatch_Details = GetDispatchDetails(location_val);
      log.debug("Dispatch_ Dispatch_Details", JSON.stringify(Dispatch_Details));
      sellerAddr1 = Dispatch_Details[0].address1;
      sellerAddr2 = Dispatch_Details[0].address2;
      sellerLoc = Dispatch_Details[0].city;
      sellerPin = Dispatch_Details[0].zip;
      sellStcd = Dispatch_Details[0].state;
      sellStcd_index = _.findIndex(State_Details, function (o) {
        return o.alpha_code == sellStcd;
      });
      sellerStcd = State_Details[sellStcd_index].state_code;
      dispatchNm = Dispatch_Details[0].name;
      dispatchAddr1 = Dispatch_Details[0].address1;
      dispatchAddr2 = Dispatch_Details[0].address2;
      dispatchLoc = Dispatch_Details[0].city;
      dispatchStcd = Dispatch_Details[0].state.substring(0, 2);
      dispatchStcd_index = _.findIndex(State_Details, function (o) {
        return o.alpha_code == dispatchStcd;
      });
      dispatchStcd = State_Details[dispatchStcd_index].state_code;
      dispatchPin = Dispatch_Details[0].zip;
    } else {
      sellerAddr1 = Seller_Details[0].address1;
      sellerAddr2 = Seller_Details[0].address2;
      sellerLoc = Seller_Details[0].city;
      sellerPin = Seller_Details[0].zip;
      sellStcd = Seller_Details[0].state;
      sellStcd_index = _.findIndex(State_Details, function (o) {
        return o.alpha_code == sellStcd;
      });
      sellerStcd = State_Details[sellStcd_index].state_code;

      dispatchNm = Seller_Details[0].name;
      dispatchAddr1 = Seller_Details[0].address1;
      dispatchAddr2 = Seller_Details[0].address2;
      dispatchLoc = Seller_Details[0].city;
      dispatchStcd = Seller_Details[0].state.substring(0, 2);
      dispatchStcd_index = _.findIndex(State_Details, function (o) {
        return o.alpha_code == dispatchStcd;
      });
      dispatchStcd = State_Details[dispatchStcd_index].state_code;

      dispatchPin = Seller_Details[0].zip;
    }

    var ship_Details = GetShippingDetails(invoice_id);
    log.debug("ship_Details", JSON.stringify(ship_Details));

    var shipaddr1 = ship_Details[0].shipaddress1;
    var shipaddr2 = ship_Details[0].shipaddress2;
    var shipcity = ship_Details[0].shipcity;
    var shipstate = ship_Details[0].shipstate;
    var shipzip = ship_Details[0].shipzip;
    var shipcountry = ship_Details[0].shipcountry;
    var state_code_buyer = shipstate;

    if (shipcountry != "IN") {
      state_code_buyer = "96";
    } else {
      state_code_buyer_index = _.findIndex(State_Details, function (o) {
        return o.alpha_code == state_code_buyer;
      });
      state_code_buyer = State_Details[state_code_buyer_index].state_code;
    }

    var billaddress1 = ship_Details[0].billaddress1;
    var billaddress2 = ship_Details[0].billaddress2;
    var billcity = ship_Details[0].billcity;
    var billstate = ship_Details[0].billstate;
    var billcountry = ship_Details[0].billcountry;

    if (billcountry != "IN") {
      var state_code_buyer_detail = "96";
    } else {
      billstate_index = _.findIndex(State_Details, function (o) {
        return o.alpha_code == billstate;
      });
      var state_code_buyer_detail = State_Details[billstate_index].state_code;
    }

  
      var client_gst = GetGSTIN(entity, billstate);
   

    var ship_gst = GetGSTIN(entity, shipstate);
   
   if (ship_gst == "") {
      ship_gst = client_gst;
    }

    var is_b2c = false;
	
	log.debug("Dispatch_ client_gst client_gst", JSON.stringify(client_gst));
	
    if (client_gst == "") {
      is_b2c = true;
    }

    var billzip = ship_Details[0].billzip;
    var entitytaxregnum = ship_Details[0].bill_gstin;
    var inv_ref_no, inv_date;

    if (rec_type == "Invoice") {
      var Item_Details = GetItemDetails(objRecord, invoice_id);
    } else {
      var Item_Details = GetItemDetails_Creditmemo(objRecord, invoice_id);

      if (createdfrom != "") {
        var fieldLookUp_inv = search.lookupFields({
          type: search.Type.INVOICE,
          id: createdfrom,
          columns: ["tranid", "trandate"],
        });

        log.debug("Dispatch_ fieldLookUp_inv", JSON.stringify(fieldLookUp_inv));
        inv_ref_no = fieldLookUp_inv.tranid;
        inv_date = fieldLookUp_inv.trandate;
      }
    }

    if (Buyers_Details[0].custentity1_1 != "") {
      var buyer_lglnm = Buyers_Details[0].custentity1_1;
    } else {
      var buyer_lglnm = Buyers_Details[0].altname;
    }

    log.debug("Item_Details fetch", JSON.stringify(Item_Details));
    var is_igst = false;
    if (dispatchStcd != state_code_buyer_detail) {
      is_igst = true;
    }
    var igst_amt;
    var cgst_amt;

    if (is_igst) {
      igst_amt = taxtotal;
      cgst_amt = 0;
    } else {
      cgst_amt = parseFloat(taxtotal / 2).toFixed(2);
      igst_amt = 0;
    }
    var values = [];
    for (var p = 0; p < Item_Details.length; p++) {
      log.debug(
        "Item_Details Item_Details  " + p,
        JSON.stringify(Item_Details[p])
      );
      var qty_item = Math.abs(Item_Details[p].quantity);
      var TotAmt = Math.abs(Item_Details[p].fxrate * 1);
      var tax_ammt = Math.abs(Item_Details[p].tax_amt * 1);
      var hsn = Item_Details[p].hsn;
      var type = Item_Details[p].type;
      if (hsn == "") {
        hsn = "998313";
      }

      if (type == "Kit" || type == "InvtPart") {
        var IsServc = "N";
        var uom = Item_Details[p].item_uom;
        if (uom == "") {
          uom = "OTH";
        }
      } else {
        var uom = "";
        var IsServc = "Y";
      }

      if (is_igst) {
        var igst_item_amt = tax_ammt;
        var cgst_item_amt = 0;
      } else {
        cgst_item_amt = parseFloat(tax_ammt / 2).toFixed(2);
        igst_item_amt = 0;
      }

      var q = p + Number(1);
      values[p] = {
        SlNo: q,
        PrdDesc: Item_Details[p].memo,
        IsServc: IsServc,
        HsnCd: hsn,
        BchDtls: null,
        Barcde: null,
        Qty: qty_item,
        FreeQty: null,
        Unit: uom,
        UnitPrice: parseFloat(TotAmt / qty_item).toFixed(2),
        TotAmt: TotAmt,
        Discount: 0,
        PreTaxVal: null,
        AssAmt: TotAmt,
        GstRt: Item_Details[p].tax_rate,
        IgstAmt: igst_item_amt,
        CgstAmt: cgst_item_amt,
        SgstAmt: cgst_item_amt,
        CesRt: 0,
        CesAmt: 0,
        CesNonAdvlAmt: 0,
        StateCesRt: null,
        StateCesAmt: null,
        StateCesNonAdvlAmt: null,
        OthChrg: null,
        OrdLineRef: null,
        TotItemVal: TotAmt + parseFloat(tax_ammt),
        OrgCntry: null,
        PrdSlNo: null,
        AttribDtls: null,
      };
    }

    if (is_b2c) {
      var edocContent = {
        transaction: {
          Version: "1.1",
          TranDtls: {
            TaxSch: "GST",
            SupTyp: "B2C",
            RegRev: "Y",
            EcmGstin: null,
            IgstOnIntra: "N",
          },
          DocDtls: {
            Typ: "INV",
            No: tranid,
            Dt: trandate,
          },
          SellerDtls: {
            Gstin: "29AABCI8139E1ZH",
            LglNm: Seller_Details[0].legalname,
            TrdNm: Seller_Details[0].name,
            Addr1: "Unit No. 303 and 304,2nd Floor (Level III)",
            Addr2: "No. 1 Prestige Atrium, Central Street Shivajinagar",
            Loc: sellerLoc,
            Pin: "560001",
            Stcd: sellerStcd,
            Ph: null,
            Em: null,
          },

          BuyerDtls: {
            Gstin: "",
            LglNm: buyer_lglnm,
            TrdNm: Buyers_Details[0].altname,
            Pos: state_code_buyer_detail,
            Addr1: billaddress1,
            Addr2: billaddress2,
            Loc: billcity,
            Pin: billzip,
            Stcd: state_code_buyer_detail,
            Ph: null,
            Em: Buyers_Details[0].email,
          },

          DispDtls: {
            Nm: dispatchNm,
            Addr1: dispatchAddr1,
            Addr2: dispatchAddr2,
            Loc: dispatchLoc,
            Stcd: dispatchStcd,
            Pin: dispatchPin,
          },
          ShipDtls: {
            LglNm: buyer_lglnm,
            TrdNm: Buyers_Details[0].altname,
            Gstin: ship_gst,
            Addr1: shipaddr1,
            Addr2: shipaddr2,
            Loc: shipcity,
            Pin: shipzip,
            Stcd: state_code_buyer,
          },
          ItemList: values,
          ValDtls: {
            AssVal: subtotal,
            CgstVal: cgst_amt,
            SgstVal: cgst_amt,
            IgstVal: igst_amt,
            CesVal: 0,
            StCesVal: null,
            Discount: 0,
            OthChrg: 0,
            RndOffAmt: null,
            TotInvVal: total,
            TotInvValFc: null,
          },

          PayDtls: {
            Nm: "CONVERGINT INDIA PRIVATE LIMITED",
            AccDet: "5385178248",
            Mode: "Direct Transfer",
            FinInsBr: "CHAS0INBX01",
            PayTerm: terms,
            PayInstr: "",
            CrTrn: "",
            DirDr: "",
            CrDay: "",
            PaidAmt: "",
            PaymtDue: amountremainingtotalbox,
            PayeeUPI: "CONVERGINT@sb",
          },
          RefDtls: null,
          ExpDtls: null,

          custom_fields: {
            doc_no: tranid,
            name: subsidiary_val,
          },
        },
      };
    } else {
      if (rec_type == "Invoice") {
        var edocContent = [
          {
            transaction: {
              Version: "1.1",
              TranDtls: {
                TaxSch: "GST",
                RegRev: null,
                SupTyp: SupTyp,
                EcmGstin: null,
                IgstOnIntra: "N",
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
              AddlDocDtls: null,
              DocDtls: {
                Typ: "INV",
                No: tranid,
                Dt: trandate,
              },
              ExpDtls: null,
              EwbDtls: null,
              SellerDtls: {
                Gstin: "29AABCI8139E1ZH",
                LglNm: Seller_Details[0].legalname,
                TrdNm: Seller_Details[0].name,
                Addr1: "Unit No. 303 and 304,2nd Floor (Level III)",
                Addr2: "No. 1 Prestige Atrium, Central Street Shivajinagar",
                Loc: sellerLoc,
                Pin: "560001",
                Stcd: sellerStcd,
                Ph: null,
                Em: null,
              },

              BuyerDtls: {
                Gstin: client_gst,
                LglNm: buyer_lglnm,
                TrdNm: Buyers_Details[0].altname,
                Pos: state_code_buyer_detail,
                Addr1: billaddress1,
                Addr2: billaddress2,
                Loc: billcity,
                Pin: billzip,
                Stcd: state_code_buyer_detail,
                Ph: null,
                Em: Buyers_Details[0].email,
              },
              PayDtls: {
                Nm: "CONVERGINT INDIA PRIVATE LIMITED",
                AccDet: "5385178248",
                Mode: "Direct Transfer",
                FinInsBr: "CHAS0INBX01",
                PayTerm: terms,
                PayInstr: "",
                CrTrn: "",
                DirDr: "",
                CrDay: "",
                PaidAmt: "",
                PaymtDue: amountremainingtotalbox,
              },
              DispDtls: {
                Nm: dispatchNm,
                Addr1: dispatchAddr1,
                Addr2: dispatchAddr2,
                Loc: dispatchLoc,
                Stcd: dispatchStcd,
                Pin: dispatchPin,
              },
              ShipDtls: {
                LglNm: buyer_lglnm,
                TrdNm: Buyers_Details[0].altname,
                Gstin: ship_gst,
                Addr1: shipaddr1,
                Addr2: shipaddr2,
                Loc: shipcity,
                Pin: shipzip,
                Stcd: state_code_buyer,
              },
              ItemList: values,
              ValDtls: {
                AssVal: subtotal,
                CgstVal: cgst_amt,
                SgstVal: cgst_amt,
                IgstVal: igst_amt,
                CesVal: 0,
                StCesVal: null,
                Discount: 0,
                OthChrg: 0,
                RndOffAmt: null,
                TotInvVal: total,
                TotInvValFc: null,
              },
            },
            custom_fields: {
              doc_no: tranid,
              name: subsidiary_val,
            },
            meta_data: {
              tag: rec_type,
            },
          },
        ];
      } else {
        var edocContent = [
          {
            transaction: {
              Version: "1.1",
              TranDtls: {
                TaxSch: "GST",
                RegRev: null,
                SupTyp: SupTyp,
                EcmGstin: null,
                IgstOnIntra: "N",
              },
              RefDtls: null,
              AddlDocDtls: null,
              DocDtls: {
                Typ: "CRN",
                No: tranid,
                Dt: trandate,
              },
              PrecDoc: {
                InvNo: inv_ref_no,
                InvDt: inv_date,
                OthRefNo: otherrefnum,
              },
              ExpDtls: null,
              EwbDtls: null,
              SellerDtls: {
                Gstin: "29AABCI8139E1ZH",
                LglNm: Seller_Details[0].legalname,
                TrdNm: Seller_Details[0].name,
                Addr1: "Unit No. 303 and 304,2nd Floor (Level III)",
                Addr2: "No. 1 Prestige Atrium, Central Street Shivajinagar",
                Loc: sellerLoc,
                Pin: "560001",
                Stcd: sellerStcd,
                Ph: null,
                Em: null,
              },

              BuyerDtls: {
                Gstin: client_gst,
                LglNm: buyer_lglnm,
                TrdNm: Buyers_Details[0].altname,
                Pos: state_code_buyer_detail,
                Addr1: billaddress1,
                Addr2: billaddress2,
                Loc: billcity,
                Pin: billzip,
                Stcd: state_code_buyer_detail,
                Ph: null,
                Em: Buyers_Details[0].email,
              },
              PayDtls: {
                Nm: "CONVERGINT INDIA PRIVATE LIMITED",
                AccDet: "5385178248",
                Mode: "Direct Transfer",
                FinInsBr: "CHAS0INBX01",
                PayTerm: terms,
                PayInstr: "",
                CrTrn: "",
                DirDr: "",
                CrDay: "",
                PaidAmt: "",
                PaymtDue: amountremainingtotalbox,
              },
              DispDtls: {
                Nm: dispatchNm,
                Addr1: dispatchAddr1,
                Addr2: dispatchAddr2,
                Loc: dispatchLoc,
                Stcd: dispatchStcd,
                Pin: dispatchPin,
              },
              ShipDtls: {
                LglNm: buyer_lglnm,
                TrdNm: Buyers_Details[0].altname,
                Gstin: ship_gst,
                Addr1: shipaddr1,
                Addr2: shipaddr2,
                Loc: shipcity,
                Pin: shipzip,
                Stcd: state_code_buyer,
              },
              ItemList: values,
              ValDtls: {
                AssVal: subtotal,
                CgstVal: cgst_amt,
                SgstVal: cgst_amt,
                IgstVal: igst_amt,
                CesVal: 0,
                StCesVal: null,
                Discount: 0,
                OthChrg: 0,
                RndOffAmt: null,
                TotInvVal: total,
                TotInvValFc: null,
              },
            },
            custom_fields: {
              doc_no: tranid,
              name: subsidiary_val,
            },
            meta_data: {
              tag: rec_type,
            },
          },
        ];
      }
    }
    var fileName = rec_type + "_" + tranid + "_edoc.json";
    var File = file.create({
      name: fileName,
      fileType: file.Type.JSON,
      contents: JSON.stringify(edocContent),
    });

    File.folder = 21097122;
    var edoc_id = File.save();
    var today = new Date();
    if (rec_type == "Invoice") {
      if (is_b2c) {
        var otherId = record.submitFields({
          type: record.Type.INVOICE,
          id: invoice_id,
          values: {
            custbody_generated_edoc: JSON.stringify(edocContent),
            custbody_ei_status: 2,
            custbody_generated_edoc_file: edoc_id,
            custbody_einvoice_gen_date: today,
            custbody_is_b2c: true,
          },
        });
        otherId = 200;
      } else {
        var otherId = record.submitFields({
          type: record.Type.INVOICE,
          id: invoice_id,
          values: {
            custbody_generated_edoc: JSON.stringify(edocContent),
            custbody_ei_status: 2,
            custbody_generated_edoc_file: edoc_id,
            custbody_einvoice_gen_date: today,
          },
        });
        otherId = 200;
      }
    } else {
      if (is_b2c) {
        var otherId = record.submitFields({
          type: "creditmemo",
          id: invoice_id,
          values: {
            custbody_generated_edoc: JSON.stringify(edocContent),
            custbody_ei_status: 2,
            custbody_generated_edoc_file: edoc_id,
            custbody_einvoice_gen_date: today,
            custbody_is_b2c: true,
          },
        });
        otherId = 200;
      } else {
        var otherId = record.submitFields({
          type: "creditmemo",
          id: invoice_id,
          values: {
            custbody_generated_edoc: JSON.stringify(edocContent),
            custbody_ei_status: 2,
            custbody_generated_edoc_file: edoc_id,
            custbody_einvoice_gen_date: today,
          },
        });
        otherId = 200;
      }
    }

    context.response.write(JSON.stringify(otherId));
  }

  function GetGSTIN(entity, billstate) {
	  
	  var gstin = "";
	  
    var filters = [["internalid", "anyof", entity]];

    var columns = [
      search.createColumn({
        name: "state",
        join: "Address",
        label: "state",
      }),
      search.createColumn({
        name: "custrecord_india_gstin",
        join: "Address",
        label: "gstin",
      }),
    ];

    var ship_data = common.searchAllRecord("customer", null, filters, columns);
    var Ship_Details = common.pushSearchResultIntoArray(ship_data);
    for (var p = 0; p < Ship_Details.length; p++) {
      var addressinternalid = Ship_Details[p].state;
      if (addressinternalid == billstate) {
         gstin = Ship_Details[p].gstin;
        if (gstin != "") {
          break;
        }
      }
    }

    log.debug("gstin gstin", JSON.stringify(gstin));
    return gstin;
  }

  function GetApiToken(gstin) {
    var filters = [["internalid", "is", 1]];

    var columns = [
      search.createColumn({ name: "custrecord_api_gstin", label: "gstin" }),
      search.createColumn({ name: "custrecord_api_token", label: "token" }),
    ];

    var token_data = common.searchAllRecord(
      "customrecord_gstin_token_for_api",
      null,
      filters,
      columns
    );
    var Token_Details = common.pushSearchResultIntoArray(token_data);

    log.debug("Token_Details Token_Details", JSON.stringify(Token_Details));
    return Token_Details;
  }

  function GetGstStateCode() {
    var filters = [["isinactive", "is", "F"]];

    var columns = [
      search.createColumn({
        name: "custrecord_gst_state_code",
        label: "state_code",
      }),
      search.createColumn({
        name: "custrecordgst_alpha_code",
        label: "alpha_code",
      }),
    ];

    var state_data = common.searchAllRecord(
      "customrecord_gst_state_code",
      null,
      filters,
      columns
    );
    var state_Details = common.pushSearchResultIntoArray(state_data);

    return state_Details;
  }

  function GetItemDetails_Creditmemo(objRecord, invoice_id) {
    log.debug(
      "GetItemDetails_Creditmemo invoice_id",
      JSON.stringify(invoice_id)
    );

    var filters = [
      ["type", "anyof", "CustCred"],
      "AND",
      ["mainline", "is", "F"],
      "AND",
      ["shipping", "is", "F"],
      "AND",
      ["taxline", "is", "F"],
      "AND",
      ["memo", "isnot", "Cost of Sales"],
      "AND",

      ["internalid", "anyof", invoice_id],
    ];

    var columns = [
      search.createColumn({ name: "item", label: "item" }),
      search.createColumn({ name: "line", label: "line" }),
      search.createColumn({ name: "quantity", label: "quantity" }),
      search.createColumn({ name: "memo", label: "memo" }),
      search.createColumn({ name: "fxamount", label: "fxrate" }),
      search.createColumn({ name: "custitem22", join: "item", label: "hsn" }),
      search.createColumn({
        name: "formulacurrency",
        formula: "({fxamount}/{amount})*{taxamount}",
        label: "tax_amt",
      }),
      search.createColumn({ name: "type", join: "item", label: "type" }),
      search.createColumn({
        name: "formulanumeric",
        formula: "{taxitem.rate}",
        label: "tax_rate",
      }),
      search.createColumn({ name: "custcol_v_item_uom", label: "item_uom" }),
    ];

    var item_data = common.searchAllRecord(
      "transaction",
      null,
      filters,
      columns
    );
    var item_Details = common.pushSearchResultIntoArray(item_data);

    log.debug("item_Details item_Details", JSON.stringify(item_Details));

    return item_Details;
  }

  function GetItemDetails(objRecord, invoice_id) {
    log.debug("GetItemDetails invoice_id", JSON.stringify(invoice_id));

    var item_list = objRecord.getLineCount({ sublistId: "item" });
    var sublistName = objRecord.getSublists();

    var filters = [
      ["type", "anyof", "CustInvc"],
      "AND",
      ["mainline", "is", "F"],
      "AND",
      ["shipping", "is", "F"],
      "AND",
      ["taxline", "is", "F"],
      "AND",
      ["internalid", "anyof", invoice_id],
      "AND",
      ["amount", "greaterthan", "0.00"],
    ];

    var columns = [
      search.createColumn({ name: "item", label: "item" }),
      search.createColumn({ name: "line", label: "line" }),
      search.createColumn({ name: "quantity", label: "quantity" }),
      search.createColumn({ name: "memo", label: "memo" }),
      search.createColumn({ name: "fxamount", label: "fxrate" }),
      search.createColumn({ name: "custitem22", join: "item", label: "hsn" }),
      search.createColumn({
        name: "formulacurrency",
        formula: "({fxamount}/{amount})*{taxamount}",
        label: "tax_amt",
      }),
      search.createColumn({ name: "type", join: "item", label: "type" }),
      search.createColumn({
        name: "formulanumeric",
        formula: "{taxitem.rate}",
        label: "tax_rate",
      }),
      search.createColumn({ name: "custcol_v_item_uom", label: "item_uom" }),
    ];

    var item_data = common.searchAllRecord("invoice", null, filters, columns);
    var item_Details = common.pushSearchResultIntoArray(item_data);

    log.debug("item_Details item_Details", JSON.stringify(item_Details));

    return item_Details;
  }

  function GetShippingDetails(invoice_id) {
    log.debug("Ship_Details GetShippingDetails", JSON.stringify(invoice_id));

    var filters = [
      ["type", "anyof", "CustInvc", "CustCred"],
      "AND",
      ["mainline", "is", "T"],
      "AND",
      ["internalid", "anyof", invoice_id],
    ];

    var columns = [
      search.createColumn({ name: "shipaddress1", label: "shipaddress1" }),
      search.createColumn({ name: "shipaddress2", label: "shipaddress2" }),
      search.createColumn({ name: "shipcity", label: "shipcity" }),
      search.createColumn({ name: "shipstate", label: "shipstate" }),
      search.createColumn({ name: "shipzip", label: "shipzip" }),
      search.createColumn({
        name: "custrecord_india_gstin",
        join: "billingAddress",
        label: "bill_gstin",
      }),
      search.createColumn({ name: "billaddress1", label: "billaddress1" }),
      search.createColumn({ name: "billaddress2", label: "billaddress2" }),
      search.createColumn({ name: "billcity", label: "billcity" }),
      search.createColumn({ name: "billstate", label: "billstate" }),
      search.createColumn({ name: "billcountrycode", label: "billcountry" }),
      search.createColumn({ name: "shipcountrycode", label: "shipcountry" }),
      search.createColumn({ name: "billzip", label: "billzip" }),
    ];

    var ship_data = common.searchAllRecord(
      "transaction",
      null,
      filters,
      columns
    );
    var Ship_Details = common.pushSearchResultIntoArray(ship_data);

    log.debug("Ship_Details Ship_Details", JSON.stringify(Ship_Details));
    return Ship_Details;
  }

  function GetDispatchDetails(location_val) {
    log.debug("GetDispatchDetails location_val", JSON.stringify(location_val));

    var filters = [["internalid", "anyof", location_val]];

    var columns = [
      search.createColumn({
        name: "name",
        sort: search.Sort.ASC,
        label: "name",
      }),
      search.createColumn({ name: "phone", label: "phone" }),
      search.createColumn({ name: "city", label: "city" }),
      search.createColumn({ name: "state", label: "state" }),
      search.createColumn({ name: "country", label: "country" }),
      search.createColumn({ name: "address1", label: "address1" }),
      search.createColumn({ name: "address2", label: "address2" }),
      search.createColumn({ name: "zip", label: "zip" }),
    ];

    var location_data = common.searchAllRecord(
      "location",
      null,
      filters,
      columns
    );
    var Dispatch_Details = common.pushSearchResultIntoArray(location_data);

    return Dispatch_Details;
  }

  function GetBuyersDetails(entity) {
    log.debug("GetBuyersDetails entity", JSON.stringify(entity));

    var filters = [["internalid", "anyof", entity]];

    var columns = [
      search.createColumn({ name: "entityid", label: "name" }),
      search.createColumn({ name: "altname", label: "altname" }),
      search.createColumn({ name: "custentity1_1", label: "custentity1_1" }),
      search.createColumn({ name: "address1", label: "address1" }),
      search.createColumn({ name: "address2", label: "address2" }),
      search.createColumn({ name: "city", label: "city" }),
      search.createColumn({ name: "state", label: "state" }),
      search.createColumn({ name: "zipcode", label: "zipcode" }),
      search.createColumn({ name: "email", label: "email" }),
    ];

    var customer_data = common.searchAllRecord(
      "customer",
      null,
      filters,
      columns
    );
    var Buyers_Details = common.pushSearchResultIntoArray(customer_data);
    log.debug("Buyers_Details entity", JSON.stringify(Buyers_Details));

    return Buyers_Details;
  }

  function GetSellerDetails(subsidiary, nexus) {
    var filters = [["internalid", "anyof", subsidiary]];

    var columns = [
      search.createColumn({ name: "namenohierarchy", label: "name" }),
      search.createColumn({ name: "city", label: "city" }),
      search.createColumn({ name: "state", label: "state" }),
      search.createColumn({ name: "country", label: "country" }),
      search.createColumn({ name: "currency", label: "currency" }),
      search.createColumn({ name: "legalname", label: "legalname" }),
      search.createColumn({ name: "address1", label: "address1" }),
      search.createColumn({ name: "address2", label: "address2" }),
      search.createColumn({ name: "zip", label: "zip" }),
    ];

    var subsidiary_data = common.searchAllRecord(
      "subsidiary",
      null,
      filters,
      columns
    );
    var Seller_Details = common.pushSearchResultIntoArray(subsidiary_data);
    log.debug("Seller_Details nexus", JSON.stringify(Seller_Details));

    return Seller_Details;
  }

  function FormatDateString(dateString, userDateFormat) {
    return moment(dateString).format(userDateFormat);
  }

  return {
    onRequest: onRequest,
  };
});
