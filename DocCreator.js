//add file route
const TEMPLATE_FILE_ID = '1STYu-kNB8xhRNZilb7ZJ82mR3rZlVvxbWhxYI6t34yA';
const DESTINATION_FOLDER_ID = '1kkvhQ4uKRHlhs-F1gH9qwmLoyPyvlBCk';
const CURRENCY_SIGN = '$';


// Converts a float to a string value in the desired currency format
function toCurrency(num) {
    var fmt = Number(num).toFixed(2);
    return `${CURRENCY_SIGN}${fmt}`;
}

// Format datetimes to: YYYY-MM-DD
function toDateFmt(dt_string) {
  var millis = Date.parse(dt_string);
  var date = new Date(millis);
  var year = date.getFullYear();
  var month = ("0" + (date.getMonth() + 1)).slice(-2);
  var day = ("0" + date.getDate()).slice(-2);

  // Return the date in YYYY-mm-dd format
  return `${year}-${month}-${day}`;
}


// Parse and extract the data submitted through the form.
function parseFormData(values, header) {
    // Set temporary variables to hold prices and data.
    var subtotal = 0;
    var discount = 0;
    var total = 0;
    var response_data = {};

    // Iterate through all of our response data and add the keys (headers)
    // and values (data) to the response dictionary object.
    for (var i = 0; i < values.length; i++) {
      // Extract the key and value
      var key = header[i];
      var value = values[i];

      //Insert url´s as images
      /*
      if (key.toLowerCase().includes("photo")) {
        var image = value;
        var blob = UrlFetchApp.fetch("http://img.labnol.org/logo.png");
        value = blob;
        response_data[key] = value;
      }*/

      // If we have a price, add it to the running subtotal and format it to the
      // desired currency.
      if (key.toLowerCase().includes("price")) {
        subtotal += value;
        value = toCurrency(value);


      // If there is a discount, track it so we can adjust the total later and
      // format it to the desired currency.
      } else if (key.toLowerCase().includes("discount")) {
        discount += value;
        value = toCurrency(value);
      
      // Format dates
      } else if (key.toLowerCase().includes("date")) {
        value = toDateFmt(value);
      }

      // Add the key/value data pair to the response dictionary.
      response_data[key] = value;
    }

    // Once all data is added, we'll adjust the subtotal and total
    //response_data["sub_total"] = toCurrency(subtotal);
    //response_data["total"] = toCurrency(subtotal - discount);

    return response_data;
}

// Helper function to inject data into the template
function populateTemplate(document, response_data) {

    // Get the document header and body (which contains the text we'll be replacing).
    var document_header = document.getHeader();
    //Logger.log(document_header)    
    var document_body = document.getBody();
    //Logger.log(document_body)    



    // Replace variables in the header
    for (var key in response_data) {
      var match_text = `{{${key}}}`;
      var value = response_data[key];

      if (key.toLowerCase().includes("photo")) {
        

        // Get an image in Drive from its ID.
        var image = UrlFetchApp.fetch(value).getBlob();
        var next = document_body.findText(match_text);
        var index = next.getElement();
        index.asText().setText("");
        var img = index.getParent().asParagraph().insertInlineImage(0, image);
          img.setWidth(70);
          img.setHeight(70); 
 

        /*
        index = document_body.getChildIndex(match_text)
        var paragraph = document_body.insertParagraph(index,"hola");
        
        // Add the PositionedImage with offsets (in points).
        var posImage = paragraph.addPositionedImage(image)
            .setWidth(70)
            .setHeight(70)*/
              }

  else {
      // Replace our template with the final values
      document_header.replaceText(match_text, value);
      document_body.replaceText(match_text, value);}
    }

}


// Function to populate the template form
function createDocFromForm() {

  // Get active sheet and tab of our response data spreadsheet.
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("mapeo"); 
  var last_row = sheet.getLastRow() - 1;

  // Get the data from the spreadsheet.
  var range = sheet.getDataRange();
 
  // Identify the most recent entry and save the data in a variable.
  var data = range.getValues()[last_row];
  
  // Extract the headers of the response data to automate string replacement in our template.
  var headers = range.getValues()[0];


 // Parse the form data.
  var response_data = parseFormData(data, headers);

  // Retreive the template file and destination folder.
  var template_file = DriveApp.getFileById(TEMPLATE_FILE_ID);
  var target_folder = DriveApp.getFolderById(DESTINATION_FOLDER_ID);

  // Copy the template file so we can populate it with our data.
  // The name of the file will be the company name and the invoice number in the format: DATE_COMPANY_NUMBER
  var filename = `${response_data["id"]}`;
  var document_copy = template_file.makeCopy(filename, target_folder);

  // Open the copy.
  var document = DocumentApp.openById(document_copy.getId());



  // Populate the template with our form responses and save the file.
  populateTemplate(document, response_data);
  document.saveAndClose();
    
}
