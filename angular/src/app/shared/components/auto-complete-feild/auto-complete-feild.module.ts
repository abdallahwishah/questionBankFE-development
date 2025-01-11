import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AutoCompleteFeildComponent } from './auto-complete-feild.component';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ReactiveFormsModule } from '@angular/forms';
import { PopupForPickComponent } from './popup-for-pick/popup-for-pick.component';
import { AppSharedModule } from '@app/shared/app-shared.module';

@NgModule({
    declarations: [AutoCompleteFeildComponent, PopupForPickComponent],
    imports: [CommonModule, AutoCompleteModule, ReactiveFormsModule, AppSharedModule],
    exports: [AutoCompleteFeildComponent],
})
export class AutoCompleteFeildModule {}
