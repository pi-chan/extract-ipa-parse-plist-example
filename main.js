(function(obj){

  var model = (function() {
    var URL = obj.webkitURL || obj.mozURL || obj.URL;

    return {
      getEntries : function(file, onend) {
        zip.createReader(new zip.BlobReader(file), function(zipReader) {
          zipReader.getEntries(onend);
        }, onerror);
      },
      getEntryFile : function(entry, onend, onprogress) {
        var writer, zipFileEntry;

        function getData() {
          entry.getData(writer, function(data) {
            var bplist = require("bplistParser.js");

            var arrayBuffer;
            var fileReader = new FileReader();
            fileReader.onload = function() {
              arrayBuffer = this.result;

              bplist.parseFile(arrayBuffer, function(e, result){
                if(e) throw e;
                onend(result);
              });

            };
            fileReader.readAsArrayBuffer(data);

          }, onprogress);
        }

        writer = new zip.BlobWriter();
        getData();
      }
    };
  })();

  var processFile = function(file, htmlList){
    model.getEntries(file, function(entries) {
      entries.forEach(function(entry) {
        if(!entry.filename.match("app/Info.plist")){
          return;
        }

        model.getEntryFile(entry, function(json) {
          if( json[0]["CFBundleURLTypes"] ) {        
            var li = document.createElement("li");
            var h3 = document.createElement("h3");
            var ul = document.createElement("ul");
            li.appendChild(h3);
            li.appendChild(ul);
            htmlList.appendChild(li);
            h3.textContent = json[0]["CFBundleDisplayName"] + "(" + json[0]["CFBundleIdentifier"] + ")";
            json[0]["CFBundleURLTypes"][0]["CFBundleURLSchemes"].forEach(function(urlscheme){
              var li2 = document.createElement("li");
              li2.textContent = urlscheme;
              ul.appendChild(li2);
            });
          }
        }, null);
      });
    });
  };

  function processFiles(files, htmlList){
    var files2 = files.concat();
    var file = files2.shift();

    processFile(file, htmlList);
    if(files2.length > 0){
      setTimeout(function(){processFiles(files2, htmlList);}, 300);
    }
  };

  document.getElementById("fileInfo").addEventListener("click", function(){
    var fileInput = document.getElementById("myFile");
    var fileList = document.getElementById("file-list");
    fileList.innerHTML = "";

    files = [];
    for(var i=0, file=fileInput.files[0]; file = fileInput.files[i]; ++i) {
      files.push(file);
    }

    processFiles(files, fileList);
  }, true); 
}(this));
