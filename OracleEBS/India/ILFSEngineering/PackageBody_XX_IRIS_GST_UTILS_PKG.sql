create or replace PACKAGE BODY XX_IRIS_GST_UTILS_PKG
IS
    g_user_name     VARCHAR2(50);
    g_request_id    number;
	g_message 		VARCHAR2(4000):= NULL;

    PROCEDURE IRIS_GSTR1_API_PRC
    ( 
        l_errbuf varchar2,l_retcode number,P_FROM_DATE varchar2,P_TO_DATE varchar2
    ) IS
        V_generated Number;
		V_not_generated Number;
        req utl_http.req;
        res utl_http.resp;
        url varchar2(4000) := 'http://172.16.16.5:5500/ilfs/gstr1/';
        name varchar2(4000);
        buffer varchar2(4000); 
        content varchar2(4000) := '{
                    "From_date": "'
                            || P_FROM_DATE
                            || '",
                    "To_Date": "'
                            || P_TO_DATE
                            || '",';

BEGIN

        SELECT fu.USER_NAME
        INTO g_user_name
        FROM FND_USER fu
        WHERE fu.USER_ID = FND_GLOBAL.USER_ID;
        g_request_id := fnd_global.conc_request_id;
        content := content|| 
                    '"Created_By": "'
                            || g_user_name
                            || '",
                    "Request_Id": "'
                            || g_request_id
                            || '"
                    }';

        req := utl_http.begin_request(url, 'POST',' HTTP/1.1');
        utl_http.set_header(req, 'user-agent', 'mozilla/4.0'); 
        utl_http.set_header(req, 'content-type', 'application/json'); 
        utl_http.set_header(req, 'Content-Length', length(content));
        utl_http.set_transfer_timeout (600);

        utl_http.write_text(req, content);

        res := utl_http.get_response(req);

            begin
            loop
            utl_http.read_line(res, buffer);
            dbms_output.put_line(buffer);

            end loop;
            utl_http.end_response(res);
            exception
            when utl_http.end_of_body then
            utl_http.end_response(res);
            end;


    END IRIS_GSTR1_API_PRC;



    PROCEDURE IRIS_GSTR2_API_PRC
    ( 
        l_errbuf varchar2,l_retcode number,P_FROM_DATE varchar2,P_TO_DATE varchar2
    ) IS
        V_generated Number;
		V_not_generated Number;
        req utl_http.req;
        res utl_http.resp;
        url varchar2(4000) := 'http://172.16.16.5:5500/ilfs/gstr2/';
        name varchar2(4000);
        buffer varchar2(4000); 
        content varchar2(4000) := '{
                    "From_date": "'
                            || P_FROM_DATE
                            || '",
                    "To_Date": "'
                            || P_TO_DATE
                            || '",';

BEGIN
        SELECT fu.USER_NAME
        INTO g_user_name
        FROM FND_USER fu
        WHERE fu.USER_ID = FND_GLOBAL.USER_ID;
        g_request_id := fnd_global.conc_request_id;
        content := content|| 
                    '"Created_By": "'
                            || g_user_name
                            || '",
                    "Request_Id": "'
                            || g_request_id
                            || '"
                    }';

        req := utl_http.begin_request(url, 'POST',' HTTP/1.1');
        utl_http.set_header(req, 'user-agent', 'mozilla/4.0'); 
        utl_http.set_header(req, 'content-type', 'application/json'); 
        utl_http.set_header(req, 'Content-Length', length(content));

        utl_http.write_text(req, content);

        res := utl_http.get_response(req);

            begin
            loop
            utl_http.read_line(res, buffer);
            dbms_output.put_line(buffer);

            end loop;
            utl_http.end_response(res);
            exception
            when utl_http.end_of_body then
            utl_http.end_response(res);
            end;     

    END IRIS_GSTR2_API_PRC;


	PROCEDURE IRIS_EINV_API_PRC
    ( 
        l_errbuf varchar2,l_retcode number,P_FROM_DATE varchar2,P_TO_DATE varchar2, P_TRX_NUMBER varchar2
    ) IS
        V_generated Number;
		V_not_generated Number;
        req utl_http.req;
        res utl_http.resp;
        url varchar2(4000) := 'http://172.16.16.5:5500/ilfs/einvoice/';
        name varchar2(4000);
        buffer varchar2(4000); 
        content varchar2(4000) := '{
                    "From_date": "'
                            || P_FROM_DATE
                            || '",
					"P_TRX_NUMBER": "'
                            || P_TRX_NUMBER
                            || '",
                    "To_Date": "'
                            || P_TO_DATE
                            || '",';

BEGIN

        SELECT fu.USER_NAME
        INTO g_user_name
        FROM FND_USER fu
        WHERE fu.USER_ID = FND_GLOBAL.USER_ID;
        g_request_id := fnd_global.conc_request_id;
        content := content|| 
                    '"Created_By": "'
                            || g_user_name
                            || '",
                    "Request_Id": "'
                            || g_request_id
                            || '"
                    }';

        req := utl_http.begin_request(url, 'POST',' HTTP/1.1');
        utl_http.set_header(req, 'user-agent', 'mozilla/4.0'); 
        utl_http.set_header(req, 'content-type', 'application/json'); 
        utl_http.set_header(req, 'Content-Length', length(content));
        utl_http.set_transfer_timeout (600);

        utl_http.write_text(req, content);

        res := utl_http.get_response(req);

            begin
            loop
            utl_http.read_line(res, buffer);
            dbms_output.put_line(buffer);

            end loop;
            utl_http.end_response(res);
            exception
            when utl_http.end_of_body then
            utl_http.end_response(res);
            end;


    END IRIS_EINV_API_PRC;

	PROCEDURE IRIS_EWB_WithoutIRN_API_PRC
    ( 
        l_errbuf varchar2,l_retcode number, P_DOC_NUMBER varchar2
    ) IS
        V_generated Number;
		V_not_generated Number;
        req utl_http.req;
        res utl_http.resp;
        url varchar2(4000) := 'http://172.16.16.5:5500/ilfs/ewb/nonirn/';
        name varchar2(4000);
        buffer varchar2(4000); 
        content varchar2(4000) := '{
                    "P_DOC_NUMBER": "'
                            || P_DOC_NUMBER
                            || '",';

BEGIN

        SELECT fu.USER_NAME
        INTO g_user_name
        FROM FND_USER fu
        WHERE fu.USER_ID = FND_GLOBAL.USER_ID;
        g_request_id := fnd_global.conc_request_id;
        content := content|| 
                    '"Created_By": "'
                            || g_user_name
                            || '",
                    "Request_Id": "'
                            || g_request_id
                            || '"
                    }';

        req := utl_http.begin_request(url, 'POST',' HTTP/1.1');
        utl_http.set_header(req, 'user-agent', 'mozilla/4.0'); 
        utl_http.set_header(req, 'content-type', 'application/json'); 
        utl_http.set_header(req, 'Content-Length', length(content));
        utl_http.set_transfer_timeout (600);

        utl_http.write_text(req, content);

        res := utl_http.get_response(req);

            begin
            loop
            utl_http.read_line(res, buffer);
            dbms_output.put_line(buffer);

            end loop;
            utl_http.end_response(res);
            exception
            when utl_http.end_of_body then
            utl_http.end_response(res);
            end;


    END IRIS_EWB_WithoutIRN_API_PRC;

PROCEDURE ILFS_FND_ATTACHMENT_PRC
(
    P_ATTACH_ENTITY VARCHAR2,
    P_CONC_REQ_ID   NUMBER,
    P_DOC_NUM       VARCHAR2
)
AS

    V_CONC_REQ_ID NUMBER;
    V_DOC_NUM VARCHAR2(1000);
    V_ATTACH_ENTITY VARCHAR2(1000);
    L_FND_USER_ID NUMBER(15);
    L_ROWID VARCHAR2(200);
    L_ATTACHED_DOCUMENT_ID NUMBER;
    L_DOCUMENT_ID NUMBER;
    L_CREATION_DATE DATE;
    L_CREATED_BY NUMBER;
    L_LAST_UPDATE_DATE DATE;
    L_LAST_UPDATED_BY NUMBER;
    L_LAST_UPDATE_LOGIN NUMBER;
    L_SEQ_NUM NUMBER;
    L_ENTITY_NAME VARCHAR2(200);
    L_COLUMN1 VARCHAR2(200);
    L_PK1_VALUE VARCHAR2(200);
    L_PK2_VALUE VARCHAR2(200);
    L_PK3_VALUE VARCHAR2(200);
    L_PK4_VALUE VARCHAR2(200);
    L_PK5_VALUE VARCHAR2(200);
    L_AUTOMATICALLY_ADDED_FLAG VARCHAR2(200);
    L_REQUEST_ID NUMBER;
    L_PROGRAM_APPLICATION_ID NUMBER;
    L_PROGRAM_ID NUMBER;
    L_PROGRAM_UPDATE_DATE DATE;
    L_ATTRIBUTE_CATEGORY VARCHAR2(200);
    L_ATTRIBUTE1 VARCHAR2(200);
    L_ATTRIBUTE2 VARCHAR2(200);
    L_ATTRIBUTE3 VARCHAR2(200);
    L_ATTRIBUTE4 VARCHAR2(200);
    L_ATTRIBUTE5 VARCHAR2(200);
    L_ATTRIBUTE6 VARCHAR2(200);
    L_ATTRIBUTE7 VARCHAR2(200);
    L_ATTRIBUTE8 VARCHAR2(200);
    L_ATTRIBUTE9 VARCHAR2(200);
    L_ATTRIBUTE10 VARCHAR2(200);
    L_ATTRIBUTE11 VARCHAR2(200);
    L_ATTRIBUTE12 VARCHAR2(200);
    L_ATTRIBUTE13 VARCHAR2(200);
    L_ATTRIBUTE14 VARCHAR2(200);
    L_ATTRIBUTE15 VARCHAR2(200);
    L_DATATYPE_ID NUMBER;
    L_CATEGORY_ID NUMBER;
    L_SECURITY_TYPE NUMBER;
    L_SECURITY_ID NUMBER;
    L_PUBLISH_FLAG VARCHAR2(200);
    L_IMAGE_TYPE VARCHAR2(200);
    L_STORAGE_TYPE NUMBER;
    L_USAGE_TYPE VARCHAR2(200);
    L_LANGUAGE VARCHAR2(200);
    L_DESCRIPTION VARCHAR2(200);
    L_FILE_NAME VARCHAR2(200);
    L_MEDIA_ID NUMBER;
    L_DOC_ATTRIBUTE_CATEGORY VARCHAR2(200);
    L_DOC_ATTRIBUTE1 VARCHAR2(200);
    L_DOC_ATTRIBUTE2 VARCHAR2(200);
    L_DOC_ATTRIBUTE3 VARCHAR2(200);
    L_DOC_ATTRIBUTE4 VARCHAR2(200);
    L_DOC_ATTRIBUTE5 VARCHAR2(200);
    L_DOC_ATTRIBUTE6 VARCHAR2(200);
    L_DOC_ATTRIBUTE7 VARCHAR2(200);
    L_DOC_ATTRIBUTE8 VARCHAR2(200);
    L_DOC_ATTRIBUTE9 VARCHAR2(200);
    L_DOC_ATTRIBUTE10 VARCHAR2(200);
    L_DOC_ATTRIBUTE11 VARCHAR2(200);
    L_DOC_ATTRIBUTE12 VARCHAR2(200);
    L_DOC_ATTRIBUTE13 VARCHAR2(200);
    L_DOC_ATTRIBUTE14 VARCHAR2(200);
    L_DOC_ATTRIBUTE15 VARCHAR2(200);
    L_CREATE_DOC VARCHAR2(200);
    L_URL VARCHAR2(200);
    L_TITLE VARCHAR2(200);
    L_DM_NODE NUMBER;
    L_DM_FOLDER_PATH VARCHAR2(200);
    L_DM_TYPE VARCHAR2(200);
    L_DM_DOCUMENT_ID NUMBER;
    L_DM_VERSION_NUMBER VARCHAR2(200);
    L_ORIG_DOC_ID NUMBER;
    L_ORIG_ATTACH_DOC_ID NUMBER;
    V_ROWID ROWID;
    L_BLOB  BLOB;
    L_FILS BFILE;    
    L_BLOB_LENGTH INTEGER;

BEGIN
    V_CONC_REQ_ID := P_CONC_REQ_ID;
    V_DOC_NUM := P_DOC_NUM;
    V_ATTACH_ENTITY := P_ATTACH_ENTITY;
    L_FND_USER_ID := -1;
    L_ROWID := L_ROWID;
    L_ATTACHED_DOCUMENT_ID := NULL;
    L_DOCUMENT_ID := NULL;
    L_CREATION_DATE := SYSDATE;
    L_CREATED_BY := L_FND_USER_ID;
    L_LAST_UPDATE_DATE := SYSDATE;
    L_LAST_UPDATED_BY := L_FND_USER_ID;
    L_LAST_UPDATE_LOGIN := NULL;
    L_SEQ_NUM := NULL;
    L_ENTITY_NAME := V_ATTACH_ENTITY;-- 'RA_CUSTOMER_TRX';
    L_COLUMN1 := NULL;
    L_PK1_VALUE := NULL;
    L_AUTOMATICALLY_ADDED_FLAG := 'N';
    L_REQUEST_ID := NULL;
    L_PROGRAM_APPLICATION_ID := NULL;
    L_PROGRAM_ID := NULL;
    L_PROGRAM_UPDATE_DATE := NULL;
    L_ATTRIBUTE_CATEGORY := NULL;
    L_ATTRIBUTE1 := NULL;
    L_ATTRIBUTE2 := NULL;
    L_ATTRIBUTE3 := NULL;
    L_ATTRIBUTE4 := NULL;
    L_ATTRIBUTE5 := NULL;
    L_ATTRIBUTE6 := NULL;
    L_ATTRIBUTE7 := NULL;
    L_ATTRIBUTE8 := NULL;
    L_ATTRIBUTE9 := NULL;
    L_ATTRIBUTE10 := NULL;
    L_ATTRIBUTE11 := NULL;
    L_ATTRIBUTE12 := NULL;
    L_ATTRIBUTE13 := NULL;
    L_ATTRIBUTE14 := NULL;
    L_ATTRIBUTE15 := NULL;
    L_DATATYPE_ID := NULL;
    L_CATEGORY_ID := NULL;
    L_SECURITY_TYPE := 4;
    L_SECURITY_ID := NULL;
    L_PUBLISH_FLAG := 'Y';
    L_IMAGE_TYPE := NULL;
    L_STORAGE_TYPE := NULL;
    L_USAGE_TYPE := NULL;
    L_LANGUAGE := 'US';
    L_DESCRIPTION := NULL;
    L_FILE_NAME := NULL;
    L_MEDIA_ID := NULL;
    L_DOC_ATTRIBUTE_CATEGORY := NULL;
    L_DOC_ATTRIBUTE1 := NULL;
    L_DOC_ATTRIBUTE2 := NULL;
    L_DOC_ATTRIBUTE3 := NULL;
    L_DOC_ATTRIBUTE4 := NULL;
    L_DOC_ATTRIBUTE5 := NULL;
    L_DOC_ATTRIBUTE6 := NULL;
    L_DOC_ATTRIBUTE7 := NULL;
    L_DOC_ATTRIBUTE8 := NULL;
    L_DOC_ATTRIBUTE9 := NULL;
    L_DOC_ATTRIBUTE10 := NULL;
    L_DOC_ATTRIBUTE11 := NULL;
    L_DOC_ATTRIBUTE12 := NULL;
    L_DOC_ATTRIBUTE13 := NULL;
    L_DOC_ATTRIBUTE14 := NULL;
    L_DOC_ATTRIBUTE15 := NULL;
    L_CREATE_DOC := NULL;
    L_URL := NULL;
    L_TITLE := NULL;
    L_DM_NODE := NULL;
    L_DM_FOLDER_PATH := NULL;
    L_DM_TYPE := NULL;
    L_DM_DOCUMENT_ID := NULL;
    L_DM_VERSION_NUMBER := NULL;
    L_ORIG_DOC_ID := NULL;
    L_ORIG_ATTACH_DOC_ID := NULL;

    BEGIN
        SELECT 
            rcta.CUSTOMER_TRX_ID,
            'E-invoice - '||rcta.TRX_NUMBER||rcta.TRX_DATE||'.pdf',
            einv_log.REQUEST_ID,
            einv_log.INVOICE_PDF
        INTO
            L_PK1_VALUE,
            L_FILE_NAME,
            L_REQUEST_ID,
            L_BLOB
        FROM
            XX_IRIS_EINV_LOG_T einv_log,
            RA_CUSTOMER_TRX_ALL rcta
        WHERE 1=1
            AND einv_log.TRX_NUMBER = rcta.TRX_NUMBER
            AND einv_log.REQUEST_ID = V_CONC_REQ_ID
            AND einv_log.TRX_NUMBER = V_DOC_NUM
            AND ROWNUM = 1;
    EXCEPTION WHEN OTHERS THEN
        FND_FILE.PUT_LINE(FND_FILE.LOG,'Error while extracting invoice file from E-invoice response table.');
    END;

    BEGIN
        SELECT 
            FND_DOCUMENTS_S.NEXTVAL
        INTO 
            L_DOCUMENT_ID
        FROM 
            DUAL;
    EXCEPTION WHEN OTHERS THEN
        FND_FILE.PUT_LINE(FND_FILE.LOG,'Error while getting next value for FND_DOCUMENTS_S.');
    END;

    BEGIN
        SELECT 
            FND_ATTACHED_DOCUMENTS_S.NEXTVAL
        INTO 
            L_ATTACHED_DOCUMENT_ID
        FROM 
            DUAL;
    EXCEPTION WHEN OTHERS THEN
        FND_FILE.PUT_LINE(FND_FILE.LOG,'Error while getting next value for FND_ATTACHED_DOCUMENTS_S.');
    END;

    BEGIN
        SELECT 
            NVL(MAX(SEQ_NUM),0) + 10
        INTO 
            L_SEQ_NUM    
        FROM 
            FND_ATTACHED_DOCUMENTS
        WHERE 
            ENTITY_NAME = L_ENTITY_NAME;
    EXCEPTION WHEN OTHERS THEN
        FND_FILE.PUT_LINE(FND_FILE.LOG,'Error while getting the sequence for FND_ATTACHED_DOCUMENTS.');
    END;

    BEGIN
        SELECT 
            DATATYPE_ID
        INTO 
            L_DATATYPE_ID
        FROM 
            FND_DOCUMENT_DATATYPES
        WHERE NAME = 'FILE';
    EXCEPTION WHEN OTHERS THEN
        FND_FILE.PUT_LINE(FND_FILE.LOG,'Error while getting the Datatype ID for FILE.');
    END;

    BEGIN
        SELECT CATEGORY_ID
        INTO L_CATEGORY_ID    
        FROM FND_DOCUMENT_CATEGORIES_VL
        WHERE USER_NAME = 'Miscellaneous';
    EXCEPTION WHEN OTHERS THEN
        FND_FILE.PUT_LINE(FND_FILE.LOG,'Error while getting the Category ID.');
    END;

    BEGIN
        SELECT MAX (FILE_ID) + 1
        INTO L_MEDIA_ID    
        FROM FND_LOBS;
    EXCEPTION WHEN OTHERS THEN
        FND_FILE.PUT_LINE(FND_FILE.LOG,'Error while getting the Media ID from FND_LOBS.');
    END;

    L_BLOB_LENGTH := DBMS_LOB.getlength(L_BLOB);

--    DBMS_OUTPUT.PUT_LINE('Blob Length - '||L_BLOB_LENGTH);

    BEGIN
        INSERT INTO FND_LOBS (
            FILE_ID,
            FILE_NAME,
            FILE_CONTENT_TYPE,
            UPLOAD_DATE,
            EXPIRATION_DATE,
            PROGRAM_NAME,
            PROGRAM_TAG,
            FILE_DATA,
            LANGUAGE,
            ORACLE_CHARSET,
            FILE_FORMAT
    ) VALUES (
        L_MEDIA_ID,
        L_FILE_NAME, /*'text/plain',*/
        'application/pdf',--'application/pdf',--
        SYSDATE,
        NULL,
        'FNDATTCH',
        NULL,
        L_BLOB,
        'US', /*'UTF8'*//* 'AR8MSWIN1256' */
        'AR8ISO8859P6',
        'binary' /*'text'*/
    );
    EXCEPTION WHEN OTHERS THEN
        FND_FILE.PUT_LINE(FND_FILE.LOG,'Insert File into FND_LOBS table failed');
    END;

    BEGIN
        FND_DOCUMENTS_PKG.INSERT_ROW
        (   
            X_ROWID => L_ROWID,
            X_DOCUMENT_ID => L_DOCUMENT_ID,
            X_CREATION_DATE => SYSDATE,
            X_CREATED_BY => L_FND_USER_ID,-- fnd_profile.value('USER_ID')
            X_LAST_UPDATE_DATE => SYSDATE,
            X_LAST_UPDATED_BY => L_FND_USER_ID,-- fnd_profile.value('USER_ID')
            X_LAST_UPDATE_LOGIN => -1,
            X_DATATYPE_ID => L_DATATYPE_ID, -- FILE
            X_SECURITY_ID => NULL,--<security ID defined in your Attchments, Usaully SOB ID/ORG_ID..>,
            X_PUBLISH_FLAG => 'Y', --This flag allow the file to share across multiple organization
            X_CATEGORY_ID => L_CATEGORY_ID,
            X_SECURITY_TYPE => 4,
            X_USAGE_TYPE => 'O',
            X_LANGUAGE => 'US',
            X_DESCRIPTION => L_FILE_NAME,
            X_FILE_NAME => L_FILE_NAME,
            X_MEDIA_ID => L_MEDIA_ID
        );
    EXCEPTION WHEN OTHERS THEN
        FND_FILE.PUT_LINE(FND_FILE.LOG,'Insert into FND_DOCUMENTS table failed');
    END;

    BEGIN
        FND_DOCUMENTS_PKG.INSERT_TL_ROW
        (
            X_DOCUMENT_ID => L_DOCUMENT_ID,
            X_CREATION_DATE => SYSDATE,
            X_CREATED_BY => L_FND_USER_ID, --fnd_profile.VALUE('USER_ID'),
            X_LAST_UPDATE_DATE => SYSDATE,
            X_LAST_UPDATED_BY => L_FND_USER_ID, --fnd_profile.VALUE('USER_ID'),
            X_LAST_UPDATE_LOGIN => -1,
            X_LANGUAGE => 'US',
            X_DESCRIPTION => L_FILE_NAME --l_description
        );
    EXCEPTION WHEN OTHERS THEN
        FND_FILE.PUT_LINE(FND_FILE.LOG,'Insert into FND_DOCUMENTS_TL table failed');
        DBMS_OUTPUT.PUT_LINE('Insert into FND_DOCUMENTS_TL table failed');
    END;

    BEGIN
        FND_ATTACHED_DOCUMENTS_PKG.INSERT_ROW (  
            X_ROWID => L_ROWID,
            X_ATTACHED_DOCUMENT_ID => L_ATTACHED_DOCUMENT_ID,
            X_DOCUMENT_ID => L_DOCUMENT_ID,
            X_CREATION_DATE => L_CREATION_DATE,
            X_CREATED_BY => L_CREATED_BY,
            X_LAST_UPDATE_DATE => L_LAST_UPDATE_DATE,
            X_LAST_UPDATED_BY => L_LAST_UPDATED_BY,
            X_LAST_UPDATE_LOGIN => L_LAST_UPDATE_LOGIN,
            X_SEQ_NUM => L_SEQ_NUM,
            X_ENTITY_NAME => L_ENTITY_NAME,
            X_COLUMN1 => L_COLUMN1,
            X_PK1_VALUE => L_PK1_VALUE,
            X_PK2_VALUE => L_PK2_VALUE,
            X_PK3_VALUE => L_PK3_VALUE,
            X_PK4_VALUE => L_PK4_VALUE,
            X_PK5_VALUE => L_PK5_VALUE,
            X_AUTOMATICALLY_ADDED_FLAG => L_AUTOMATICALLY_ADDED_FLAG,
            X_REQUEST_ID => L_REQUEST_ID,
            X_PROGRAM_APPLICATION_ID => L_PROGRAM_APPLICATION_ID,
            X_PROGRAM_ID => L_PROGRAM_ID,
            X_PROGRAM_UPDATE_DATE => L_PROGRAM_UPDATE_DATE,
            X_ATTRIBUTE_CATEGORY => L_ATTRIBUTE_CATEGORY,
            X_ATTRIBUTE1 => L_ATTRIBUTE1,
            X_ATTRIBUTE2 => L_ATTRIBUTE2,
            X_ATTRIBUTE3 => L_ATTRIBUTE3,
            X_ATTRIBUTE4 => L_ATTRIBUTE4,
            X_ATTRIBUTE5 => L_ATTRIBUTE5,
            X_ATTRIBUTE6 => L_ATTRIBUTE6,
            X_ATTRIBUTE7 => L_ATTRIBUTE7,
            X_ATTRIBUTE8 => L_ATTRIBUTE8,
            X_ATTRIBUTE9 => L_ATTRIBUTE9,
            X_ATTRIBUTE10 => L_ATTRIBUTE10,
            X_ATTRIBUTE11 => L_ATTRIBUTE11,
            X_ATTRIBUTE12 => L_ATTRIBUTE12,
            X_ATTRIBUTE13 => L_ATTRIBUTE13,
            X_ATTRIBUTE14 => L_ATTRIBUTE14,
            X_ATTRIBUTE15 => L_ATTRIBUTE15,
            X_DATATYPE_ID => L_DATATYPE_ID,
            X_CATEGORY_ID => L_CATEGORY_ID,
            X_SECURITY_TYPE => L_SECURITY_TYPE,
            X_SECURITY_ID => L_SECURITY_ID,
            X_PUBLISH_FLAG => L_PUBLISH_FLAG,
            X_IMAGE_TYPE => L_IMAGE_TYPE,
            X_STORAGE_TYPE => L_STORAGE_TYPE,
            X_USAGE_TYPE => L_USAGE_TYPE,
            X_LANGUAGE => L_LANGUAGE,
            X_DESCRIPTION => L_DESCRIPTION,
            X_FILE_NAME => L_FILE_NAME,
            X_MEDIA_ID => L_MEDIA_ID,
            X_DOC_ATTRIBUTE_CATEGORY => L_DOC_ATTRIBUTE_CATEGORY,
            X_DOC_ATTRIBUTE1 => L_DOC_ATTRIBUTE1,
            X_DOC_ATTRIBUTE2 => L_DOC_ATTRIBUTE2,
            X_DOC_ATTRIBUTE3 => L_DOC_ATTRIBUTE3,
            X_DOC_ATTRIBUTE4 => L_DOC_ATTRIBUTE4,
            X_DOC_ATTRIBUTE5 => L_DOC_ATTRIBUTE5,
            X_DOC_ATTRIBUTE6 => L_DOC_ATTRIBUTE6,
            X_DOC_ATTRIBUTE7 => L_DOC_ATTRIBUTE7,
            X_DOC_ATTRIBUTE8 => L_DOC_ATTRIBUTE8,
            X_DOC_ATTRIBUTE9 => L_DOC_ATTRIBUTE9,
            X_DOC_ATTRIBUTE10 => L_DOC_ATTRIBUTE10,
            X_DOC_ATTRIBUTE11 => L_DOC_ATTRIBUTE11,
            X_DOC_ATTRIBUTE12 => L_DOC_ATTRIBUTE12,
            X_DOC_ATTRIBUTE13 => L_DOC_ATTRIBUTE13,
            X_DOC_ATTRIBUTE14 => L_DOC_ATTRIBUTE14,
            X_DOC_ATTRIBUTE15 => L_DOC_ATTRIBUTE15,
            X_CREATE_DOC => L_CREATE_DOC,
            X_URL => L_URL,
            X_TITLE => L_TITLE,
            X_DM_NODE => L_DM_NODE,
            X_DM_FOLDER_PATH => L_DM_FOLDER_PATH,
            X_DM_TYPE => L_DM_TYPE,
            X_DM_DOCUMENT_ID => L_DM_DOCUMENT_ID,
            X_DM_VERSION_NUMBER => L_DM_VERSION_NUMBER,
            X_ORIG_DOC_ID => L_ORIG_DOC_ID,
            X_ORIG_ATTACH_DOC_ID => L_ORIG_ATTACH_DOC_ID
        );  
    EXCEPTION WHEN OTHERS THEN
        FND_FILE.PUT_LINE(FND_FILE.LOG,'Insert into FND_ATTACHED_DOCUMENTS table failed');
    END;

END ILFS_FND_ATTACHMENT_PRC;

END XX_IRIS_GST_UTILS_PKG;