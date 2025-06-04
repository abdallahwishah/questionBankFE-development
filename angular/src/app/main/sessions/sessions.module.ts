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
                  },
                  {
                    path: 'schools/:id',
                    loadChildren: () =>
                        import('../sessions/modules/schools/schools.module').then((m) => m.SchoolsModule),
                },
                {
                    path: 'supervisors-students/:id/:classId',
                    loadChildren: () =>
                        import('../sessions/modules/supervisors-students/supervisors-students.module').then((m) => m.SupervisorsStudentsModule),
                }

              ],
          },
      ]),
    ],
  declarations: [SessionsComponent],
  providers:[SessionsServiceProxy],
  exports:[SessionsComponent]
})
export class SessionsModule { }
