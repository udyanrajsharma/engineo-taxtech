import schedule
import time
from application.ClearTaxEWBwithoutIRN import ClearTaxEWBwithoutIRN
import logging
import os
from logging.handlers import TimedRotatingFileHandler
from datetime import datetime

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

log_dir = "logs"
if not os.path.exists(log_dir):
    os.makedirs(log_dir)

current_date = datetime.now().strftime("%d%m%Y")

info_log_file = os.path.join(log_dir, f"info_{current_date}.log")
error_log_file = os.path.join(log_dir, f"error_{current_date}.log")

info_logger = setup_logger('info_logger', info_log_file, level=logging.INFO)
error_logger = setup_logger('error_logger', error_log_file, level=logging.ERROR)

def scheuleTime():
    info_logger.info("Starting the Scheduler")
    schedule.every(10).seconds.do(ClearTaxEWBwithoutIRN.EWBwithoutIRN)
    # schedule.every(5).minutes.do(ClearTaxEWBwithoutIRN.updateEWB)
    # schedule.every(5).minutes.do(ClearTaxEWBwithoutIRN.cancelEWB)
    print("\nScheduler Called")
    
try:
    scheuleTime()
except:
    print("Scheduler is not called")

while True:
    schedule.run_pending()
    time.sleep(1)