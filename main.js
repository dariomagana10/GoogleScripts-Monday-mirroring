// API key (for illustration only, you should store production key in an environment variable)
  var mondayAPIkey  = "eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjExNTcxODY0MywidWlkIjoyMTUxMzI1NCwiaWFkIjoiMjAyMS0wNy0wMVQxODo1MTozNS4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6NTkwMDQxLCJyZ24iOiJ1c2UxIn0.5ZEZQ6dILI-vwUfPPle-hUIbbP7l2s9g9QFcdwxNhAA";
  var url = "https://api.monday.com/v2";

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
  var query = "query{boards(ids:904548154, limit:10){id, name, items(limit:10){id,name}}}"; 
  var variables = {
      "ids" :904548154,
      "limit" : 10,
      };

  var ss = SpreadsheetApp.getActiveSpreadsheet(); //I put my code in the Google Scripts editor on the Spreadsheet I wanted to use. 
  var sheet = ss.getSheetByName("mapeo"); //The sheet I am putting my Boards on.
  
  var data = JSON.parse(makeAPICall(mondayAPIkey,query,variables)); 

  Logger.log(data) 

  var boards = data.data.boards;
 
  var x = 2; //Because of headers
  

    for (var board in boards){
    var items = boards[board]['items']
    for (var item in items){
    sheet.getRange(x, 1).setValue(boards[board]['name']);
    sheet.getRange(x, 2).setValue(boards[board]['id']);
    sheet.getRange(x, 3).setValue(items[item]['name'])
    sheet.getRange(x, 4).setValue(items[item]['id']);
    sheet.getRange(x, 5).setValue(item);
    x++;
    }
  }

}













