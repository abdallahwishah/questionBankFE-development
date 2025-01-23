import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupervisorComponent } from './supervisor.component';
import { RouterModule } from '@node_modules/@angular/router';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild([
            {
                component: SupervisorComponent,
                path: '',
            },
        ]),
    ],
    declarations: [SupervisorComponent],
})
export class SupervisorModule {}
