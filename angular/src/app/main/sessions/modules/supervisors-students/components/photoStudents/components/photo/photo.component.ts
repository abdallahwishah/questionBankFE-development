import { DialogSharedService } from './../../../../../../../../shared/components/dialog-shared/dialog-shared.service';
import { Component, Injector, OnInit } from '@angular/core';
import { UniqueNameComponents } from '@app/shared/Models/UniqueNameComponents';
import { HttpClient } from '@angular/common/http';
import { AppComponentBase } from '@shared/common/app-component-base';
import { GetExamAttemptPhotoForViewDto } from '@shared/service-proxies/service-proxies';
import { AppConsts } from '@shared/AppConsts';

@Component({
    selector: 'app-photo',
    templateUrl: './photo.component.html',
    styleUrls: ['./photo.component.css'],
})
export class PhotoComponent extends AppComponentBase implements OnInit {
    View_Student_Photo_dialog = UniqueNameComponents.View_Student_Photo_dialog;
    item: GetExamAttemptPhotoForViewDto;
    imageUrl;
    constructor(
        injector: Injector,
        private dialogSharedService: DialogSharedService,
        private http: HttpClient,
    ) {
        super(injector);
    }

    ngOnInit() {
        this.item = new GetExamAttemptPhotoForViewDto();
    }

    show(item) {
        this.item = item;
        this.http
            .get(
                `${AppConsts.remoteServiceBaseUrl}/File/DownloadBinaryFile?id=${item.examAttemptPhoto.binaryObjectId}&contentType=image/jpeg&fileName=image.jpeg`,
                {
                    responseType: 'blob',
                },
            )
            .subscribe((blob) => {
                this.imageUrl = URL.createObjectURL(blob);
                console.log(this.imageUrl);
            });

        this.dialogSharedService.showDialog(this.View_Student_Photo_dialog, {});
    }

    close() {
        this.dialogSharedService.hideDialog(this.View_Student_Photo_dialog, {});
    }
}
