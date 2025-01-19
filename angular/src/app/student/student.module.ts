import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentComponent } from './student.component';
import { RouterModule } from '@node_modules/@angular/router';

@NgModule({
    imports: [
        CommonModule,

        RouterModule.forChild([
            {
                path: '',
                component: StudentComponent,
                children: [
                    {
                        path: 'exam-viewer',
                        loadComponent: () =>
                            import('./exam-viewer-and-attempt/exam-viewer-and-attempt.component').then(
                                (m) => m.ExamViewerAndAttemptComponent,
                            ),
                    },
                    {
                        path: 'exam-attempt',
                        loadComponent: () =>
                            import('./exam-viewer-and-attempt/exam-viewer-and-attempt.component').then(
                                (m) => m.ExamViewerAndAttemptComponent,
                            ),
                    },
                ],
            },
        ]),
    ],
    declarations: [StudentComponent],
})
export class StudentModule {}
