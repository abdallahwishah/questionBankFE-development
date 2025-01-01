import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubjectsComponent } from './subjects.component';
import { RouterModule } from '@node_modules/@angular/router';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
        {
            path: '',
            component: SubjectsComponent,
            children: [
                {
                    path: '',
                    loadChildren: () => import('./modules/list/list.module').then((m) => m.ListModule),
                },
               /*  {
                    path: 'answers/:id',
                    loadChildren: () =>
                        import('../correcting/modules/answers/answers.module').then((m) => m.AnswersModule),
                } */

            ],
        },
    ]),
  ],
  declarations: [SubjectsComponent]
})
export class SubjectsModule { }
