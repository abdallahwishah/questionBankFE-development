import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@node_modules/@angular/common';
import { FormsModule } from '@node_modules/@angular/forms';
import { LazyLoadEvent } from '@node_modules/primeng/api';
import { Paginator } from '@node_modules/primeng/paginator';
import { Table } from '@node_modules/primeng/table';
import { AppComponentBase } from '@shared/common/app-component-base';
import { UtilsModule } from "../../../shared/utils/utils.module";
import { PaginatorComponent } from '@app/shared/common/paginator/paginator.component';
import { AppSharedModule } from '@app/shared/app-shared.module';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule, FormsModule, UtilsModule ,PaginatorComponent , AppSharedModule],
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.css']
})
export class QuizComponent extends AppComponentBase implements OnInit {
  @ViewChild('dataTable', { static: true }) dataTable: Table;
  @ViewChild('paginator', { static: true }) paginator: Paginator;

  constructor(
    private _injector: Injector,
  ) {
    super(_injector);
   }

  ngOnInit() {
  }

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

   /*  this._sessionsServiceProxy
        .getAllForCorrectionOrAudited(
            this.filter,
            undefined,
            undefined,
            undefined,
            this.levelId || undefined,
            this.subjectId ||undefined,
            undefined,
            undefined,
            undefined,
            this.primengTableHelper.getSorting(this.dataTable),
            this.primengTableHelper.getSkipCount(this.paginator, event),
            this.primengTableHelper.getMaxResultCount(this.paginator, event),
        )
        .subscribe((result) => {
            this.primengTableHelper.totalRecordsCount = result.totalCount;
            this.primengTableHelper.records = result.items;
            this.primengTableHelper.hideLoadingIndicator();
        }); */
}

}
