import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AutoCompleteFeildComponent } from './auto-complete-feild.component';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ReactiveFormsModule } from '@angular/forms';
import { PopupForPickComponent } from './popup-for-pick/popup-for-pick.component';
import { AppSharedModule } from '@app/shared/app-shared.module';
import { CheckboxModule } from 'primeng/checkbox';

@NgModule({
    declarations: [AutoCompleteFeildComponent, PopupForPickComponent],
    imports: [
        CommonModule,
        AutoCompleteModule,
        ReactiveFormsModule,
        AppSharedModule,
        CheckboxModule, // Add this to imports
    ],
    exports: [AutoCompleteFeildComponent],
})
export class AutoCompleteFeildModule {}
