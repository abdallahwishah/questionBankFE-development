﻿import { NgModule } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { AppUiCustomizationService } from '@shared/common/ui/app-ui-customization.service';
import { AccountComponent } from './account.component';
import { AccountRouteGuard } from './auth/account-route-guard';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: AccountComponent,
                children: [
                    { path: '', redirectTo: 'login', pathMatch: 'full' },
                    {
                        path: 'login',
                        loadChildren: () => import('./login/login.module').then((m) => m.LoginModule),
                        canActivate: [AccountRouteGuard],
                    },
                    {
                        path: 'register',
                        loadChildren: () => import('./register/register.module').then((m) => m.RegisterModule),
                        canActivate: [AccountRouteGuard],
                    },
                    {
                        path: 'register-tenant',
                        loadChildren: () =>
                            import('./register/register-tenant.module').then((m) => m.RegisterTenantModule),
                        canActivate: [AccountRouteGuard],
                    },
                    {
                        path: 'register-tenant-result',
                        loadChildren: () =>
                            import('./register/register-tenant-result.module').then(
                                (m) => m.RegisterTenantResultModule
                            ),
                        canActivate: [AccountRouteGuard],
                    },
                    {
                        path: 'forgot-password',
                        loadChildren: () =>
                            import('./password/forgot-password.module').then((m) => m.ForgotPasswordModule),
                        canActivate: [AccountRouteGuard],
                    },
                    {
                        path: 'reset-password',
                        loadChildren: () =>
                            import('./password/reset-password.module').then((m) => m.ResetPasswordModule),
                        canActivate: [AccountRouteGuard],
                    },
                    {
                        path: 'email-activation',
                        loadChildren: () =>
                            import('./email-activation/email-activation.module').then((m) => m.EmailActivationModule),
                        canActivate: [AccountRouteGuard],
                    },
                    {
                        path: 'change-email',
                        loadChildren: () =>
                            import('./change-email/change-email.module').then((m) => m.ChangeEmailModule),
                    },
                    {
                        path: 'confirm-email',
                        loadChildren: () =>
                            import('./email-activation/confirm-email.module').then((m) => m.EmailConfirmModule),
                    },
                    {
                        path: 'send-code',
                        loadChildren: () =>
                            import('./login/send-two-factor-code.module').then((m) => m.SendTwoFactorCodeModule),
                        canActivate: [AccountRouteGuard],
                    },
                    {
                        path: 'verify-code',
                        loadChildren: () =>
                            import('./login/validate-two-factor-code.module').then(
                                (m) => m.ValidateTwoFactorCodeModule
                            ),
                        canActivate: [AccountRouteGuard],
                    },
                    {
                        path: 'gateway-selection',
                        loadChildren: () => import('./payment/gateway-selection.module').then((m) => m.GatewaySelectionModule),
                    },
                    {
                        path: 'select-edition',
                        loadChildren: () =>
                            import('./register/select-edition.module').then((m) => m.SelectEditionModule),
                    },
                    {
                        path: 'paypal-pre-payment',
                        loadChildren: () =>
                            import('./payment/paypal/paypal-pre-payment.module').then((m) => m.PaypalPrePaymentModule),
                    },
                    {
                        path: 'stripe-pre-payment',
                        loadChildren: () =>
                            import('./payment/stripe/stripe-pre-payment.module').then((m) => m.StripePrePaymentModule),
                    },
                    {
                        path: 'stripe-post-payment',
                        loadChildren: () =>
                            import('./payment/stripe/stripe-post-payment.module').then(
                                (m) => m.StripePostPaymentModule
                            ),
                    },
                    {
                        path: 'stripe-cancel-payment',
                        loadChildren: () =>
                            import('./payment/stripe/stripe-cancel-payment.module').then(
                                (m) => m.StripeCancelPaymentModule
                            ),
                    },
                    {
                        path: 'buy-succeed',
                        loadChildren: () =>
                            import('./buy-succeed/buy-succeed.module').then((m) => m.BuySucceedModule),
                    },
                    {
                        path: 'extend-succeed',
                        loadChildren: () =>
                            import('./extend-succeed/extend-succeed.module').then((m) => m.ExtendSucceedModule),
                    },
                    {
                        path: 'upgrade-succeed',
                        loadChildren: () =>
                            import('./upgrade-succeed/upgrade-succeed.module').then((m) => m.UpgradeSucceedModule),
                    },
                    {
                        path: 'session-locked',
                        loadChildren: () =>
                            import('./login/session-lock-screen.module').then((m) => m.SessionLockScreenModule),
                    },
                    { path: '**', redirectTo: 'login' },
                ],
            },
        ]),
    ],
    exports: [RouterModule],
})
export class AccountRoutingModule {
    constructor(private router: Router, private _uiCustomizationService: AppUiCustomizationService) {
        router.events.subscribe((event: NavigationEnd) => {
            setTimeout(() => {
                this.toggleBodyCssClass(event.url);
            }, 0);
        });
    }

    toggleBodyCssClass(url: string): void {
        if (!url) {
            this.setAccountModuleBodyClassInternal();
            return;
        }

        if (url.indexOf('/account/') >= 0) {
            this.setAccountModuleBodyClassInternal();
        } else {
            document.body.className = this._uiCustomizationService.getAppModuleBodyClass();
        }
    }

    setAccountModuleBodyClassInternal(): void {
        let currentBodyClass = document.body.className;

        let classesToRemember = '';

        if (currentBodyClass.indexOf('swal2-toast-shown') >= 0) {
            classesToRemember += ' swal2-toast-shown';
        }

        document.body.className = this._uiCustomizationService.getAccountModuleBodyClass() + ' ' + classesToRemember;
    }
}
