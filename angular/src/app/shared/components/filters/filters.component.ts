import { Component, Injector, Input } from '@angular/core';
import { AppSharedModule } from '@app/shared/app-shared.module';
 import { AppComponentBase } from '@shared/common/app-component-base';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';

@Component({
    selector: 'app-filters',
    standalone: true,
    imports: [AppSharedModule, CalendarModule, CalendarModule, DropdownModule],
    templateUrl: './filters.component.html',
    styleUrl: './filters.component.css',
})
export class FiltersComponent extends AppComponentBase {
    @Input() classStyle;
    constructor(injector: Injector) {
        super(injector);
    }

    isPanelOpen = false;
    openPanel(): void {
        this.isPanelOpen = !this.isPanelOpen;
    }
}
