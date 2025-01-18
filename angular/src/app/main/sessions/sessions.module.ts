import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionsComponent } from './sessions.component';
import { RouterModule } from '@node_modules/@angular/router';
import { SessionsServiceProxy } from '@shared/service-proxies/service-proxies';

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
  declarations: [SessionsComponent],
  providers:[SessionsServiceProxy]
})
export class SessionsModule { }
