import {
    CreateOrEditExamAttemptDto,
    CreateOrEditStudentDto,
    CreateOrEditSupervisorDto,
    ExamAttemptsServiceProxy,
    StudentsServiceProxy,
} from './../../../../../../../shared/service-proxies/service-proxies';
import { Component, OnInit, Injector, Input } from '@angular/core';
import { DialogSharedService } from '@app/shared/components/dialog-shared/dialog-shared.service';
import { UniqueNameComponents } from '@app/shared/Models/UniqueNameComponents';
import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
    selector: 'app-add-student',
    templateUrl: './add-student.component.html',
    styleUrls: ['./add-student.component.css'],
})
export class AddStudentComponent extends AppComponentBase implements OnInit {
    Add_Student_dialog = UniqueNameComponents.Add_Student_dialog;
    StudentSelected: any;
    @Input() execuldedIdFilter: any;
    @Input() schoolName: any;

    constructor(
        private Injector: Injector,
        private _studentsServiceProxy: StudentsServiceProxy,
        private _dialogSharedService: DialogSharedService,
    ) {
        super(Injector);
    }

    ngOnInit() {
        console.log('this.StudentSelected :', this.StudentSelected);
    }
    Save() {
        this._studentsServiceProxy.getAll;
        this._studentsServiceProxy
            .createOrEdit(
                new CreateOrEditStudentDto({
                    id: undefined,
                    className: this.schoolName,
                    city: '',
                    userId: this.StudentSelected?.student.id,
                    sessionSupervisorId: this.StudentSelected?.student.sessionSupervisorId,
                }),
            )
            .subscribe((res) => {
                this.notify.success('Student Added Successfully');
                this.Close();
            });
    }
    Close() {
        this._dialogSharedService.hideDialog(this.Add_Student_dialog);
    }
}

