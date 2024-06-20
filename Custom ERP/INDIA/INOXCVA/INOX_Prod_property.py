import configparser
import base64
import os

# Function to encode sensitive values
def encode_value(value):
    encoded_bytes = base64.b64encode(value.encode('utf-8'))
    encoded_str = encoded_bytes.decode('utf-8')
    return encoded_str

config = configparser.ConfigParser()

# Encode sensitive values before writing to the .ini file
config['API_DETAILS'] = {
    'clearTaxProdINOXEwbAuthToken': encode_value("1.75dd9ff4-95fc-4bc6-a3fb-79e78cde2ded_55d7e811d690607c3855cc458902749049e64d9a3adeeaed8de9cb6aa42f238b"),
    'generateEwbApiUrl': encode_value("https://app.clear.in/einv/v3/ewaybill/generate"),
    'cancelEwbApiUrl': encode_value("https://api.clear.in/einv/v2/eInvoice/ewaybill/cancel"),
    'updateEwbApiUrl': encode_value("https://api.clear.in/einv/v1/ewaybill/update?action=PARTB")
}


config['DB_CONNECTION'] = {
    'DB_NAME': encode_value("INOX"),
    'DB_USER': encode_value("IILEINV"),
    'DB_PASSWORD': encode_value("Ev@#$321"),
    'DB_SERVER': encode_value("10.10.0.18")
}
# 10.10.0.18

# [SCHEDULER_TIME]
# generate_ewb = 2
# cancel_ewb = 2
# update_ewb = 2

extDataDir = os.getcwd()
config_path = extDataDir+'/CLEARTAX-INOX_EWB_NONIRN_PROPERTIES_PROD_SERVER.ini'

# Write the configuration to a file
with open(config_path, 'w') as configfile:
    config.write(configfile)
