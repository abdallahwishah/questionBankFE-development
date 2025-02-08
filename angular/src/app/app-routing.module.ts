import { NgModule } from '@angular/core';
import {
    NavigationEnd,
    NavigationStart,
    RouteConfigLoadEnd,
    RouteConfigLoadStart,
    Router,
    RouterModule,
} from '@angular/router';
import { AppComponent } from './app.component';
import { AppRouteGuard } from './shared/common/auth/auth-route-guard';
import { NotificationsComponent } from './shared/layout/notifications/notifications.component';
import { NgxSpinnerService } from 'ngx-spinner';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: 'app',
                component: AppComponent,
                canActivate: [AppRouteGuard],
                canActivateChild: [AppRouteGuard],
                children: [
                    {
                        path: '',
                        children: [
                            { path: 'notifications', component: NotificationsComponent },
                            { path: '', redirectTo: '/app/main/dashboard', pathMatch: 'full' },
                        ],
                    },
                    {
                        path: 'main',
                        loadChildren: () => import('app/main/main.module').then((m) => m.MainModule), //Lazy load main module
                        data: { preload: true },
                    },

                    {
                        path: 'admin',
                        loadChildren: () => import('app/admin/admin.module').then((m) => m.AdminModule), //Lazy load admin module
                        data: { preload: true },
                        canLoad: [AppRouteGuard],
                    },
                    {
                        path: '**',
                        redirectTo: 'notifications',
                    },
                ],
            },
            {
                path: 'student',
                loadChildren: () => import('app/student/student.module').then((m) => m.StudentModule), //Lazy load main module
                data: { preload: true },
            },
            {
                path: 'supervisor',
                loadChildren: () => import('app/supervisor/supervisor.module').then((m) => m.SupervisorModule), //Lazy load main module
                data: { preload: true },
            },
            {
                path: 'printer-exam/:id',
                loadComponent: () =>
                    import('app/main/exams/modules/view-exam-print/view-exam-print.component').then(
                        (m) => m.ViewExamPrintComponent,
                    ), //Lazy load main module
                data: { preload: true },
            },
        ]),
    ],
    exports: [RouterModule],
})
export class AppRoutingModule {
    constructor(
        private router: Router,
        private spinnerService: NgxSpinnerService,
    ) {
        router.events.subscribe((event) => {
            if (event instanceof NavigationStart) {
                spinnerService.show();
            }

            if (event instanceof NavigationEnd) {
                document.querySelector('meta[property=og\\:url').setAttribute('content', window.location.href);
                spinnerService.hide();
            }
        });
    }
}
