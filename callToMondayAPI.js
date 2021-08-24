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




//Function to delete items that are not on the desired state
function DeleteFunction() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var s = ss.getSheetByName('mapeo');
  var r = s.getRange('D:D');
  var v = r.getValues();
  for(var i=v.length-1;i>=0;i--)
    if(v[0,i]=='Pendiente'||v[0,i]=='Enviar correo')
      s.deleteRow(i+1);
};




//Removing duplicates
function RemoveDuplicates() {
  var sheet=SpreadsheetApp.getActiveSheet();
  var rows=sheet.getLastRow();
  var firstColumn=sheet.getRange(1, 2, rows, 1).getValues();
  firstColumn = firstColumn.map(function(e){return e[0]})
  var uA=[];
  for (var i=rows;i>0;i--) {
    if (uA.indexOf(firstColumn[i-1])!=-1) {
      sheet.deleteRow(i);
    }else{
      uA.push(firstColumn[i-1]);
    }
  }
}





function getitems() {
  //var query = "query{boards(ids:1601895903, limit:200){id, name, items(limit:200){id,name, column_values{id,text}}}}"; 
  var query = "query { items_by_column_values (board_id: 1601895903, column_id: \"status\", column_value: \"Generar archivo\") {id, name, updated_at, column_values{id,text}} }";

  var variables = {
      "ids" :1601895903,
      "limit" : 200,
      };

  var ss = SpreadsheetApp.getActiveSpreadsheet(); //I put my code in the Google Scripts editor on the Spreadsheet I wanted to use. 
  var sheet = ss.getSheetByName("mapeo"); //The sheet I am putting my Boards on.
  
  
  var data = JSON.parse(makeAPICall(mondayAPIkey,query,variables)); 

  Logger.log(data) 

  var boards = data.data.boards;
  var items_by_column_values = data.data.items_by_column_values;
 
  var x = 2; //Because of the headers
  //var items = boards['items']
      
  for (var item in items_by_column_values){
      var column_values = items_by_column_values[item]['column_values']
      y = 4; 

        for( var column_value in column_values){  
          sheet.getRange(1, y).setValue(column_values[column_value]['id']);
          sheet.getRange(x, 3).setValue(items_by_column_values[item]['updated_at']);
          sheet.getRange(x, 2).setValue(items_by_column_values[item]['name']);
          sheet.getRange(x, 1).setValue(items_by_column_values[item]['id']);
          sheet.getRange(1, 3).setValue('updated_at');
          sheet.getRange(1, 2).setValue('name');
          sheet.getRange(1, 1).setValue('id');

          sheet.getRange(x, y).setValue(column_values[column_value]['text']);
          y++;
          }
      var file = DriveApp.getFilesByName(items_by_column_values[item]['id'])
      var checkExistence = file.hasNext()
      if (checkExistence === true){
        Logger.log(items_by_column_values[item]['id']+' it exist') 

      }
      else{
        Logger.log(items_by_column_values[item]['id']+' does not exist, it will be created next')
        var createDocument = createDocFromForm(x);

        var mutationQuery ='mutation($itemID: Int!, $docURL: JSON!) {change_column_value (board_id: 1601895903,item_id: $itemID, column_id: "enlace", value: $docURL) {id}}';

        var variablesMut =
          {
          "docURL": JSON.stringify({"url": createDocument, "text": "Ver Documento"}),
          "itemID": parseInt(items_by_column_values[item]['id']),
          }

        var mutationCall = JSON.parse(makeAPICall(mondayAPIkey, mutationQuery, variablesMut));

      }
      Logger.log(createDocument);

      x++;
    }

var deleteFunction = DeleteFunction(); //Delete other status
var removeDuplicates =RemoveDuplicates(); //Delete duplicates


}













