import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { fetchSetup } from '@devexpress/analytics-core/analytics-utils';
import { AppConsts } from '@shared/AppConsts';
@Component({
  selector: 'app-report-items-desgin',
  templateUrl: './report-items-desgin.component.html',



  styleUrls: [
      "./../../../../../node_modules/devextreme/dist/css/dx.material.blue.light.css",
      "./../../../../../node_modules/@devexpress/analytics-core/dist/css/dx-analytics.common.css",
      "./../../../../../node_modules/@devexpress/analytics-core/dist/css/dx-analytics.material.blue.light.css",
      "./../../../../../node_modules/@devexpress/analytics-core/dist/css/dx-querybuilder.css",
      "./../../../../../node_modules/devexpress-reporting/dist/css/dx-webdocumentviewer.css",
      "./../../../../../node_modules/devexpress-reporting/dist/css/dx-reportdesigner.css",
      "./../../../../../node_modules/ace-builds/css/ace.css",
      // light theme
      "./../../../../../node_modules/ace-builds/css/theme/dreamweaver.css",
      // dark theme
      "./../../../../../node_modules/ace-builds/css/theme/ambiance.css",
    ]
})
export class ReportItemsDesginComponent implements OnInit {
    title = 'DXReportDesignerSample';
    getDesignerModelAction = '/DXXRD/GetDesignerModel';
    reportUrl = '';
    hostUrl = AppConsts.remoteServiceBaseUrl;
    constructor(private _activatedRoute: ActivatedRoute) {
        this.reportUrl = this._activatedRoute.snapshot.params['name'];
    }

    ngOnInit(): void {
        let tokenInfoJson: any = abp.auth.getToken();
        // ajaxSetup.ajaxSettings = { headers: { Authorization: 'Bearer ' + tokenInfoJson } };
        fetchSetup.fetchSettings = {
            headers: {
              'Authorization': 'Bearer ' + tokenInfoJson
            }
          };

    }
}
