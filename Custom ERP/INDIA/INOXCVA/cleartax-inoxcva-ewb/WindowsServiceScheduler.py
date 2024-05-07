import schedule
from application.ClearTaxEWBwithoutIRN import ClearTaxEWBwithoutIRN
import time
from pathlib import Path
from infrastructure.pythonWindowsService import PythonWindowsService


class PythonCornerExample(PythonWindowsService):
    _svc_name_ = "ClearTax-EWB-WithoutIRN"
    _svc_display_name_ = "ClearTax - EWB without IRN"
    _svc_description_ = "ClearTax - EWB without IRN"

    def start(self):
        self.isrunning = True

    def stop(self):
        self.isrunning = False

    def main(self):
        while self.isrunning:
            try:
                schedule.every(5).minutes.do(ClearTaxEWBwithoutIRN.EWBwithoutIRN)
                schedule.every(5).minutes.do(ClearTaxEWBwithoutIRN.updateEWB)
                schedule.every(5).minutes.do(ClearTaxEWBwithoutIRN.cancelEWB)
            except:
                print("Scheduler is not called")

            while True:
                schedule.run_pending()
                time.sleep(1)


if __name__ == "__main__":
    PythonCornerExample.parse_command_line()
