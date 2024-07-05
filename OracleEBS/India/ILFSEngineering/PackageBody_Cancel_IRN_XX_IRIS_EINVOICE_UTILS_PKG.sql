create or replace PACKAGE BODY XX_IRIS_EINVOICE_UTILS_PKG
IS
    g_user_name     VARCHAR2(50);
    g_request_id    number;
	g_message 		VARCHAR2(4000):= NULL;

	PROCEDURE IRIS_CANCEL_IRN_API_PRC
    ( 
        l_errbuf varchar2,l_retcode number,P_CANCEL_REASON varchar2, P_CANCEL_REMARK varchar2, P_INVOICE_ID varchar2
    ) IS
        V_generated Number;
		V_not_generated Number;
        req utl_http.req;
        res utl_http.resp;
        url varchar2(4000) := 'http://172.16.16.5:5500/ilfs/cancelirn/';
        name varchar2(4000);
        buffer varchar2(4000); 
        content varchar2(4000) := '{
                    "CANCEL_REASON": "'
                            || P_CANCEL_REASON
                            || '",
					"CANCEL_REMARK": "'
                            || P_CANCEL_REMARK
                            || '",
                    "INVOICE_ID": "'
                            || P_INVOICE_ID
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

    END IRIS_CANCEL_IRN_API_PRC;

END XX_IRIS_EINVOICE_UTILS_PKG;