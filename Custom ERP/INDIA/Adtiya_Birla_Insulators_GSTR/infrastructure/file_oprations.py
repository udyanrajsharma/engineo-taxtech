 # file_operations.py

import os
import re
class file_operations:
    def get_filename_extension(file_path):
        try:
            filename_extension = os.path.basename(file_path)
            filename = os.path.splitext(filename_extension)[0]
            return filename_extension, filename
        except Exception as e:
            print("An error occurred while getting the file name:", e)
            return None, None

    def get_file_content_type(filename_extension):
        try:
            return filename_extension[filename_extension.index('.') + 1:].upper()
        except Exception as e:
            print("An error occurred while getting the file content type:", e)
            return None

    def determine_template_type(filename_extension):
        if re.search(r'sales', filename_extension, re.IGNORECASE):
            return 'sales'
        else:
            return 'purchase'
        


    # def chack_response_file_oprations():
    #     print("response_FILE_oprations")