import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListComponent } from './list.component';
import { AppSharedModule } from '@app/shared/app-shared.module';
import { PaginatorComponent } from '@app/shared/common/paginator/paginator.component';
import { ActionButtonComponent } from '@app/shared/components/action-button/action-button.component';
import { DropdownFieldComponent } from '@app/shared/components/fields/dropdown-field/dropdown-field.component';
import { FiltersComponent } from '@app/shared/components/filters/filters.component';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AddSessionsModalComponent } from '../../components/add-session-modal/add-session-modal.component';
import { AutoCompleteComponent } from '@app/shared/components/fields/auto-complete/auto-complete.component';
import { DateComponent } from '@app/shared/components/fields/date/date.component';
import { DialogSharedModule } from '@app/shared/components/dialog-shared/dialog-shared.module';
import { CalendarModule } from 'primeng/calendar';
import { SkeletonComponent } from '../../../../shared/components/skeleton/skeleton.component';
import { AutoCompleteFeildModule } from '@app/shared/components/auto-complete-feild/auto-complete-feild.module';

@NgModule({
    imports: [
        CommonModule,
        AppSharedModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule.forChild([
            {
                path: '',
                component: ListComponent,
            },
        ]),
        FiltersComponent,
        DropdownFieldComponent,
        ActionButtonComponent,
        PaginatorComponent,
        DropdownFieldComponent,
        DateComponent,
        AutoCompleteComponent,
        DialogSharedModule,
        CalendarModule,
        SkeletonComponent,
        AutoCompleteFeildModule,
    ],
    declarations: [ListComponent, AddSessionsModalComponent],
})
export class ListModule {}
