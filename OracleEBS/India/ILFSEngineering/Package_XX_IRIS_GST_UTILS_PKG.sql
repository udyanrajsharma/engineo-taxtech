create or replace PACKAGE   XX_IRIS_GST_UTILS_PKG
AS
	
    PROCEDURE IRIS_GSTR1_API_PRC
    ( 
        l_errbuf varchar2,
        l_retcode number,
        P_FROM_DATE varchar2,
        P_TO_DATE varchar2
    );

	PROCEDURE IRIS_GSTR2_API_PRC
    ( 
        l_errbuf varchar2,
        l_retcode number,
        P_FROM_DATE varchar2,
        P_TO_DATE varchar2
    );

	PROCEDURE IRIS_EINV_API_PRC
    ( 
        l_errbuf varchar2,
        l_retcode number,
        P_FROM_DATE varchar2,
        P_TO_DATE varchar2,
        P_TRX_NUMBER varchar2
    );

	PROCEDURE IRIS_EWB_WithoutIRN_API_PRC
    ( 
        l_errbuf varchar2,
        l_retcode number,
        P_DOC_NUMBER varchar2
    );

    PROCEDURE ILFS_FND_ATTACHMENT_PRC
    (
        P_ATTACH_ENTITY VARCHAR2,
        P_CONC_REQ_ID   NUMBER,
        P_DOC_NUM       VARCHAR2
    );

END XX_IRIS_GST_UTILS_PKG;