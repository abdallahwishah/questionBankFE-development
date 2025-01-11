import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { DialogSharedService } from '@app/shared/components/dialog-shared/dialog-shared.service';
import { UniqueNameComponents } from '@app/shared/Models/UniqueNameComponents';
import { Router } from '@node_modules/@angular/router';
import { LazyLoadEvent } from '@node_modules/primeng/api';
import { Paginator } from '@node_modules/primeng/paginator';
import { Table } from '@node_modules/primeng/table';
import { AppComponentBase } from '@shared/common/app-component-base';
import { ExamTemplatesServiceProxy, StudyLevelsServiceProxy, StudySubjectsServiceProxy } from '@shared/service-proxies/service-proxies';

@Component({
    selector: 'app-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.css'],
})
export class ListComponent extends AppComponentBase implements OnInit {
    @ViewChild('dataTable', { static: true }) dataTable: Table;
    @ViewChild('paginator', { static: true }) paginator: Paginator;

    studyLevels: any[] = [];
    studySubjects: any[] = [];

    Warning_dialog = UniqueNameComponents.Warning_dialog;
    Copy_Template_dialog = UniqueNameComponents.Copy_Template_dialog;

    filter: string;

    constructor(
        private _injector: Injector,
        private _DialogSharedService: DialogSharedService,
        private _examTemplatesServiceProxy: ExamTemplatesServiceProxy,
        private _studyLevelsServiceProxy: StudyLevelsServiceProxy,
        private _studySubjectsProxy: StudySubjectsServiceProxy,
        private _router: Router,
    ) {
        super(_injector);
    }

    ngOnInit() {
        this._studyLevelsServiceProxy.getAll(undefined, undefined, undefined, undefined, undefined).subscribe((val) => {
            this.studyLevels = val.items.map((item) => {
                return {
                    id: item.studyLevel.id,
                    name: item.studyLevel.name,
                };
            });
        });
        this._studySubjectsProxy
            .getAll(undefined, undefined, undefined, undefined, undefined, undefined)
            .subscribe((val) => {
                this.studySubjects = val.items.map((item) => {
                    return {
                        id: item.studySubject.id,
                        name: item.studySubject.name,
                    };
                });
            });

    }
    getQuestion() {}

    getList(event?: LazyLoadEvent) {
            if (event) {
                if (this.primengTableHelper.shouldResetPaging(event)) {
                    this.paginator.changePage(0);
                    if (this.primengTableHelper.records && this.primengTableHelper.records.length > 0) {
                        return;
                    }
                }
            }

            this.primengTableHelper.showLoadingIndicator();

            this._examTemplatesServiceProxy
                .getAll(
                    this.filter, undefined, undefined, undefined, undefined, undefined, undefined, undefined
                )
                .subscribe((result) => {
                    this.primengTableHelper.totalRecordsCount = result.totalCount;
                    this.primengTableHelper.records = result.items;
                    this.primengTableHelper.hideLoadingIndicator();
                });
        }

    doActions(label: any, record: any) {
        switch (label) {
            case 'Edit':
                this._router.navigate(['app/main/templates/add-template/' + record.examTemplate.id]);
                break;
            case 'CreateTest':

                break;
            case 'Copy':
                this.CopyTemplate();
                break;
            case 'Delete':
                this._examTemplatesServiceProxy.delete(record.question.id).subscribe((val) => {
                    this.getList();
                });
                break;
        }
    }

    addTemplate() {
        this._DialogSharedService.showDialog(this.Warning_dialog, {});
    }
    CopyTemplate() {
        this._DialogSharedService.showDialog(this.Copy_Template_dialog, {});
    }
}
