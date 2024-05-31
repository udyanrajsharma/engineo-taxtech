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

# from dotenv import load_dotenv
# import os
# import sys

# extDataDir = os.getcwd()
# if getattr(sys, "frozen", False):
#     extDataDir = sys._MEIPASS
# load_dotenv(dotenv_path=os.path.join(extDataDir, ".env"))

# logFilePath = os.getenv("log_filePath")
# service_name = os.getenv("serviceName")

log_filePath = ".\output.log"
serviceName = "INOX ClearTax EWB Without IRN - 4"

# Sets log file path.
log_file = log_filePath

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
    _svc_name_ = serviceName
    _svc_display_name_ = serviceName

    # def __init__(self, *args):
    #     super().__init__(*args)

    def __init__(self,args):
        win32serviceutil.ServiceFramework.__init__(self, *args)
        self.log('Service Initialized.')
        self.stop_event = win32event.CreateEvent(None, 0, 0, None)

    def log(self, msg):
        servicemanager.LogInfoMsg(str(msg))

    # stop command service
    def SvcStop(self):
        self.ReportServiceStatus(win32service.SERVICE_STOP_PENDING)
        self.stop()
        self.log('Service has stopped.')
        win32event.SetEvent(self.stop_event)
        self.ReportServiceStatus(win32service.SERVICE_STOPPED)

    # start command service
    def SvcDoRun(self):
        import servicemanager
        self.ReportServiceStatus(win32service.SERVICE_START_PENDING)
        try:
            self.ReportServiceStatus(win32service.SERVICE_RUNNING)
            self.log('Service is starting.')
            self.main()
            win32event.WaitForSingleObject(self.stop_event, win32event.INFINITE)
            servicemanager.LogMsg(servicemanager.EVENTLOG_INFORMATION_TYPE,servicemanager.PYS_SERVICE_STARTED,(self._svc_name_, ''))
        except Exception as e:
            s = str(e);
            self.log('Exception :'+s)
            self.SvcStop()

    # main process
    def main(self):
        try:
            servicelogger.info("... STARTING SCHEDULE PROCESS ...\n")
            schedule.every(10).seconds.do(self.scheduler)

            schedule.every(5).minutes.do(ClearTaxEWBwithoutIRN.EWBwithoutIRN)
            # schedule.every(5).minutes.do(ClearTaxEWBwithoutIRN.updateEWB)
            # schedule.every(5).minutes.do(ClearTaxEWBwithoutIRN.cancelEWB)
            # run main loop for schedule process while service runs
            while True:
                # execute task on schedule
                schedule.run_pending()
                time.sleep(1)
        except Exception as e:
            print("An error occurred:", e)


    def scheduler(self):
        servicelogger.info("... Scheduler active ...\n")


if __name__ == "__main__":
    if len(sys.argv) != 1:
        # Called by Windows shell. Handling arguments such as: Install, Remove, etc.
        win32serviceutil.HandleCommandLine(WindowsServiceScheduler)
    else:
        # Called by Windows Service. Initialize the service to communicate with the system operator
        servicemanager.Initialize()
        servicemanager.PrepareToHostSingle(WindowsServiceScheduler)
        servicemanager.StartServiceCtrlDispatcher()
