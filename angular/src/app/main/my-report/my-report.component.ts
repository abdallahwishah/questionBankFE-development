import { ReportItemsServiceProxy } from '@shared/service-proxies/service-proxies';
import { Component, Injector, OnInit } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { Router } from '@angular/router';

@Component({
    selector: 'app-my-report',
    templateUrl: './my-report.component.html',
    styleUrls: ['./my-report.component.css'],
})
export class MyReportComponent extends AppComponentBase implements OnInit {
    reports: any;
    filterText: any;
    constructor(private ReportItemsServiceProxy: ReportItemsServiceProxy, injector: Injector,private _router:Router) {
        super(injector);
    }

    ngOnInit() {
        this.getReport();
    }
    getReport() {
        this.ReportItemsServiceProxy.getMyReport(
            this.filterText,
            undefined,
            undefined,
            undefined,
            'id',
            0,
            1000
        ).subscribe((res) => {
            this.reports = res.items;
        });
    }
    viewReport(item){
        this._router.navigate(['/app/main/report/reportItems/viewer/'+item.reportItem.name])

    }
}
