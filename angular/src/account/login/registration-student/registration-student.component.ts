import { Component, Injector, OnInit } from '@angular/core';
import { Router } from '@node_modules/@angular/router';
import { AppComponentBase } from '@shared/common/app-component-base';
import { StudentsServiceProxy } from '@shared/service-proxies/service-proxies';

@Component({
    selector: 'app-registration-student',
    templateUrl: './registration-student.component.html',
    styleUrls: ['./registration-student.component.css'],
})
export class RegistrationStudentComponent extends AppComponentBase implements OnInit {
    identityNumber: string;

    constructor(
        injector: Injector,
        private studentService: StudentsServiceProxy,
        private router: Router,
    ) {
        super(injector);
    }

    ngOnInit() {}

    check() {
        this.studentService.getStudentInfo(this.identityNumber).subscribe({
            next: (result) => {
                this.router.navigate(['account/upload-info'], { state: result });
            },
            error: () => {
                this.router.navigate(['account/login'], { replaceUrl: true });
            },
        });
    }
}
