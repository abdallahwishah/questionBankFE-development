import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { DialogSharedModule } from '@app/shared/components/dialog-shared/dialog-shared.module';
import { DialogSharedService } from '@app/shared/components/dialog-shared/dialog-shared.service';
import { DropdownFieldComponent } from '@app/shared/components/fields/dropdown-field/dropdown-field.component';
import { SkeletonComponent } from '@app/shared/components/skeleton/skeleton.component';
import { UniqueNameComponents } from '@app/shared/Models/UniqueNameComponents';
import { FormsModule } from '@node_modules/@angular/forms';
import { LazyLoadEvent, SharedModule } from '@node_modules/primeng/api';
import { Paginator } from '@node_modules/primeng/paginator';
import { Table } from '@node_modules/primeng/table';
import { AppComponentBase } from '@shared/common/app-component-base';
import { ExamTemplatesServiceProxy, QuestionsServiceProxy, QuestionTypeEnum } from '@shared/service-proxies/service-proxies';
import { SafeTextPipe } from "../../../../shared/pipes/safe-text.pipe";
import { CommonModule } from '@node_modules/@angular/common';
import { AppSharedModule } from '@app/shared/app-shared.module';

@Component({
  standalone: true,
  imports: [DropdownFieldComponent, DialogSharedModule, SkeletonComponent, SafeTextPipe , AppSharedModule ,
    CommonModule,
  ],
  selector: 'app-add-view-exam-modal',
  templateUrl: './add-view-exam-modal.component.html',
  styleUrls: ['./add-view-exam-modal.component.css']
})
export class AddViewExamModalComponent extends AppComponentBase implements OnInit {
  @ViewChild('dataTable', { static: true }) dataTable: Table;
  @ViewChild('paginator', { static: true }) paginator: Paginator;

  selectedQuestion:any
   Add_View_exam_dialog = UniqueNameComponents.Add_View_exam_dialog;
   QuestionTypeEnum = QuestionTypeEnum;
   QuestionTypeId:any
   filter:any;
  constructor(injector: Injector,
    private _DialogSharedService: DialogSharedService,
    private _questionsServiceProxy: QuestionsServiceProxy,
    private _examTemplatesServiceProxy: ExamTemplatesServiceProxy,
    
) { 
  super(injector);

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

    this._questionsServiceProxy
        .getAll(
            this.filter,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
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
/*             this.isActiveFilter = undefined;
 */            this.primengTableHelper.hideLoadingIndicator();
        });
}

  
  Save() {
     this._examTemplatesServiceProxy.generateExamByTemplate(this.selectedQuestion).subscribe(() => {
        this.notify.info(this.l('SavedSuccessfully'));
        this.closeDialog();
    }); 
}

 changeType() {
 /*  this._createOrEditQuestionDto.autoCorrection = false;
  this._createOrEditQuestionDto.enableShuffleOptions = false;
  if (this._createOrEditQuestionDto.type == QuestionTypeEnum.LinkedQuestions) {
      this._createOrEditQuestionDto.payload = new QuestionPayloadDto({
          ...new QuestionPayloadDto(),
          subQuestions: [new CreateOrEditQuestionDto()],
      });
  } */
} 
  
  closeDialog() {
    this._DialogSharedService.hideDialog(this.Add_View_exam_dialog);
}
}
