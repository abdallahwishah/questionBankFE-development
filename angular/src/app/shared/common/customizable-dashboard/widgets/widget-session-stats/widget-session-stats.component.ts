import {
    GetSessionStatsOutput,
    TenantDashboardServiceProxy,
} from './../../../../../../shared/service-proxies/service-proxies';
import { Component, ElementRef, Injector, OnInit, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
    selector: 'app-widget-session-stats',
    templateUrl: './widget-session-stats.component.html',
    styleUrls: ['./widget-session-stats.component.css'],
})
export class WidgetSessionStats extends AppComponentBase implements OnInit {
    @ViewChild('divElement', { static: true }) divRef!: ElementRef;
    noDataStatus: boolean;
    chartData = [];
    showChart: boolean = true;
    totalCount = 0;

    colorScheme = {
        domain: ['#08DDC1', '#FFDC1B', '#FF5E3A', '#084C61', '#FFA69E', '#FFF8E1'],
    };

    constructor(
        injector: Injector,
        private _tenantDashboardService: TenantDashboardServiceProxy,
    ) {
        super(injector);
    }

    ngOnInit() {
        this.totalCount = 0;
        this.showChart = false;
        this._tenantDashboardService.getSessionStats().subscribe((result) => {
            Object.entries(result.sessionStats).map(([key, value], index) => {
                this.totalCount += value * 100;
                this.chartData.push({
                    name: this.l(key),
                    value: value * 100,
                    hexColor: this.colorScheme.domain[index],
                });
            });

            this.noDataStatus = Object.entries(result.sessionStats).length == 0;
            this.showChart = true;
        });
    }

    calWidth() {
        let width = 0.5;
        return [this.divRef.nativeElement.offsetWidth * width, this.divRef.nativeElement.offsetWidth * width];
    }
}
