import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentComponent } from './student.component';
import { RouterModule } from '@node_modules/@angular/router';
import { StudentHeaderComponent } from "./student-header/student-header.component";

@NgModule({
    imports: [
    CommonModule,
    RouterModule.forChild([
        {
            path: 'exam-attempt',
            loadComponent: () => import('./exam-viewer-and-attempt/exam-viewer-and-attempt.component').then((m) => m.ExamViewerAndAttemptComponent),
        },
        {
            path: '',
            component: StudentComponent,
            children: [
                {
                    path: 'main',
                    loadComponent: () => import('./student-main/student-main.component').then((m) => m.StudentMainComponent),
                },
                {
                    path: 'exam-viewer/:id',
                    loadComponent: () => import('./exam-viewer-and-attempt/exam-viewer-and-attempt.component').then((m) => m.ExamViewerAndAttemptComponent),
                },
                {
                    path: 'quiz',
                    loadComponent: () => import('./quiz/quiz.component').then((m) => m.QuizComponent),
                },
            ],
        },
    ]),
    StudentHeaderComponent
],
    declarations: [StudentComponent],
})
export class StudentModule {}
