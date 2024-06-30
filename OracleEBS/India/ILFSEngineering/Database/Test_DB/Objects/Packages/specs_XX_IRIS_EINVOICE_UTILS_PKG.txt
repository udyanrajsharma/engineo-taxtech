create or replace PACKAGE   XX_IRIS_EINVOICE_UTILS_PKG
AS
	
    PROCEDURE IRIS_CANCEL_IRN_API_PRC
    ( 
        l_errbuf varchar2,l_retcode number,P_CANCEL_REASON varchar2,P_CANCEL_REMARK varchar2, P_INVOICE_ID varchar2
    );

END XX_IRIS_EINVOICE_UTILS_PKG;