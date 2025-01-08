import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                children: [
                    {
                        path: 'dashboard',
                        loadChildren: () => import('./dashboard/dashboard.module').then((m) => m.DashboardModule),
                        data: { permission: 'Pages.Tenant.Dashboard' },
                    },
                    {
                        path: 'question-ids',
                        loadChildren: () => import('./classes/classes.module').then((m) => m.ClassesModule)
                    },
                    {
                        path: 'subjects',
                        loadChildren: () => import('./subjects/subjects.module').then((m) => m.SubjectsModule)
                    },
                    {
                        path: 'question-bank',
                        loadChildren: () => import('./question-bank/question-bank.module').then((m) => m.QuestionBankModule)
                    },
                    {
                        path: 'exams',
                        loadChildren: () => import('./tests/tests.module').then((m) => m.TestsModule)
                    },
                    {
                        path: 'sessions',
                        loadChildren: () => import('./sessions/sessions.module').then((m) => m.SessionsModule)
                    },
                    {
                        path: 'templates',
                        loadChildren: () => import('./templates/templates.module').then((m) => m.TemplatesModule)
                    },
                    {
                        path: 'correcting',
                        loadChildren: () => import('./correcting/correcting.module').then((m) => m.CorrectingModule)
                    },
                    {
                        path: 'audit',
                        loadChildren: () => import('./audit/audit.module').then((m) => m.AuditModule)
                    },
                    {
                        path: 'categories',
                        loadChildren: () => import('../shared/common/lookup/categories/category.module').then((m) => m.CategoryModule)
                    },
                    {
                        path: 'complexities',
                        loadChildren: () => import('../shared/common/lookup/complexities/complexity.module').then((m) => m.ComplexityModule)
                    },
                    {
                        path: 'studyLevels',
                        loadChildren: () => import('../shared/common/lookup/studyLevels/studyLevel.module').then((m) => m.StudyLevelModule)
                    },
                    {
                        path: 'studySubjects',
                        loadChildren: () => import('../shared/common/lookup/studySubjects/studySubject.module').then((m) => m.StudySubjectModule)
                    },
                    {
                        path: 'subjectGroups',
                        loadChildren: () => import('../shared/common/lookup/subjectGroups/subjectGroup.module').then((m) => m.SubjectGroupModule)
                    },
                    {
                        path: 'subjectUnits',
                        loadChildren: () => import('../shared/common/lookup/subjectUnits/subjectUnit.module').then((m) => m.SubjectUnitModule)
                    },
                    {
                        path: 'supportGroupItems',
                        loadChildren: () => import('../shared/common/lookup/supportGroupItems/supportGroupItem.module').then((m) => m.SupportGroupItemModule)
                    },
                    {
                        path: 'supportGroups',
                        loadChildren: () => import('../shared/common/lookup/supportGroups/supportGroup.module').then((m) => m.SupportGroupModule)
                    },
                    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
                    { path: '**', redirectTo: 'dashboard' },
                ],
            },
        ]),
    ],
    exports: [RouterModule],
})
export class MainRoutingModule {}
