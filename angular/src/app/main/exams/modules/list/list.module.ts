import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListComponent } from './list.component';
import { AppSharedModule } from '@app/shared/app-shared.module';
import { RouterModule } from '@node_modules/@angular/router';
import { FiltersComponent } from '../../../../shared/components/filters/filters.component';
import { ActionButtonComponent } from '../../../../shared/components/action-button/action-button.component';
import { PaginatorComponent } from '@app/shared/common/paginator/paginator.component';
import { AddExamModalComponent } from '../../components/add-exam-modal/add-exam-modal.component';
import { DropdownFieldComponent } from '@app/shared/components/fields/dropdown-field/dropdown-field.component';
import { SkeletonComponent } from '../../../../shared/components/skeleton/skeleton.component';
import { AddFileModalComponent } from '@app/main/question-bank/components/add-file-modal/add-file-modal.component';

@NgModule({
    imports: [
        CommonModule,
        AppSharedModule,
        RouterModule.forChild([
            {
                path: '',
                component: ListComponent,
            },
        ]),
        FiltersComponent,
        ActionButtonComponent,
        PaginatorComponent,
        AddExamModalComponent,
        DropdownFieldComponent,
        SkeletonComponent,
        AddFileModalComponent,
     ],
    declarations: [ListComponent],
})
export class ListModule {}
