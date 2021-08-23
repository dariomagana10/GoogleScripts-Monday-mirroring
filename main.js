// API key (for illustration only, you should store production key in an environment variable)
var mondayAPIkey  = "eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjExNTcxODY0MywidWlkIjoyMTUxMzI1NCwiaWFkIjoiMjAyMS0wNy0wMVQxODo1MTozNS4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6NTkwMDQxLCJyZ24iOiJ1c2UxIn0.5ZEZQ6dILI-vwUfPPle-hUIbbP7l2s9g9QFcdwxNhAA";
var url = "https://api.monday.com/v2";


//Main API call
function makeAPICall(key, query, variables) {
  var url = "https://api.monday.com/v2";
  var options = {
    "method" : "post",
    "headers" : {
      "Authorization" : key,
    },
    "payload" : JSON.stringify({
      "query" : query,
      "variables" : variables
    }),
    "contentType" : "application/json"
  };
  var response = UrlFetchApp.fetch(url, options);
  Logger.log(response);
  var respsone = JSON.parse(response);
  return response;
}

function getboards() {
  var query = "query{boards(limit:1000,state:active){id,name}}";
  var variables = {
      "limit" : 1000,
      "state" : "active",
    };

  var ss = SpreadsheetApp.getActiveSpreadsheet(); 
  var sheet = ss.getSheetByName("mapeo"); 
 
  
  var data = JSON.parse(makeAPICall(mondayAPIkey,query,variables));
  var boards = data.data.boards;
  var x = 2; //The row I want to start with (I have a header in row 1).
  boards.forEach(function(elem){
    sheet.getRange(x, 1).setValue(elem['name']);
    sheet.getRange(x, 2).setValue(elem['id']);
    x++; //this allows it to go to the next line before starting the loop over for the next item.
  });
 
} 

function getitems() {
  //var query = "query{items(limit:10){id,name,board{id,name}}}"; 
  var query = "query{boards(ids:1601895903, limit:200){id, name, items(limit:200){id,name, column_values{id,text}}}}"; 
  var query = "query { items_by_column_values (board_id: 1601895903, column_id: \"status\", column_value: \"Generar archivo\") {id, name} }";

  var variables = {
      "ids" :1601895903,
      "limit" : 200,
      };

  var ss = SpreadsheetApp.getActiveSpreadsheet(); //I put my code in the Google Scripts editor on the Spreadsheet I wanted to use. 
  var sheet = ss.getSheetByName("mapeo"); //The sheet I am putting my Boards on.
  
  
  var data = JSON.parse(makeAPICall(mondayAPIkey,query,variables)); 

  Logger.log(data) 

  var boards = data.data.boards;
 
  var x = 2; //Because of the headers

      var items = boards['items']
      
        for (var item in items){
          var column_values = items[item]['column_values']
          y = 3; 

          for( var column_value in column_values){  
            sheet.getRange(1, y).setValue(column_values[column_value]['id']);
            sheet.getRange(x, 2).setValue(items[item]['name']);
            sheet.getRange(x, 1).setValue(items[item]['id']);
            sheet.getRange(1, 2).setValue('name');
            sheet.getRange(1, 1).setValue('id');

            sheet.getRange(x, y).setValue(column_values[column_value]['text']);
            y++;
          }
    x++;
    }

}













