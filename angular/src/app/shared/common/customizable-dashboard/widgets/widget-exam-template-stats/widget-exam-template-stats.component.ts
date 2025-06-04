import { AppComponentBase } from '@shared/common/app-component-base';
import {
    TenantDashboardServiceProxy,
    TenantServiceProxy,
} from './../../../../../../shared/service-proxies/service-proxies';
import { Component, Injector, OnInit } from '@angular/core';

@Component({
    selector: 'app-widget-exam-template-stats',
    templateUrl: './widget-exam-template-stats.component.html',
    styleUrls: ['./widget-exam-template-stats.component.css'],
})
export class WidgetExamTemplateStats extends AppComponentBase implements OnInit {
    totalSession: number;
    yearSelected: Date = new Date();

    constructor(
        injector: Injector,
        private _tenantDashboardService: TenantDashboardServiceProxy,
    ) {
        super(injector);
    }

    ngOnInit() {
        this.getExamTemplateStats();
    }

    getExamTemplateStats() {
        this._tenantDashboardService.getExamTemplateStats(this.yearSelected?.getFullYear()).subscribe((result) => {
            this.totalSession = result.totalSessionsCount;
        });
    }
}
