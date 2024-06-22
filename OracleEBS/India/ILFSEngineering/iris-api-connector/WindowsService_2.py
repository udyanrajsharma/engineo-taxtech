from multiprocessing import Process
import os
import sys
import traceback
import schedule
import win32serviceutil
import win32service
import win32event
import servicemanager
from datetime import datetime
from dotenv import load_dotenv
import os
from ILFS_Api import app
import time
import logging
import logging.handlers

extDataDir = os.getcwd()
if getattr(sys, "frozen", False):
    extDataDir = sys._MEIPASS
load_dotenv(dotenv_path=os.path.join(extDataDir, ".env"))

serviceName = os.getenv("service_name")
# Sets log file path.
current_dir = os.path.dirname(sys.executable)

log_dir = os.path.join(current_dir,"LOGS")
if not os.path.exists(log_dir):
    os.makedirs(log_dir)

log_file_info = os.path.join(log_dir,f"IRIS_ILFS_INTEGRATION_INFO.log")
log_file_error = os.path.join(log_dir, f"IRIS_ILFS_INTEGRATION_ERROR.log")

# Return a logger with the specified name.
servicelogger_info = logging.getLogger("IRISEWBServiceInfoLogger")
servicelogger_error = logging.getLogger("IRISEWBServiceErrorLogger")

# Sets the threshold for this logger to lvl. Logging messages which are less severe than lvl will be ignored.
level = logging.DEBUG
servicelogger_info.setLevel(logging.DEBUG)
servicelogger_error.setLevel(logging.DEBUG)

handler_info = logging.handlers.TimedRotatingFileHandler(
    log_file_info, when='midnight', interval=1, backupCount=10
)
handler_info.suffix = "%d%m%Y" 
handler_info.setLevel(level)

handler_error = logging.handlers.TimedRotatingFileHandler(
    log_file_error, when='midnight', interval=1, backupCount=10
)
handler_error.suffix = "%d%m%Y" 
handler_error.setLevel(level)

# Sets format of record in log file
formatter = logging.Formatter(
    "%(asctime)s - %(module)-10s - %(levelname)-8s %(message)s", "%d-%m-%Y %H:%M:%S"
)
handler_info.setFormatter(formatter)
handler_error.setFormatter(formatter)

# Adds the specified handler to logger 
servicelogger_info.addHandler(handler_info)
servicelogger_error.addHandler(handler_error)

class WindowsService(win32serviceutil.ServiceFramework):
    _svc_name_ = serviceName
    _svc_display_name_ = serviceName

    # NEW
    def __init__(self, args):
        win32serviceutil.ServiceFramework.__init__(self, args)
        self.hWaitStop = win32event.CreateEvent(None, 0, 0, None)
        self.is_alive = True

    # stop command service
    # NEW
    def SvcStop(self):
        self.ReportServiceStatus(win32service.SERVICE_STOP_PENDING)
        win32event.SetEvent(self.hWaitStop)
        self.is_alive = False

    # start command service  
    # NEW
    def SvcDoRun(self):
        servicelogger_info.info("*** STARTING SERVICE ***\n")
        servicemanager.LogMsg(servicemanager.EVENTLOG_INFORMATION_TYPE,
                              servicemanager.PYS_SERVICE_STARTED,
                              (self._svc_name_, ''))
        self.main()

    # main process
    def main(self):
        try:
            servicelogger_info.info("... STARTING PROCESS ...\n")
            from flask import Flask
            app.run(host="0.0.0.0", port=5500)
            while self.is_alive:
                time.sleep(2)
        except Exception as e:
            servicelogger_error.exception("Exception Occured in API call from Windows Service")

# NEW
if __name__ == '__main__':
    if len(os.sys.argv) == 1:
        servicemanager.Initialize()
        servicemanager.PrepareToHostSingle(WindowsService)
        servicemanager.StartServiceCtrlDispatcher()
    else:
        win32serviceutil.HandleCommandLine(WindowsService)
