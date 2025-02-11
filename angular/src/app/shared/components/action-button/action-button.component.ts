import { Component, EventEmitter, Injector, Input, OnInit, Output } from '@angular/core';
import { RouterModule } from '@node_modules/@angular/router';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
    selector: 'app-action-button',
    standalone: true,
    imports: [RouterModule, OverlayPanelModule],
    templateUrl: './action-button.component.html',
    styleUrls: ['./action-button.component.css'],
})
export class ActionButtonComponent extends AppComponentBase {
    @Input() ActionsInfo: {
        routerLink: null;
        queryParams: null;
        hasPermission: null;
        hasCondition: null;
        label: null;
        customIcon: null;
        ngif: null;
        disabled: null;
    }[];

    @Input() IsSideBar: boolean = false;
    @Output() action = new EventEmitter();
    constructor(injector: Injector) {
        super(injector);
    }
    getIconClass(label: string, customIcon: string): string {
        switch (label) {
            case 'View':
            case 'Preview':
            case 'Viewer':
            case 'preview_task':
                return 'far fa-eye ';
            case 'checkOut_me':
                return 'fas fa-check ';
            case 'Edit':
            case 'Classify':
            case 'Edit_From':
                return 'fas fa-edit ';
            case 'Delete':
                return 'far fa-trash-alt ';
            case 'Select_Template':
            case 'Option':
                return 'fas fa-layer-group ';
            case 'Add_report_items':
            case 'Add_File':
                return 'far fa-file ';
            case 'Add_approval_form':
                return 'fab fa-wpforms ';
            case 'Select_Work_Flow':
            case 'Move_Tenants_ToAnother_Edition':
                return 'fas fa-expand-arrows-alt ';
            case 'Permission':
                return 'fas fa-fingerprint';
            case 'Print':
                return 'fas fa-print';
            case 'publish':
                return 'fas fa-cloud-upload-alt ';
            case 'Un_Publish':
                return 'fas fa-cloud-download-alt ';
            case 'Login_As_This_Tenant':
                return 'far fa-user ';
            case 'Features':
                return 'far fa-star ';
            case 'Unlock':
                return 'fas fa-unlock';
            case 'Dublicate_Document':
                return 'far fa-copy';
            case 'Share_Document':
                return 'fas fa-share-square';
            case 'Checked_In':
                return 'fas fa-sign-in-alt';
            case 'Checked_Out':
                return 'fas fa-sign-out-alt';
            case 'Cancel_Checked_Out':
                return 'fas fa-ban';
            case 'Set_Passwor':
            case 'Change_Passwor':
                return 'fas fa-key';
            case 'Comments':
                return 'far fa-comment';
            case 'Keywords':
                return 'fas fa-th';
            case 'Note':
                return 'far fa-sticky-note';
            case 'Category':
                return 'fas fa-th-list';
            case 'Design':
                return 'far fa-object-group';
            case 'Create_From':
                return 'fas fa-plus';
            case 'WorkFlow':
                return 'fas fa-project-diagram';
            case 'Stop':
                return 'fas fa-stop';
            case 'Extend':
                return 'fas fa-clock';
            default:
                return customIcon; // return customIcon if no label matches
        }
    }

    ngOnInit(): void {}
}
