import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListComponent } from './list.component';
import { AppSharedModule } from '@app/shared/app-shared.module';
import { RouterModule } from '@node_modules/@angular/router';
import { FiltersComponent } from '../../../../shared/components/filters/filters.component';
import { ActionButtonComponent } from '../../../../shared/components/action-button/action-button.component';
import { PaginatorComponent } from '@app/shared/common/paginator/paginator.component';
import { WarningModalComponent } from '../../components/warning-modal/warning-modal.component';
import { CopyTemplateModalComponent } from '../../components/copy-template-modal/copy-template-modal.component';
import { DropdownFieldComponent } from '@app/shared/components/fields/dropdown-field/dropdown-field.component';
import { SkeletonComponent } from '../../../../shared/components/skeleton/skeleton.component';
import { AutoCompleteFeildModule } from '@app/shared/components/auto-complete-feild/auto-complete-feild.module';
 import { SafeTextPipe } from '@app/shared/pipes/safe-text.pipe';
import { TooltipModule } from 'primeng/tooltip';

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
        WarningModalComponent,
        CopyTemplateModalComponent,
        DropdownFieldComponent,
        SkeletonComponent,
        AutoCompleteFeildModule,
        TooltipModule,
        SafeTextPipe,
    ],
    declarations: [ListComponent],
})
export class ListModule {}
