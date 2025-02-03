import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AppConsts } from '@shared/AppConsts';
import { LocalStorageService } from '@shared/utils/local-storage.service';

@Component({
    selector: 'app-userImage',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './userImage.component.html',
    styleUrls: ['./userImage.component.css'],
})
export class UserImageComponent implements OnInit,OnChanges {
    @Input() userId: any;
    @Input() classImg: any;
    constructor(private _localStorageService: LocalStorageService) {}
    profilePictureUrl: any;
    ngOnInit() {
        this.GetUserID()
    }
    ngOnChanges(change: any) {

        this.GetUserID()
    }
    GetUserID() {
        this._localStorageService.getItem(AppConsts.authorization.encrptedAuthTokenName, (err, value) => {
            let profilePictureUrl =
                AppConsts.remoteServiceBaseUrl +
                '/Profile/GetProfilePictureByUser?userId=' +
                this.userId +
                '&' +
                AppConsts.authorization.encrptedAuthTokenName +
                '=' +
                encodeURIComponent(value.token);
            this.profilePictureUrl = profilePictureUrl;
            console.log('profilePictureUrl',this.userId,profilePictureUrl)
        });
    }
}
