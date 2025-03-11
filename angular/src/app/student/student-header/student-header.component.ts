import { Component, Injector, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AppAuthService } from '@app/shared/common/auth/app-auth.service';
import { CommonModule, Location } from '@angular/common';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { ProfileServiceProxy, SessionServiceProxy } from '@shared/service-proxies/service-proxies';

@Component({
    standalone: true,
    imports: [CommonModule, RouterModule],
    selector: 'app-student-header',
    templateUrl: './student-header.component.html',
    styleUrls: ['./student-header.component.css'],
})
export class StudentHeaderComponent extends AppComponentBase implements OnInit {
    userName: any;
    showWhiteBg: boolean = false; // default

    profilePicture = AppConsts.appBaseUrl + '/assets/common/images/default-profile-picture.png';
    constructor(
        private _injector: Injector,
        private _profileServiceProxy: ProfileServiceProxy,
        private _router: Router,
        private _sessionServiceProxy: SessionServiceProxy,
        private _appAuthService: AppAuthService,
        private _activatedRoute: ActivatedRoute,
        private location:Location
    ) {
        super(_injector);
    }

    ngOnInit() {
        this.userName = this.appSession.user.userName;
        this.getProfilePicture();
        this._router.events.subscribe((event: any) => {
            if (event.routerEvent.url.includes('supervisor') || event.routerEvent.url.includes('student')) {
                this.showWhiteBg = true;
            } else {
                this.showWhiteBg = false;
            }
        });
    }

    getProfilePicture(): void {
        this._profileServiceProxy.getProfilePicture().subscribe((result) => {
            if (result && result.profilePicture) {
                this.profilePicture = 'data:image/jpeg;base64,' + result.profilePicture;
            }
        });
    }
    logout() {
        this._appAuthService.logout();
    }
    navigateToHome() {
        if(this._router.url.includes('exam-viewer')){

            this.location.back()
        }else{
            this._router.navigate(['./'], {
                relativeTo: this._activatedRoute,
            });
        }

    }
}
