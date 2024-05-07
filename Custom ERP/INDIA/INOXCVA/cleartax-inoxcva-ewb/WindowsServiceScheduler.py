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

# Sets log file path.
log_file = "d:\\output.log"

# Return a logger with the specified name.
servicelogger = logging.getLogger("ClearTaxEWBServiceLogger")

# Sets the threshold for this logger to lvl. Logging messages which are less severe than lvl will be ignored.
servicelogger.setLevel(logging.DEBUG)

handler = logging.handlers.RotatingFileHandler(
    log_file, maxBytes=10485760, backupCount=10
)

# Sets format of record in log file
formatter = logging.Formatter(
    "%(asctime)s - %(module)-10s - %(levelname)-8s %(message)s", "%d-%m-%Y %H:%M:%S"
)
handler.setFormatter(formatter)

# Adds the specified handler to logger "MyLogger"
servicelogger.addHandler(handler)


class WindowsServiceScheduler(win32serviceutil.ServiceFramework):
    _svc_name_ = "INOX ClearTax EWB Without IRN"
    _svc_display_name_ = "INOX ClearTax EWB Without IRN"

    def __init__(self, *args):
        super().__init__(*args)

    # stop command service
    def SvcStop(self):
        self.ReportServiceStatus(win32service.SERVICE_STOP_PENDING)
        self.process.terminate()
        self.ReportServiceStatus(win32service.SERVICE_STOPPED)

    # start command service
    def SvcDoRun(self):
        servicelogger.info("*** STARTING SERVICE ***\n")
        try:  # try main
            self.main()
        except:
            servicemanager.LogErrorMsg(
                traceback.format_exc()
            )  # if error print it to event log
            os._exit(-1)

    # main process
    def main(self):

        servicelogger.info("... STARTING SCHEDULE PROCESS ...\n")
        schedule.every(10).seconds.do(self.scheduler)

        schedule.every(5).minutes.do(ClearTaxEWBwithoutIRN.EWBwithoutIRN)
        schedule.every(5).minutes.do(ClearTaxEWBwithoutIRN.updateEWB)
        schedule.every(5).minutes.do(ClearTaxEWBwithoutIRN.cancelEWB)
        # run main loop for schedule process while service runs
        while True:
            # execute task on schedule
            schedule.run_pending()
            time.sleep(1)

    def scheduler(self):
        servicelogger.info("... Scheduler active ...\n")


if __name__ == "__main__":
    if len(sys.argv) > 1:
        # Called by Windows shell. Handling arguments such as: Install, Remove, etc.
        win32serviceutil.HandleCommandLine(WindowsServiceScheduler)
    else:
        # Called by Windows Service. Initialize the service to communicate with the system operator
        servicemanager.Initialize()
        servicemanager.PrepareToHostSingle(WindowsServiceScheduler)
        servicemanager.StartServiceCtrlDispatcher()
