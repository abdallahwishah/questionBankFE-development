﻿import { Component, Injector, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppAuthService } from '@app/shared/common/auth/app-auth.service';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AccountServiceProxy, ChangeEmailInput, ResolveTenantIdInput } from '@shared/service-proxies/service-proxies';

@Component({
    template: `
        <div class="login-form">
            <div class="alert alert-success text-center" role="alert">
                <div class="alert-text">{{ waitMessage }}</div>
            </div>
        </div>
    `,
})

export class ChangeEmailComponent extends AppComponentBase implements OnInit {
    waitMessage: string;

    model: ChangeEmailInput = new ChangeEmailInput();

    constructor(
        injector: Injector,
        private _accountService: AccountServiceProxy,
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _appAuthService: AppAuthService
    ) {
        super(injector);
    }

    ngOnInit(): void {
        this.waitMessage = this.l('PleaseWaitToConfirmYourEmailMessage');

        this.model.c = this._activatedRoute.snapshot.queryParams['c'];

        this._accountService.resolveTenantId(new ResolveTenantIdInput({ c: this.model.c })).subscribe((tenantId) => {
            let reloadNeeded = this.appSession.changeTenantIfNeeded(tenantId);

            if (reloadNeeded) {
                return;
            }

            this._accountService.changeEmail(this.model).subscribe(() => {
                this.notify.success(this.l('YourEmailIsChangedMessage'), '', {
                    willClose: () => {

                        if (this.appSession.user) {
                            this._appAuthService.logout(true, '/account/login');
                        } else {
                            this._router.navigate(['account/login']);
                        }

                    },
                });
            });
        });
    }

    parseTenantId(tenantIdAsStr?: string): number {
        let tenantId = !tenantIdAsStr ? undefined : parseInt(tenantIdAsStr, 10);
        if (Number.isNaN(tenantId)) {
            tenantId = undefined;
        }

        return tenantId;
    }
}
