import schedule
import time
from application.ClearTaxEWBwithoutIRN import ClearTaxEWBwithoutIRN
import os
import sys
import configparser

config = configparser.ConfigParser()
extDataDir = os.path.dirname(sys.executable)
config_path = os.path.join(extDataDir,'CLEARTAX_EWB_NONIRN_PROPERTIES.ini')
print("Database Config path: ", config_path)
config.read(config_path)

generateEwbTime = config.get('SCHEDULER_TIME', 'generate_ewb')
cancelEwbTime = config.get('SCHEDULER_TIME', 'cancel_ewb')
updateEwbTime = config.get('SCHEDULER_TIME', 'update_ewb')
generateEwbScheduleTime = int(generateEwbTime)
cancelEwbScheduleTime = int(cancelEwbTime)
updateEwbScheduleTime = int(updateEwbTime)

def scheuleTime():
    # schedule.every(2).minutes.do(ClearTaxEWBwithoutIRN.EWBwithoutIRN)
    # schedule.every(2).minutes.do(ClearTaxEWBwithoutIRN.updateEWB)
    # schedule.every(2).minutes.do(ClearTaxEWBwithoutIRN.cancelEWB)

    schedule.every(generateEwbScheduleTime).seconds.do(ClearTaxEWBwithoutIRN.testTableModel)
    # schedule.every(40).seconds.do(ClearTaxEWBwithoutIRN.EWBwithoutIRN)
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