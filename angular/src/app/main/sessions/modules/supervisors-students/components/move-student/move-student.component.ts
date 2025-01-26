import {
    ExamAttemptsServiceProxy,
    MoveStudentDto,
    SessionsServiceProxy,
} from './../../../../../../../shared/service-proxies/service-proxies';
import { Component, OnInit, Injector, Input } from '@angular/core';
import { DialogSharedService } from '@app/shared/components/dialog-shared/dialog-shared.service';
import { UniqueNameComponents } from '@app/shared/Models/UniqueNameComponents';
import { Subscription } from '@node_modules/rxjs/dist/types';
import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
    selector: 'app-move-student',
    templateUrl: './move-student.component.html',
    styleUrls: ['./move-student.component.css'],
})
export class MoveStudentComponent extends AppComponentBase implements OnInit {
    subscription: Subscription;

    Move_Student_dialog = UniqueNameComponents.Move_Student_dialog;
    SessionSelected: any;
    studentId: any;
    @Input() schoolClassId: any;
    @Input() schoolId: any;

    constructor(
        private Injector: Injector,
        private _examAttemptsServiceProxy: ExamAttemptsServiceProxy,
        private _dialogSharedService: DialogSharedService,
        private _sessionsServiceProxy: SessionsServiceProxy,
        
    ) {
        super(Injector);
    }

    ngOnInit() {
        this.subscription = this._dialogSharedService
        .SelectorFilterByComponent$(this.Move_Student_dialog, 'configShow')
        .subscribe(configShow => {
            this.studentId = configShow?.data
        });
     }
    
    Save() {
        this._sessionsServiceProxy.getAll;
        this._examAttemptsServiceProxy
            .moveStudent(
                new MoveStudentDto({
                    sessionId: this.SessionSelected?.session.id,
                    schoolClassId: this.schoolClassId,
                    schoolId: this.schoolId,
                    studentId: [this.studentId],
                }),
            )
            .subscribe((res) => {
                this.notify.success('Student Added Successfully');
                this.Close();
            }); 
    }
    Close() {
        this._dialogSharedService.hideDialog(this.Move_Student_dialog);
    }

    ngOnDestroy(): void {
        // Don’t forget to clean up
        this.subscription?.unsubscribe();
      }
}
