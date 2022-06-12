$(function () {
   let derivers = $.pivotUtilities.derivers;
   let textImport = document.querySelector(".import-text");
   let altImport = document.querySelector(".import-file-alttext");
   let inputExcel = document.querySelector('#importFile');
   let renderers = $.extend(
      $.pivotUtilities.renderers,
      $.pivotUtilities.plotly_renderers
   );


   function popUpHide() {
      $("#popup").hide();
   }

   function popUpShow() {
      $("#popup").show();
   }


   inputExcel.addEventListener('change', function (e) {
      let fileReader = new FileReader();
      let file = e.target.files[0];

      //$("#pivot")[0].innerHTML = '';
      if (file.type === 'application/json') {
         fileReader.readAsBinaryString(file);
         fileReader.onloadend = (e) => {
            let jsonFile = JSON.parse(fileReader.result);

            textImport.innerText = `Таблица ${file.name}`;
            $("#pivot").pivotUI(jsonFile, {
               derivedAttributes: []
            });
         }
      } else {
         fileReader.readAsBinaryString(file);
         fileReader.onloadend = (e) => {
            let data = fileReader.result;
            let workbook = XLSX.read(data, { type: 'binary' });

            let sheets = workbook.SheetNames;
            textImport.innerText = `Таблица ${file.name}`;
            if (sheets.length > 1) {
               let sheetInputs = document.querySelector('.sheet-inputs');
               let button = document.querySelector('#sheetBtn');
               let choices = '';

               for (let sheet of sheets) {
                  choices += `<div class="sheet-choice"><input type="radio" id="${sheet}" name="sheetChoice" value="${sheet}"><label for="${sheet}" style="padding-left: 5px">${sheet}</label><br></div>`
               }
               sheetInputs.innerHTML = choices;
               popUpShow()

               button.addEventListener('click', function (e) {
                  let radioButtons = document.querySelectorAll('[name="sheetChoice"]')
                  for (let radioBtn of radioButtons) {
                     if (radioBtn.checked) {
                        let sheet = radioBtn.value;
                        let jsonObject = XLSX.utils.sheet_to_json(workbook.Sheets[sheet]);
                        $("#pivot").pivotUI(jsonObject, {
                           derivedAttributes: []
                        });
                        popUpHide();
                        break;
                     }
                  }
               })

            } else {
               let sheet = sheets[0];
               let jsonObject = XLSX.utils.sheet_to_json(workbook.Sheets[sheet]);
               $("#pivot").pivotUI(jsonObject, {
                  derivedAttributes: []
               });
            }
         };
      };

   });

   altImport.addEventListener('click', function (e) {
      inputExcel.value = '';
      textImport.innerText = `Таблица Canadian Parliament 2012 Dataset.json`;
      $.getJSON("script/data/mps.json", function (mps) {
         $("#pivot").pivotUI(mps, {
            rendererName: 'Sankey Chart',
            rows: ["Province"],
            cols: ["Party", "Gender"],
            // derivedAttributes: {
            //    "Age Bin": derivers.bin("Age", 10),
            //    "Gender Imbalance": function (mp) {
            //       return mp["Gender"] == "Male" ? 1 : -1;
            //    }
            // }
         });
      });

   });

   // altImport.click()
});