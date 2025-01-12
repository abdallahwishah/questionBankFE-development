import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TestsComponent } from './tests.component';
import { RouterModule } from '@node_modules/@angular/router';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild([
            {
                path: '',
                component: TestsComponent,
                children: [
                    {
                        path: '',
                        loadChildren: () => import('./modules/list/list.module').then((m) => m.ListModule),
                    },
                    {
                        path: 'view',
                        loadChildren: () =>
                            import('./modules/view-test/view-test.module').then((m) => m.ViewTestModule),
                    },

                ],
            },
        ]),
    ],
    declarations: [TestsComponent]
})
export class TestsModule { }
