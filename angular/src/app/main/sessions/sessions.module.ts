import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionsComponent } from './sessions.component';
import { RouterModule } from '@node_modules/@angular/router';

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
                      path: 'answers/:id',
                      loadChildren: () =>
                          import('./modules/answers/answers.module').then((m) => m.AnswersModule),
                  },
              ],
          },
      ]),
    ],
  declarations: [SessionsComponent]
})
export class SessionsModule { }
