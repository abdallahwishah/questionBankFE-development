import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuestionBankComponent } from './question-bank.component';
import { RouterModule } from '@node_modules/@angular/router';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild([
            {
                path: '',
                component: QuestionBankComponent,
                children: [
                    {
                        path: '',
                        loadChildren: () => import('./modules/list/list.module').then((m) => m.ListModule),
                    },
                    {
                        path: 'addQuestion',
                        loadChildren: () =>
                            import('./modules/add-question/add-question.module').then((m) => m.AddQuestionModule),
                    },
                ],
            },
        ]),
    ],
    declarations: [QuestionBankComponent],
})
export class QuestionBankModule {}
