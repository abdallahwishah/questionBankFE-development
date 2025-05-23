import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupervisorComponent } from './supervisor.component';
import { RouterModule } from '@node_modules/@angular/router';
import { StudentHeaderComponent } from '@app/student/student-header/student-header.component';

@NgModule({
    imports: [
        CommonModule,
        StudentHeaderComponent,
        RouterModule.forChild([
            {
                component: SupervisorComponent,
                path: '',
                children:[
                    {
                        path:'',
                        loadChildren: () => import('./../main/sessions/sessions.module').then((m) => m.SessionsModule),
                    },
                    {
                        path:'main',
                        loadChildren: () => import('./../main/sessions/sessions.module').then((m) => m.SessionsModule),
                    },

                ]
            },
        ]),
    ],
    declarations: [SupervisorComponent],
})
export class SupervisorModule {}
