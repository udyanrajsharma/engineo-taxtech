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
    'generateEwbAuthToken': encode_value("1.d73855b2-f45b-4965-b232-c22246866959_7802e81d991e684d3ab1ec496737230325f2d9e409c7f7101f4b8441c3fc4272"),
    'cancelEwbAuthToken': encode_value("1.d73855b2-f45b-4965-b232-c22246866959_7802e81d991e684d3ab1ec496737230325f2d9e409c7f7101f4b8441c3fc4272"),
    'updateEwbAuthToken': encode_value("1.d73855b2-f45b-4965-b232-c22246866959_7802e81d991e684d3ab1ec496737230325f2d9e409c7f7101f4b8441c3fc4272"),
    'generateEwbApiUrl': encode_value("https://api-sandbox.clear.in/einv/v3/ewaybill/generate"),
    'cancelEwbApiUrl': encode_value("https://api-sandbox.clear.in/einv/v2/eInvoice/ewaybill/cancel"),
    'updateEwbApiUrl': encode_value("https://api-sandbox.clear.in/einv/v1/ewaybill/update?action=PARTB")
}

config['DB_CONNECTION'] = {
    'DB_NAME': encode_value("INOX"),
    'DB_NAME_TEST': encode_value("INOX_Testing"),
    'DB_USER': encode_value("ENGINEOLAPTOP00\\animesha_engineosol"),
    'DB_PASSWORD': encode_value("Ani@8931094967"),
    'DB_SERVER': encode_value("ENGINEOLAPTOP00")
}

config['WINDOWS_SERVICE'] = {
    'log_filePath': encode_value("D:\\Animesh\\ProjectCode\\engineo-cleartax\\Custom ERP\\INDIA\\INOXCVA\\output.log"),
    'serviceName': encode_value("INOX ClearTax EWB Without IRN")
}

extDataDir = os.getcwd()
config_path = extDataDir+'/property2.ini'

# Write the configuration to a file
with open(config_path, 'w') as configfile:
    config.write(configfile)
