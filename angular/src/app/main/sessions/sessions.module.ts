import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionsComponent } from './sessions.component';
import { RouterModule } from '@node_modules/@angular/router';
import { ExamAttemptPhotosServiceProxy, SessionsServiceProxy } from '@shared/service-proxies/service-proxies';
import { PhotoStudentsComponent } from './modules/supervisors-students/components/photoStudents/photoStudents.component';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild([
            {
                path: '',
                component: SessionsComponent,
                children: [
                    {
                        path: '',
                        loadChildren: () => import('./modules/list/list.module').then((m) => m.ListModule),
                    },
                    {
                        path: 'schools/:id',
                        loadChildren: () =>
                            import('../sessions/modules/schools/schools.module').then((m) => m.SchoolsModule),
                    },
                    {
                        path: 'supervisors-students/:id/:classId',
                        loadChildren: () =>
                            import('../sessions/modules/supervisors-students/supervisors-students.module').then(
                                (m) => m.SupervisorsStudentsModule,
                            ),
                    },
                    {
                        path: 'photos/:id',
                        component: PhotoStudentsComponent,
                    },
                ],
            },
        ]),
    ],
    declarations: [SessionsComponent],
    providers: [SessionsServiceProxy, ExamAttemptPhotosServiceProxy ],
    exports: [SessionsComponent],
})
export class SessionsModule {}
