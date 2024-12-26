import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TemplatesComponent } from './templates.component';
import { RouterModule } from '@node_modules/@angular/router';

@NgModule({
   imports: [
       CommonModule,
       RouterModule.forChild([
           {
               path: '',
               component: TemplatesComponent,
               children: [
                   {
                       path: '',
                       loadChildren: () => import('./modules/list/list.module').then((m) => m.ListModule),
                   },

               ],
           },
       ]),
     ],
  declarations: [TemplatesComponent]
})
export class TemplatesModule { }
