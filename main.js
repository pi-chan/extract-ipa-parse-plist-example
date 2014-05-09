(function(obj){

  var bplist = require("bplistParser.js");
  zip.workerScriptsPath = "./lib/";

  var model = (function() {
    var URL = obj.webkitURL || obj.mozURL || obj.URL;

    return {
      getEntries : function(file, onend) {
        zip.createReader(new zip.BlobReader(file), function(zipReader) {
          zipReader.getEntries(onend);
        }, onerror);
      },
      getEntryFile : function(entry, onend, onprogress) {
        var writer = new zip.BlobWriter();
        entry.getData(writer, function(data) {
          onend(data);
        }, onprogress);
      }
    };
  })();

  function processFile(file, appList){

    var onComplete = function(json){
      var urlTypes = json[0]["CFBundleURLTypes"];
      if(urlTypes) {        

        var appItem = document.createElement("li");
        var appName = document.createElement("h3");
        var schemeList = document.createElement("ul");
        appItem.appendChild(appName);
        appItem.appendChild(schemeList);
        appList.appendChild(appItem);
        appName.textContent = json[0]["CFBundleDisplayName"] + "(" + json[0]["CFBundleIdentifier"] + ")";

        urlTypes[0]["CFBundleURLSchemes"].forEach(function(urlscheme){
          var schemeItem = document.createElement("li");
          schemeItem.textContent = urlscheme;
          appList.appendChild(schemeItem);
        });
      };
    };

    model.getEntries(file, function(entries) {
      entries.forEach(function(entry) {
        if(!entry.filename.match("app/Info.plist")){
          return;
        }

        model.getEntryFile(entry, function(data) {
          var fileReader = new FileReader();
          fileReader.onload = function() {
            bplist.parseFile(this.result, function(e, json){
              if(e) throw e;
              onComplete(json);
            });
          };
          fileReader.readAsArrayBuffer(data);
        }, null);
      });
    });
  };

  function processFiles(files, appList){
    var files2 = files.concat();
    var file = files2.shift();

    processFile(file, appList);
    if(files2.length > 0){
      setTimeout(function(){processFiles(files2, appList);}, 300);
    }
  };

  document.getElementById("button-start").addEventListener("click", function(){
    var fileInput = document.getElementById("file-input");
    var appList = document.getElementById("app-list");
    appList.innerHTML = "";

    files = [];
    for(var i=0, file=fileInput.files[0]; file = fileInput.files[i]; ++i) {
      files.push(file);
    }

    processFiles(files, appList);
  }, true); 
}(this));
