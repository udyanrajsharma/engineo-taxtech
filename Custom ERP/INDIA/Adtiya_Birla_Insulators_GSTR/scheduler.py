from application.cleartax_GSTR import cleartax_GSTR
import schedule
import time
class scheduler:
    
    if __name__ == "__main__":
        cleartax_GSTR.fileGSTR1()
        cleartax_GSTR.fileGSTR2()


    

    # def daily_job():
    #     # Place your script code here
    #     cleartax_GSTR.fileGSTR1()
    #     cleartax_GSTR.fileGSTR2()

    # # Schedule the job to run every day at midnight
    # schedule.every().day.at("00:00").do(daily_job)

    # while True:
    #     schedule.run_pending()
    #     time.sleep(60)  # Check every minute
