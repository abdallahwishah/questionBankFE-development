import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuditComponent } from './audit.component';
import { RouterModule } from '@node_modules/@angular/router';

@NgModule({
    imports: [
        CommonModule,
        CommonModule,
        RouterModule.forChild([
            {
                path: '',
                component: AuditComponent,
                children: [
                    {
                        path: '',
                        loadChildren: () => import('./modules/list/list.module').then((m) => m.ListModule),
                    },
                    {
                        path: 'answers/:id',
                        loadChildren: () =>
                            import('../correcting/modules/answers/answers.module').then((m) => m.AnswersModule),
                    }
                ],
            },
        ]),
    ],
    declarations: [AuditComponent]
})
export class AuditModule { }
