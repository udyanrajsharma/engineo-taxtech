import sys 
if getattr(sys, 'frozen', False) and sys.platform == 'win32': 
    import certifi 
    import certifi_win32.wincerts 
    certifi_win32.wincerts.CERTIFI_PEM = certifi.where() 
    certifi.where = certifi_win32.wincerts.where 
    from certifi_win32.wincerts import generate_pem, verify_combined_pem 
    if not verify_combined_pem(): 
        generate_pem()

import os
import sys
import schedule
import win32serviceutil
import win32service
import win32event
import servicemanager
# from pathlib import Path

from application.ClearTaxEWBwithoutIRN import ClearTaxEWBwithoutIRN
import time
import logging
import logging.handlers

# current_date = datetime.now().strftime("%d%m%Y")
serviceName = "INOX-ClearTax E-Way Bill Without IRN"

current_dir = os.path.dirname(sys.executable)
# print("Current Directory : ",current_dir)

log_dir = os.path.join(current_dir,"LOGS")
if not os.path.exists(log_dir):
    os.makedirs(log_dir)


log_file_info = os.path.join(log_dir,f"CLEARTAX_EWB_NONIRN_INFO.log")
log_file_error = os.path.join(log_dir, f"CLEARTAX_EWB_NONIRN_ERROR.log")

# Return a logger with the specified name.
servicelogger_info = logging.getLogger("ClearTaxEWBServiceLogger")
servicelogger_error = logging.getLogger("ClearTaxEWBErrorLogger")

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

# Adds the specified handler to logger "MyLogger"
servicelogger_info.addHandler(handler_info)
servicelogger_error.addHandler(handler_error)

class WindowsServiceScheduler_2(win32serviceutil.ServiceFramework):
    _svc_name_ = "INOX-ClearTax E-Way Bill Without IRN"
    _svc_display_name_ = "INOX-ClearTax E-Way Bill Without IRN"

    def __init__(self, args):
        win32serviceutil.ServiceFramework.__init__(self, args)
        self.hWaitStop = win32event.CreateEvent(None, 0, 0, None)
        self.is_alive = True

    def SvcStop(self):
        self.ReportServiceStatus(win32service.SERVICE_STOP_PENDING)
        win32event.SetEvent(self.hWaitStop)
        self.is_alive = False

    def SvcDoRun(self):
        servicelogger_info.info("*** STARTING SERVICE ***\n")
        servicemanager.LogMsg(servicemanager.EVENTLOG_INFORMATION_TYPE,
                              servicemanager.PYS_SERVICE_STARTED,
                              (self._svc_name_, ''))
        self.main()

    def main(self):
        # Main service logic goes here
        servicelogger_info.info("... STARTING SCHEDULE PROCESS ...\n") 
        schedule.every(1).minutes.do(ClearTaxEWBwithoutIRN.EWBwithoutIRN)
        schedule.every(1).minutes.do(ClearTaxEWBwithoutIRN.updateEWB)
        schedule.every(1).minutes.do(ClearTaxEWBwithoutIRN.cancelEWB)
        while self.is_alive:
            # Perform your service tasks here
            schedule.run_pending()
            time.sleep(2)


if __name__ == '__main__':
    if len(os.sys.argv) == 1:
        servicemanager.Initialize()
        servicemanager.PrepareToHostSingle(WindowsServiceScheduler_2)
        servicemanager.StartServiceCtrlDispatcher()
    else:
        win32serviceutil.HandleCommandLine(WindowsServiceScheduler_2)


# https://www.base64decode.org/