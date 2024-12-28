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
                  }
              ],
          },
      ]),
    ],
  declarations: [SessionsComponent]
})
export class SessionsModule { }
