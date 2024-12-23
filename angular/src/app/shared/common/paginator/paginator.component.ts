import { Component, Injector, Input, OnInit } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { Paginator } from 'primeng/paginator';

@Component({
    selector: 'app-paginator',
    standalone:true,
    templateUrl: './paginator.component.html',
    styleUrls: ['./paginator.component.css'],
})
export class PaginatorComponent extends AppComponentBase implements OnInit {
    @Input() paginator;
    @Input() primengTableHelper;
    constructor(injector: Injector) {
        super(injector);
    }

    ngOnInit() {}

    previousPage(paginator: Paginator) {
        if (paginator.getPage() > 0) {
            paginator.changePage(paginator.getPage() - 1);
        }
    }

    nextPage(paginator: Paginator) {
        if (paginator.getPage() < paginator.getPageCount() - 1) {
            paginator.changePage(paginator.getPage() + 1);
        }
    }
}
