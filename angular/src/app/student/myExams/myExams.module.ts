import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyExamsComponent } from './myExams.component';
import { AppSharedModule } from '@app/shared/app-shared.module';
import { PaginatorComponent } from '@app/shared/common/paginator/paginator.component';
import { FiltersComponent } from '@app/shared/components/filters/filters.component';
import { RouterModule } from '@node_modules/@angular/router';

@NgModule({
  imports: [
     CommonModule,
        AppSharedModule,
        RouterModule.forChild([
            {
                path: '',
                component: MyExamsComponent,
            },
        ]),
        FiltersComponent,
        PaginatorComponent,
  ],
  declarations: [MyExamsComponent]
})
export class MyExamsModule { }
