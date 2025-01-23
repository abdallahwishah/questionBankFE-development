import { Component, Injector, OnInit } from '@angular/core';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { ProfileServiceProxy } from '@shared/service-proxies/service-proxies';

@Component({
    standalone: true,
    selector: 'app-student-header',
    templateUrl: './student-header.component.html',
    styleUrls: ['./student-header.component.css'],
})
export class StudentHeaderComponent extends AppComponentBase implements OnInit {
    userName: any;
    profilePicture = AppConsts.appBaseUrl + '/assets/common/images/default-profile-picture.png';
    constructor(
        private _injector: Injector,
        private _profileServiceProxy: ProfileServiceProxy,
    ) {
        super(_injector);
    }

    ngOnInit() {
        this.userName = this.appSession.user.userName;
        this.getProfilePicture();
    }

    getProfilePicture(): void {
        this._profileServiceProxy.getProfilePicture().subscribe((result) => {
            if (result && result.profilePicture) {
                this.profilePicture = 'data:image/jpeg;base64,' + result.profilePicture;
            }
        });
    }
}
