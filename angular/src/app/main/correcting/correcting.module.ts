import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CorrectingComponent } from './correcting.component';
import { RouterModule } from '@node_modules/@angular/router';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild([
            {
                path: '',
                component: CorrectingComponent,
                children: [
                    {
                        path: '',
                        loadChildren: () => import('./modules/list/list.module').then((m) => m.ListModule),
                    },
                    {
                        path: 'answers/:id',
                        loadChildren: () =>
                            import('../correcting/modules/answers/answers.module').then((m) => m.AnswersModule),
                    },
                    {
                        path: 'view/:id',
                        loadChildren: () =>
                            import('./modules/view-answers/view-answers.module').then((m) => m.ViewAnswersModule),
                    }

                ],
            },
        ]),
    ],
    declarations: [CorrectingComponent]
})
export class CorrectingModule { }
