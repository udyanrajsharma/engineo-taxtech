CREATE OR REPLACE
PACKAGE   XX_IRIS_GST_UTILS_PKG
AS	
	
    PROCEDURE IRIS_GSTR1_API_PRC
    ( 
        l_errbuf varchar2,l_retcode number,P_FROM_DATE varchar2,P_TO_DATE varchar2
    );
	
	PROCEDURE IRIS_GSTR2_API_PRC
    ( 
        l_errbuf varchar2,l_retcode number,P_FROM_DATE varchar2,P_TO_DATE varchar2
    );

END XX_IRIS_GST_UTILS_PKG;