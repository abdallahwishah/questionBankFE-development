import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VerifyFaceRegonitionComponent } from './verify-face-regonition.component';
import { RouterModule } from '@node_modules/@angular/router';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild([
            {
                path: '',
                component: VerifyFaceRegonitionComponent,
                pathMatch: 'full',
            },
        ]),
    ],
    declarations: [VerifyFaceRegonitionComponent],
})
export class VerifyFaceRegonitionModule {}
