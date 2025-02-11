import { ExamAttemptsServiceProxy, MoveStudentDto } from '@shared/service-proxies/service-proxies';

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

        private _dialogSharedService: DialogSharedService,
        private _examAttemptsServiceProxy: ExamAttemptsServiceProxy,
    ) {
        super(Injector);
    }

    ngOnInit() {
        console.log('this.StudentSelected :', this.StudentSelected);
    }
    Save() {
        // this._examAttemptsServiceProxy
        //     .addStudent(
        //         new MoveStudentDto({
        //          }),
        //     )
        //     .subscribe((res) => {
        //         this.notify.success('Student Added Successfully');
        //         this.Close();
        //     });
    }
    Close() {
        this._dialogSharedService.hideDialog(this.Add_Student_dialog);
    }
}
