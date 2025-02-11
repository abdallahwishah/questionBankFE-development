import {
    ExamAttemptsServiceProxy,
    MoveStudentDto,
    MoveSupervisorDto,
    SessionsServiceProxy,
    SessionSupervisorsServiceProxy,
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
    @Input() SessionSelected: any;
    studentId: any;
    schoolClassId;
    schoolId;
    sessionSupervisor: any;
    constructor(
        private Injector: Injector,
        private _examAttemptsServiceProxy: ExamAttemptsServiceProxy,
        private _dialogSharedService: DialogSharedService,
        private _sessionsServiceProxy: SessionsServiceProxy,
        private _SessionSupervisorsServiceProxy: SessionSupervisorsServiceProxy,
    ) {
        super(Injector);
    }

    ngOnInit() {
        this.subscription = this._dialogSharedService
            .SelectorFilterByComponent$(this.Move_Student_dialog, 'configShow')
            .subscribe((configShow) => {
                this.sessionSupervisor = undefined;
                this.studentId = undefined;
                if (configShow?.data?.sessionSupervisor) {
                    debugger
                    this.sessionSupervisor = configShow?.data?.sessionSupervisor;
                } else {
                    this.studentId = configShow?.data;
                }
            });
    }

    Save() {
        if (this.sessionSupervisor) {
            this._SessionSupervisorsServiceProxy
                .moveSupervisors(
                    new MoveSupervisorDto({
                        sessionId: this.SessionSelected,
                        schoolClassId: this.schoolClassId,
                        schoolId: this.schoolId?.school.id,
                        supervisorIds: [this.sessionSupervisor],
                    }),
                )
                .subscribe((res) => {
                    this.SessionSelected = undefined;
                    this.schoolClassId = undefined;
                    this.schoolId = undefined;
                    this.studentId = undefined;
                    this.sessionSupervisor = undefined;

                    this.notify.success('  Moved Successfully');
                    this.Close();
                });
        } else {
            this._examAttemptsServiceProxy
                .moveStudent(
                    new MoveStudentDto({
                        sessionId: this.SessionSelected,
                        schoolClassId: this.schoolClassId,
                        schoolId: this.schoolId?.school.id,
                        studentId: this.studentId?.length ? this.studentId : [this.studentId],
                    }),
                )
                .subscribe((res) => {
                    this.SessionSelected = undefined;
                    this.schoolClassId = undefined;
                    this.schoolId = undefined;
                    this.studentId = undefined;
                    this.sessionSupervisor = undefined;

                    this.notify.success('Student Added Successfully');
                    this.Close();
                });
        }
    }
    Close() {
        this._dialogSharedService.hideDialog(this.Move_Student_dialog);
    }
    getSchoolClassForViewDtos: any;
    get() {
        this.getSchoolClassForViewDtos = this.schoolId?.getSchoolClassForViewDtos?.map((value) => {
            return {
                id: value?.schoolClass?.id,
                name: value?.schoolClass?.name,
            };
        });
    }

    ngOnDestroy(): void {
        // Don’t forget to clean up
        this.subscription?.unsubscribe();
    }
}
