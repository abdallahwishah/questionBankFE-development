import { tap, map } from 'rxjs/operators';
import {
    HttpClient,
    HttpParams,
    HttpRequest,
    HttpResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { concat, forkJoin, Observable, merge, BehaviorSubject, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class HttpService {
    baseUrl: string = ''

    constructor(private http: HttpClient) {}

    get(route: string, params: any = null) {
        return this.http.get<any>(
            (route?.includes('http') ? '' : this.baseUrl) + route,
            {
                params: this.convartParams(params),
            }
        );
    }
    getDatafromAlotOfApi(
        arrRoute: string[],
        params: any = null,
        Type?: string
    ): Observable<any> {
        let Arr$: Observable<any>[] = [];
        arrRoute.forEach((route) => {
            Arr$.push(
                this.http.get<any>(this.baseUrl + route, {
                    params: this.convartParams(params),
                })
            );
        });
        if (Type == 'concat') {
            return concat(Arr$);
        } else if (Type == 'merge') {
            return merge(Arr$);
        } else {
            return forkJoin(Arr$).pipe(
                map((data: any[]) => {
                    let newData: any[] = [];
                    data.forEach((value) => {
                        newData = [...newData, ...value];
                    });
                    return newData;
                })
            );
        }
    }
    saveDataInParam(route: string, body: any) {
        return this.http.post(
            this.baseUrl + route,
            {},
            {
                params: this.convartParams(body),
            }
        );
    }
    ExportToExcel(route: string, params: any = null) {
        return this.http
            .get<any>(this.baseUrl + route, {
                params: this.convartParams(params),
            })
            .pipe(
                tap((value) => {
                    var data: any;
                    if (value instanceof Object) {
                        data = value.Data;
                    }
                    if (value instanceof Array) {
                        data = value;
                    }
                    // this.downloadExcel(data, 'Excel');
                })
            );
    }
    // downloadExcel(data: any, Name: string) {
    //     const EXCEL_TYPE =
    //         'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    //     const EXCEL_EXTENSION = '.xlsx';
    //     const workSheet = XLSX.utils.json_to_sheet(data);
    //     const workBook = {
    //         Sheets: {
    //             testingSheet: workSheet,
    //         },
    //         SheetNames: ['testingSheet'],
    //     };
    //     const excelBuffer = XLSX.write(workBook, {
    //         bookType: 'xlsx',
    //         type: 'array',
    //     });
    //     const blobData = new Blob([excelBuffer], {
    //         type: EXCEL_TYPE,
    //     });
    //     saveAs(blobData, Name);
    // }
    getCodes(PageName: string) {
        return this.get('constant', { ScreenName: PageName });
    }
    post(route: string, body?: any) {
        return this.http.post(this.baseUrl + route, this.convartData(body));
    }
    postArr(route: string, body?: any) {
        return this.http.post(this.baseUrl + route, body);
    }
    put(route: string, body: any) {
        return this.http.put(this.baseUrl + route, this.convartData(body));
    }
    saveData(route: string, body: any[]) {
        return this.http.post(this.baseUrl + route, body);
    }
    delete(route: string, params: any = null) {
        return this.http.delete(this.baseUrl + route, {
            params: this.convartParams(params),
        });
    }

    getBase46(route: string, params: any = null) {
        return this.http.get(this.baseUrl + route, {
            params: this.convartParams(params),
        });
    }

    getBlob(route: string, params: any = null): Observable<HttpResponse<Blob>> {
        return this.http
            .get(this.baseUrl + route, {
                params: this.convartParams(params),
                responseType: 'blob' as 'json',
                observe: 'response', // Ensure we get the full response including headers
            }) // Explicit type casting
            .pipe(
                tap(
                    (response: HttpResponse<Blob>) => {
                        console.log('Full Response:', response);

                        const contentDisposition = response.headers.get(
                            'Content-Disposition'
                        );
                        console.log('Content-Disposition:', contentDisposition);
                        let filename = 'downloaded_file';

                        if (contentDisposition) {
                            // Check for filename*
                            let filenameMatch =
                                /filename\*=UTF-8''([^;\n]*)/.exec(
                                    contentDisposition
                                );
                            if (filenameMatch && filenameMatch[1]) {
                                filename = decodeURIComponent(
                                    filenameMatch[1].replace(/['"]/g, '')
                                );
                            } else {
                                // Fallback to filename
                                filenameMatch =
                                    /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(
                                        contentDisposition
                                    );
                                if (filenameMatch && filenameMatch[1]) {
                                    filename = filenameMatch[1].replace(
                                        /['"]/g,
                                        ''
                                    );
                                }
                            }
                        }

                        console.log('Extracted filename:', filename);

                        const blob = new Blob([response.body], {
                            type: response.headers.get('Content-Type'),
                        });
                        const url = window.URL.createObjectURL(blob);
                        const anchor = document.createElement('a');
                        anchor.href = url;
                        anchor.download = filename;
                        document.body.appendChild(anchor);
                        anchor.click();
                        document.body.removeChild(anchor);
                        window.URL.revokeObjectURL(url);
                    },
                    (error: any) => {
                        console.error('Download error:', error);
                    }
                )
            );
    }
    saveFormData(route: string, body: any) {
        const data = new FormData();
        Object.keys(body).forEach((key) => {
            if (body[key] instanceof Array) {
                // body[key] = moment(body[key]).format('YYYY-MM-DD');
                body[key].forEach((element: any) => {
                    data.append(key, element);
                });
            } else {
                data.append(key, body[key]);
            }
        });
        return this.http.post(this.baseUrl + route, data, {
            reportProgress: true,
        });
    }
    saveFormDataWithProgress(route: string, body: any) {
        const data = new FormData();
        Object.keys(body).forEach((key) => {
            if (body[key] instanceof Array) {
                // body[key] = moment(body[key]).format('YYYY-MM-DD');
                body[key].forEach((element: any) => {
                    data.append(key, element);
                });
            } else {
                data.append(key, body[key]);
            }
        });

        const req = new HttpRequest('POST', this.baseUrl + route, data, {
            reportProgress: true,
        });

        return this.http.request(req);
    }
    getFiles(route: string, params: any = null) {
        return this.http
            .get(this.baseUrl + route, {
                params: this.convartParams(params),
            })
            .pipe();
    }

    private convartData(body: any) {
        let newValue = { ...body };
        Object.keys(newValue).forEach((key) => {
            if (newValue[key] == null) delete newValue[key];
            if (newValue[key] instanceof Date) {
                // formate date to yyyy-MM-dd and solve issue mines 1 day

                newValue[key] = new Date(newValue[key]).toLocaleDateString('en-CA', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                  }).replace(/\//g, '-');            }
        });
        return newValue;
    }

    convartParams(params: any): any {
        if (params) {
            let newParams = this.convartData(params);
            let httpParams = new HttpParams();
            Object.keys(newParams).forEach(function (key) {
                httpParams = httpParams.set(key, newParams[key] ?? '');
            });
            return httpParams;
        } else {
            return null;
        }
    }

    private getOutputType(t: string) {
        switch (t) {
            case 'p':
                return 'application/pdf';
            case 'w':
                return 'application/msword';
            case 'e':
                return 'application/vnd.ms-excel';
            default:
                return 'application/pdf';
        }
    }
}
