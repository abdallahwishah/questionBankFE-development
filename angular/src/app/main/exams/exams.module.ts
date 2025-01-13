import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExamsComponent } from './exams.component';
import { RouterModule } from '@node_modules/@angular/router';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild([
            {
                path: '',
                component: ExamsComponent,
                children: [
                    {
                        path: '',
                        loadChildren: () => import('./modules/list/list.module').then((m) => m.ListModule),
                    },
                    {
                        path: 'view',
                        loadChildren: () =>
                            import('./modules/view-exam/view-exam.module').then((m) => m.ViewExamModule),
                    },

                ],
            },
        ]),
    ],
    declarations: [ExamsComponent]
})
export class ExamsModule { }
