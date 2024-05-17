from multiprocessing import Process
import os
import sys
import traceback
import schedule
import win32serviceutil
import win32service
import win32event
import servicemanager

from application.ClearTaxEWBwithoutIRN import ClearTaxEWBwithoutIRN
import time
import logging
import logging.handlers
from logging.handlers import TimedRotatingFileHandler
from datetime import datetime

import os
import configparser
import base64
import sys

def decode_value(encoded_str):
    decoded_bytes = base64.b64decode(encoded_str.encode('utf-8'))
    decoded_str = decoded_bytes.decode('utf-8')
    return decoded_str

def setup_logger(name, log_file, level=logging.INFO):
    logger = logging.getLogger(name)
    logger.setLevel(level)
    
    handler = TimedRotatingFileHandler(log_file, when='midnight', interval=1)
    handler.suffix = "%d%m%Y" 
    handler.setLevel(level)
    
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    handler.setFormatter(formatter)
    
    logger.addHandler(handler) 
    return logger

config = configparser.ConfigParser()
extDataDir = os.getcwd()
config_path = extDataDir+'/property2.ini'
config.read(config_path)

logFilePath = decode_value(config.get('WINDOWS_SERVICE', 'log_filepath'))
service_name = config.get('WINDOWS_SERVICE', 'servicename')

log_dir = "logs"
if not os.path.exists(log_dir):
    os.makedirs(log_dir)

current_date = datetime.now().strftime("%d%m%Y")

info_log_file = os.path.join(log_dir, f"info_{current_date}.log")
error_log_file = os.path.join(log_dir, f"error_{current_date}.log")

info_logger = setup_logger('info_logger', info_log_file, level=logging.INFO)
error_logger = setup_logger('error_logger', error_log_file, level=logging.ERROR)

# extDataDir = os.getcwd()
# if getattr(sys, "frozen", False):
#     extDataDir = sys._MEIPASS
# load_dotenv(dotenv_path=os.path.join(extDataDir, ".env"))

# logFilePath = os.getenv("log_filePath")
# service_name = os.getenv("serviceName")

# Sets log file path.
# log_file = logFilePath

# # Return a logger with the specified name.
# servicelogger = logging.getLogger("ClearTaxEWBServiceLogger")

# # Sets the threshold for this logger to lvl. Logging messages which are less severe than lvl will be ignored.
# servicelogger.setLevel(logging.DEBUG)

# handler = logging.handlers.RotatingFileHandler(
#     log_file, maxBytes=10485760, backupCount=10
# )

# # Sets format of record in log file
# formatter = logging.Formatter(
#     "%(asctime)s - %(module)-10s - %(levelname)-8s %(message)s", "%d-%m-%Y %H:%M:%S"
# )
# handler.setFormatter(formatter)

# # Adds the specified handler to logger "MyLogger"
# servicelogger.addHandler(handler)


class INOXWindowsServiceScheduler(win32serviceutil.ServiceFramework):
    _svc_name_ = service_name
    _svc_display_name_ = service_name

    def __init__(self, *args):
        super().__init__(*args)

    # stop command service
    def SvcStop(self):
        self.ReportServiceStatus(win32service.SERVICE_STOP_PENDING)
        self.process.terminate()
        self.ReportServiceStatus(win32service.SERVICE_STOPPED)

    # start command service
    def SvcDoRun(self):
        info_logger.info("*** STARTING SERVICE ***\n")
        try:  # try main
            self.main()
        except Exception as e:
            error_logger.error("An error occurred 1:", e, exc_info=True)
            servicemanager.LogErrorMsg(
                traceback.format_exc()
            )  # if error print it to event log
            os._exit(-1)

    # main process
    def main(self):
        try:
            info_logger.info("... STARTING SCHEDULE PROCESS ...\n")
            schedule.every(10).seconds.do(self.scheduler)

            schedule.every(1).minutes.do(ClearTaxEWBwithoutIRN.EWBwithoutIRN)
            # schedule.every(5).minutes.do(ClearTaxEWBwithoutIRN.updateEWB)
            # schedule.every(5).minutes.do(ClearTaxEWBwithoutIRN.cancelEWB)
            # run main loop for schedule process while service runs
            while True:
                # execute task on schedule
                schedule.run_pending()
                time.sleep(1)
        except Exception as e:
            error_logger.error("An error occurred 2:", e, exc_info=True)

    def scheduler(self):
        info_logger.info("... Scheduler active ...\n")


if __name__ == "__main__":
    if len(sys.argv) > 1:
        # Called by Windows shell. Handling arguments such as: Install, Remove, etc.
        win32serviceutil.HandleCommandLine(INOXWindowsServiceScheduler)
    else:
        # Called by Windows Service. Initialize the service to communicate with the system operator
        servicemanager.Initialize()
        servicemanager.PrepareToHostSingle(INOXWindowsServiceScheduler)
        servicemanager.StartServiceCtrlDispatcher()
