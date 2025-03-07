import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SchoolsComponent } from './schools.component';
import { AppSharedModule } from '@app/shared/app-shared.module';
import { DropdownFieldComponent } from '@app/shared/components/fields/dropdown-field/dropdown-field.component';
import { PaginatorComponent } from '@app/shared/common/paginator/paginator.component';
import { ActionButtonComponent } from '@app/shared/components/action-button/action-button.component';
import { AutoCompleteFeildModule } from '@app/shared/components/auto-complete-feild/auto-complete-feild.module';
import { FiltersComponent } from '@app/shared/components/filters/filters.component';
import { ExtendTimeSessionComponent } from '../supervisors-students/components/extendTimeSession/extendTimeSession.component';

@NgModule({
    imports: [
        CommonModule,
        AppSharedModule,
        RouterModule.forChild([
            {
                path: '',
                component: SchoolsComponent,
            },
        ]),
        DropdownFieldComponent,
        ActionButtonComponent,
        PaginatorComponent,
        AutoCompleteFeildModule,
        FiltersComponent,ExtendTimeSessionComponent
    ],
    declarations: [SchoolsComponent],
})
export class SchoolsModule {}
