import schedule
import time
from application.ClearTaxEWBwithoutIRN import ClearTaxEWBwithoutIRN

def scheuleTime():
    schedule.every(5).minutes.do(ClearTaxEWBwithoutIRN.EWBwithoutIRN)
    schedule.every(5).minutes.do(ClearTaxEWBwithoutIRN.updateEWB)
    schedule.every(5).minutes.do(ClearTaxEWBwithoutIRN.cancelEWB)
    print("\nScheduler Called")
try:
    scheuleTime()
except:
    print("Scheduler is not called")

while True:
    schedule.run_pending()
    time.sleep(1)