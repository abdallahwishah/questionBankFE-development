import { BehaviorSubject, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { distinctUntilChanged, map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class DialogSharedService {
    dialogStore = new BehaviorSubject<{
        [ComponentType: string]: DialogModel;
    }>({});
    dialogStore$: Observable<{
        [ComponentType: string]: DialogModel;
    }> = this.dialogStore.asObservable();
    get dataDialog() {
        return this.dialogStore.value;
    }
    constructor() {}
    createInitValueForFilter(ComponentType: string) {
        this.updatedialogData(ComponentType, {
            configShow: { show: false, data: {} },
        });
    }
    SelectorFilterByComponent$(ComponentType: string, SelectorKey: string) {
        return this.dialogStore$.pipe(
            map((value: any) => {


                return value[ComponentType]?.[SelectorKey];
            }),
            distinctUntilChanged()
        );
    }
    updatedialogData(ComponentType: any, newState: DialogModel) {
        let filter = this.dataDialog;
        filter[ComponentType] = { ...filter[ComponentType], ...newState };
        let newStore = filter;
        this.dialogStore.next(newStore);
    }
    showDialog(ComponentType: string, data: any) {
        this.updatedialogData(ComponentType, {
            configShow: { show: true, data: data },
        });
    }
    hideDialog(ComponentType: string, data?: any) {
        this.updatedialogData(ComponentType, {
            configShow: { show: false, data: data },
        });
    }
    getDataByComponentType(ComponentType: string) {
        return this.dataDialog[ComponentType]?.configShow?.data;
    }
}
export interface DialogModel {
    configShow: { show: boolean; data: any };
}
