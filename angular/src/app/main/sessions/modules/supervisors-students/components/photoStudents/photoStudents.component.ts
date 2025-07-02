import {
    ExamAttemptPhotosServiceProxy,
    ExamAttemptsServiceProxy,
    GetExamAttemptPhotoForViewDto,
    SessionServiceProxy,
} from '@shared/service-proxies/service-proxies';
import { Component, Injector, OnInit } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { ActivatedRoute, Router } from '@node_modules/@angular/router';
import { HttpClient } from '@angular/common/http';
import { AppConsts } from '@shared/AppConsts';
import { lastValueFrom } from 'rxjs';

@Component({
    selector: 'app-photoStudents',
    templateUrl: './photoStudents.component.html',
    styleUrls: ['./photoStudents.component.css'],
})
export class PhotoStudentsComponent extends AppComponentBase implements OnInit {
    examAttemptId: string;
    allPhotos: GetExamAttemptPhotoForViewDto[] = [];
    student;
    AppConsts = AppConsts;

    constructor(
        injector: Injector,
        private examAttemptsPhotos: ExamAttemptPhotosServiceProxy,
        private _ActivatedRoute: ActivatedRoute,
        private router: Router,
        private http: HttpClient,
    ) {
        super(injector);
    }

    ngOnInit() {
        this._ActivatedRoute.paramMap?.subscribe((params) => {
            this.examAttemptId = params?.get('id'); //.get('product');
        });

        this.student = history.state;
        console.log(this.student);
        this.getAllPhotos();
    }

    onImageLoadError(event: any): void {
        event.target.src = 'assets/common/images/image-not-available.png'; // or any fallback image path
    }

    getAllPhotos() {
        this.examAttemptsPhotos
            .getAll(undefined, undefined, this.examAttemptId, undefined, undefined, undefined)
            .subscribe((result) => {
                this.allPhotos = result.items;
            });
    }

    async getImageUrl(item: any): Promise<string> {
        try {
            const blob = await lastValueFrom(
                this.http.get(
                    `${AppConsts.remoteServiceBaseUrl}/File/DownloadBinaryFile?id=${item.examAttemptPhoto.binaryObjectId}&contentType=image/jpeg&fileName=image.jpeg`,
                    { responseType: 'blob' },
                ),
            );
            return await URL.createObjectURL(blob);
        } catch (err) {
            return 'assets/common/images/default-icon.png';
        }
    }

    async loadPreviewImage(image: any, item: any): Promise<void> {
        const url = await this.getImageUrl(item);
        image.previewImageSrc = url;
        image.src = url;
    }
}
