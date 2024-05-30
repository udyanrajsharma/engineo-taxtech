/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */

define(['N/ui/serverWidget', 'N/log'], 
    function(serverWidget, log) {

        function onRequest(context) {
            if (context.request.method === 'GET') {
                var form = serverWidget.createForm({
                    title: 'My Suitelet Form'
                });

                // Add fields to the form if needed

                // Add submit buttons to the form
                form.addButton({
                    id: 'submit_button_1',
                    label: 'Submit Button 1',
                    functionName: 'submitForm'
                });

                form.addButton({
                    id: 'submit_button_2',
                    label: 'Submit Button 2',
                    functionName: 'submitForm'
                });

                // Add client script to handle button clicks
                form.clientScriptModulePath = '../lib/cs_for_test_data.js';
				
				form.addField({
                    id: 'custpage_main_form',
                    type: serverWidget.FieldType.INLINEHTML,
                    label: 'Main Form'
                }).defaultValue = '<form id="main_form"></form>';

                context.response.writePage(form);
            } else {
                // Handle form submission
                var params = context.request.parameters;
                var submitButton = params.submitButton;

                if (submitButton === 'submit_button_1') {
                    // Logic for handling submit button 1
                    log.debug('Submit Button 1 clicked');
                } else if (submitButton === 'submit_button_2') {
                    // Logic for handling submit button 2
                    log.debug('Submit Button 2 clicked');
                }

                // Redirect or show success message
                context.response.write('Form submitted successfully');
            }
        }

        return {
            onRequest: onRequest
        };
    }
);
