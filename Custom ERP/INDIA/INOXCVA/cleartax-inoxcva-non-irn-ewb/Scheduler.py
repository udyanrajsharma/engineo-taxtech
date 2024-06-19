import schedule
import time
from application.ClearTaxEWBwithoutIRN import ClearTaxEWBwithoutIRN

def scheuleTime():
    # schedule.every(2).minutes.do(ClearTaxEWBwithoutIRN.EWBwithoutIRN)
    # schedule.every(2).minutes.do(ClearTaxEWBwithoutIRN.updateEWB)
    # schedule.every(2).minutes.do(ClearTaxEWBwithoutIRN.cancelEWB)

    # schedule.every(15).seconds.do(ClearTaxEWBwithoutIRN.testTableModel)
    schedule.every(40).seconds.do(ClearTaxEWBwithoutIRN.EWBwithoutIRN)
    # schedule.every(20).seconds.do(ClearTaxEWBwithoutIRN.updateEWB)
    # schedule.every(20).seconds.do(ClearTaxEWBwithoutIRN.cancelEWB)
    print("\nScheduler Called")
try:
    scheuleTime()
except:
    print("Scheduler is not called")

while True:
    schedule.run_pending()
    time.sleep(1)