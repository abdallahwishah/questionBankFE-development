import { Component, EventEmitter, Injector, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { DashboardDto, DashboardTypeEnum, GetDashboardForViewDto } from '@shared/service-proxies/service-proxies';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-view-details',
  templateUrl: './view-details.component.html',
  styleUrls: ['./view-details.component.css']
})
export class ViewDetailsComponent implements OnInit {

    @Input()items: any ;
    @Input()itemsDashboard: any ;
    @Input()itemsCategories: any ;
    @Input()itemsNotes: any ;
    @Input()itemsKeywords: any ;
    @Input()itemsComments: any ;
    @Input()itemsDlib: any ;

    constructor(){}
    ngOnInit(): void {
    }

}
