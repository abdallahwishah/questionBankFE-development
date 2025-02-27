import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppConsts } from '@shared/AppConsts';
import { DxReportViewerComponent } from 'devexpress-reporting-angular';
import { ExportFormatID } from 'devexpress-reporting/dx-webdocumentviewer';
import { fetchSetup } from '@devexpress/analytics-core/analytics-utils';
import { ConsoleLogger } from '@microsoft/signalr/dist/esm/Utils';
import { Console } from 'console';

@Component({
  selector: 'app-dx-report-viewer',
  templateUrl: './dx-report-viewer.component.html',
  styleUrls: [
    "./../../../../../../node_modules/devextreme/dist/css/dx.material.blue.light.css",
    "./../../../../../../node_modules/@devexpress/analytics-core/dist/css/dx-analytics.common.css",
    "./../../../../../../node_modules/@devexpress/analytics-core/dist/css/dx-analytics.material.blue.light.css",
    "./../../../../../../node_modules/@devexpress/analytics-core/dist/css/dx-querybuilder.css",
    "./../../../../../../node_modules/devexpress-reporting/dist/css/dx-webdocumentviewer.css",
    "./../../../../../../node_modules/devexpress-reporting/dist/css/dx-reportdesigner.css",
    "./../../../../../../node_modules/ace-builds/css/ace.css",
    // light theme
    "./../../../../../../node_modules/ace-builds/css/theme/dreamweaver.css",
    // dark theme
    "./../../../../../../node_modules/ace-builds/css/theme/ambiance.css",
  ]
})

export class AppDxReportViewerComponent {
  @ViewChild(DxReportViewerComponent, { static: false }) viewer: DxReportViewerComponent;
  title = 'DXReportDesignerSample';
  @Input() reportUrl = '';
  hostUrl = AppConsts.remoteServiceBaseUrl
  invokeAction: string = '/DXXRDV';

  reportParam: any;

  OnCustomizeExportOptions(event) {
    // event.args.HideFormat(ExportFormatID.XLS);
    // event.args.HideFormat(ExportFormatID.Text);
    // event.args.HideFormat(ExportFormatID.XLSX);
  }

  ParametersInitialized(event: any) {
    console.log(event);
  }

  ParametersSubmitted(event: any) {



    const parameters = event.args.Parameters;

    this.reportParam = parameters;


    console.log(parameters);
    // Iterate through parameters
    // parameters.forEach(parameter => {
    //   // Access parameter value
    //   const paramValue = parameter.Value;
    //   console.log('Parameter Name:', parameter.Name);
    //   console.log('Parameter Value:', parameter.Value);
    // });


  }


  CustomizeMenuActions(event) {
    var exportUrl = AppConsts.remoteServiceBaseUrl + "/report/export?key=" + this.reportUrl;




    event.args.Actions.push({
      text: "Export To Excel",
      imageTemplateName: "ExportToExcel",
      visible: true,
      disabled: false,
      hasSeparator: true,
      hotKey: { ctrlKey: true, keyCode: "Z".charCodeAt(0) },
      clickAction: () => {

        var exportUrl = AppConsts.remoteServiceBaseUrl + "/report/export?key=" + this.reportUrl;
        if (this.reportParam) {
          this.reportParam.forEach(parameter => {
            console.log(parameter);
            if (Array.isArray(parameter.Value)) {
              exportUrl += "&" + parameter.Key + "=" ;
              parameter.Value.forEach(parameter => {

                var date = new Date(parameter);
                console.log(date); // Output the formatted date string

                var day = date.getDate();
                var month = date.getMonth() + 1; // Month starts from 0, so add 1
                var year = date.getFullYear();

                console.log(day); // Output the formatted date string
                console.log(month); // Output the formatted date string
                console.log(year); // Output the formatted date string

               


                // Ensure leading zero for single-digit day and month
                var day1 = day < 10 ? '0' + day : day;
                var month1 = month < 10 ? '0' + month : month;

                // Construct the formatted date string
                var formattedDate = day1 + '/' + month1 + '/' + year;

                console.log(formattedDate); // Output the formatted date string

                exportUrl+=formattedDate +","
              });
              console.log(exportUrl); // Output the formatted date string
              //parameter.Value.join(',')
            }
            else {
              exportUrl += "&" + parameter.Key + "=" + parameter.Value;
            }

          });
        }

        console.log(exportUrl);
        let tokenInfoJson: any = abp.auth.getToken();

        const options = {
          method: 'GET', // or 'POST', 'PUT', etc.
          headers: {
            'Authorization': 'Bearer ' + tokenInfoJson
          }
        };

        fetch(exportUrl, options)
          .then(response => {
            // Check if the response was successful (status code in the range 200-299)
            if (response.ok) {
              // If the response is a successful one, initiate the download
              return response.blob();
            } else {
              // If the response is not successful, throw an error with the status text
              throw new Error(`HTTP error! Status: ${response.status}, Text: ${response.statusText}`);
            }
          })
          .then(blob => {
            // Create a URL for the blob object
            const blobUrl = URL.createObjectURL(blob);
            // Trigger the download
            const link = document.createElement('a');
            // Set the href attribute to the blob URL
            link.href = blobUrl;
            // Specify the download attribute and set the desired file name
            link.download = 'ExportToExcel.Xlsx'; // Change 'filename.ext' to the desired file name
            // Append the link to the document body
            document.body.appendChild(link);
            // Trigger a click event on the link
            link.click();
            // Remove the link from the document body
            document.body.removeChild(link);

          })
          .catch(error => {
            // Log any errors that occur during the fetch operation
            console.error('Error:', error);
          });

      }
    });
  }


  constructor() {



  }

  ngOnInit(): void {
    let tokenInfoJson: any = abp.auth.getToken();
    fetchSetup.fetchSettings = {
      headers: {
        'Authorization': 'Bearer ' + tokenInfoJson
      }
    };

  }
}
