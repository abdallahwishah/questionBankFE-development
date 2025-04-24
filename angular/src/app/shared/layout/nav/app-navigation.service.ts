import { PermissionCheckerService } from 'abp-ng2-module';
import { AppSessionService } from '@shared/common/session/app-session.service';

import { Injectable } from '@angular/core';
import { AppMenu } from './app-menu';
import { AppMenuItem } from './app-menu-item';

@Injectable()
export class AppNavigationService {
    constructor(
        private _permissionCheckerService: PermissionCheckerService,
        private _appSessionService: AppSessionService,
    ) {}

    /*  new AppMenuItem('ClassRoom', 'Pages.Administration.Roles', 'flaticon-point', '/app/main/question-ids'),
    new AppMenuItem('Subjects', 'Pages.Administration.Users', 'flaticon-users', '/app/main/subjects'), */

    getMenu(): AppMenu {
        return new AppMenu('MainMenu', 'MainMenu', [
            new AppMenuItem(
                'Dashboard',
                'Pages.Administration.Host.Dashboard',
                'flaticon-line-graph',
                '/app/admin/hostDashboard',
            ),
            new AppMenuItem('Dashboard', 'Pages.Tenant.Dashboard', 'flaticon-line-graph', '/app/main/dashboard'),
            new AppMenuItem(
                'QuestionIdentifiers',
                '',
                'flaticon-line-graph',
                '',
                [],
                [
                    new AppMenuItem('Governorates', '', 'fa fa-circle', '/app/main/governorates'),
                    new AppMenuItem('Categories', '', 'fa fa-circle', '/app/main/categories'),
                    new AppMenuItem('Complexities', '', 'fa fa-circle', '/app/main/complexities'),
                    new AppMenuItem('StudyLevels', '', 'fa fa-circle', '/app/main/studyLevels'),
                    new AppMenuItem('StudySubjects', '', 'fa fa-circle', '/app/main/studySubjects'),
                    new AppMenuItem('SubjectUnits', '', 'fa fa-circle', '/app/main/subjectUnits'),
                    // new AppMenuItem('SubjectGroups', '', 'fa fa-circle', '/app/main/subjectGroups'),
                    // new AppMenuItem('SupportGroupItems', '', 'fa fa-circle', '/app/main/supportGroupItems'),
                    // new AppMenuItem('SupportGroups', '', 'fa fa-circle', '/app/main/supportGroups'),
                ],
            ),
            new AppMenuItem('QuestionBank', '', 'flaticon-line-graph', '/app/main/question-bank'),
            new AppMenuItem('Templates', '', 'flaticon-line-graph', '/app/main/templates'),
            new AppMenuItem('Exams', '', 'flaticon-line-graph', '/app/main/exams'),
            new AppMenuItem('Sessions', '', 'flaticon-line-graph', '/app/main/sessions'),
            // new AppMenuItem('MyExams', '', 'flaticon-line-graph', '/app/main/my-exams'),
            new AppMenuItem('CorrectingSession', 'Pages.Sessions.GetAllForCorrection', 'flaticon-line-graph', '/app/main/correcting'),
            new AppMenuItem('AuditScreen', 'Pages.Sessions.GetAllForAuditing', 'flaticon-line-graph', '/app/main/audit'),
            new AppMenuItem('MyReports', 'Pages.ReportItems', 'flaticon-diagram', '/app/main/report/myReport'),
            /*  new AppMenuItem(
                'lockup',
                '',
                'flaticon-line-graph',
                '',
                [],
                [
                    new AppMenuItem('categories', '', 'flaticon-app', '/app/main/categories'),
                    new AppMenuItem('complexities', '', 'flaticon-users', '/app/main/complexities'),
                    new AppMenuItem('studyLevels', '', 'flaticon-users', '/app/main/studyLevels'),
                    new AppMenuItem('studySubjects', '', 'flaticon-users', '/app/main/studySubjects'),
                    new AppMenuItem('subjectUnits', '', 'flaticon-users', '/app/main/subjectUnits'),
                    new AppMenuItem('subjectGroups', '', 'flaticon-users', '/app/main/subjectGroups'),
                    new AppMenuItem('supportGroupItems', '', 'flaticon-users', '/app/main/supportGroupItems'),
                    new AppMenuItem('supportGroups', '', 'flaticon-users', '/app/main/supportGroups'),
                ],
            ), */
            new AppMenuItem('Tenants', 'Pages.Tenants', 'flaticon-list-3', '/app/admin/tenants'),
            new AppMenuItem('Editions', 'Pages.Editions', 'flaticon-app', '/app/admin/editions'),
            new AppMenuItem(
                'Administration',
                '',
                'flaticon-interface-8',
                '',
                [],
                [
                    new AppMenuItem(
                        'OrganizationUnits',
                        'Pages.Administration.OrganizationUnits',
                        'flaticon-map',
                        '/app/admin/organization-units',
                    ),
                    new AppMenuItem('Roles', 'Pages.Administration.Roles', 'flaticon-suitcase', '/app/admin/roles'),
                    new AppMenuItem('Users', 'Pages.Administration.Users', 'flaticon-users', '/app/admin/users'),
                    // new AppMenuItem(
                    //     'Languages',
                    //     'Pages.Administration.Languages',
                    //     'flaticon-tabs',
                    //     '/app/admin/languages',
                    //     ['/app/admin/languages/{name}/texts'],
                    // ),
                    new AppMenuItem(
                        'AuditLogs',
                        'Pages.Administration.AuditLogs',
                        'flaticon-folder-1',
                        '/app/admin/auditLogs',
                    ),
                    // new AppMenuItem(
                    //     'Maintenance',
                    //     'Pages.Administration.Host.Maintenance',
                    //     'flaticon-lock',
                    //     '/app/admin/maintenance',
                    // ),
                    // new AppMenuItem(
                    //     'Subscription',
                    //     'Pages.Administration.Tenant.SubscriptionManagement',
                    //     'flaticon-refresh',
                    //     '/app/admin/subscription-management',
                    // ),
                    // new AppMenuItem(
                    //     'VisualSettings',
                    //     'Pages.Administration.UiCustomization',
                    //     'flaticon-medical',
                    //     '/app/admin/ui-customization',
                    // ),
                    // new AppMenuItem(
                    //     'WebhookSubscriptions',
                    //     'Pages.Administration.WebhookSubscription',
                    //     'flaticon2-world',
                    //     '/app/admin/webhook-subscriptions',
                    // ),
                    // new AppMenuItem(
                    //     'DynamicProperties',
                    //     'Pages.Administration.DynamicProperties',
                    //     'flaticon-interface-8',
                    //     '/app/admin/dynamic-property',
                    // ),
                    new AppMenuItem(
                        'Notifications',
                        '',
                        'flaticon-alarm',
                        '',
                        [],
                        [
                            new AppMenuItem('Inbox', '', 'flaticon-mail-1', '/app/notifications'),
                            new AppMenuItem(
                                'MassNotifications',
                                'Pages.Administration.MassNotification',
                                'flaticon-paper-plane',
                                '/app/admin/mass-notifications',
                            ),
                        ],
                    ),
                    new AppMenuItem(
                        'Settings',
                        'Pages.Administration.Host.Settings',
                        'flaticon-settings',
                        '/app/admin/hostSettings',
                    ),
                    new AppMenuItem(
                        'Settings',
                        'Pages.Administration.Tenant.Settings',
                        'flaticon-settings',
                        '/app/admin/tenantSettings',
                    ),
                ],
            ),
            // new AppMenuItem(
            //     'DemoUiComponents',
            //     'Pages.DemoUiComponents',
            //     'flaticon-shapes',
            //     '/app/admin/demo-ui-components',
            // ),
        ]);
    }

    checkChildMenuItemPermission(menuItem): boolean {
        for (let i = 0; i < menuItem.items.length; i++) {
            let subMenuItem = menuItem.items[i];

            if (subMenuItem.permissionName === '' || subMenuItem.permissionName === null) {
                if (subMenuItem.route) {
                    return true;
                }
            } else if (this._permissionCheckerService.isGranted(subMenuItem.permissionName)) {
                if (!subMenuItem.hasFeatureDependency()) {
                    return true;
                }

                if (subMenuItem.featureDependencySatisfied()) {
                    return true;
                }
            }

            if (subMenuItem.items && subMenuItem.items.length) {
                let isAnyChildItemActive = this.checkChildMenuItemPermission(subMenuItem);
                if (isAnyChildItemActive) {
                    return true;
                }
            }
        }

        return false;
    }

    showMenuItem(menuItem: AppMenuItem): boolean {
        if (
            menuItem.permissionName === 'Pages.Administration.Tenant.SubscriptionManagement' &&
            this._appSessionService.tenant &&
            !this._appSessionService.tenant.edition
        ) {
            return false;
        }

        let hideMenuItem = false;

        if (menuItem.requiresAuthentication && !this._appSessionService.user) {
            hideMenuItem = true;
        }

        if (menuItem.permissionName && !this._permissionCheckerService.isGranted(menuItem.permissionName)) {
            hideMenuItem = true;
        }

        if (this._appSessionService.tenant || !abp.multiTenancy.ignoreFeatureCheckForHostUsers) {
            if (menuItem.hasFeatureDependency() && !menuItem.featureDependencySatisfied()) {
                hideMenuItem = true;
            }
        }

        if (!hideMenuItem && menuItem.items && menuItem.items.length) {
            return this.checkChildMenuItemPermission(menuItem);
        }

        return !hideMenuItem;
    }

    /**
     * Returns all menu items recursively
     */
    getAllMenuItems(): AppMenuItem[] {
        let menu = this.getMenu();
        let allMenuItems: AppMenuItem[] = [];
        menu.items.forEach((menuItem) => {
            allMenuItems = allMenuItems.concat(this.getAllMenuItemsRecursive(menuItem));
        });

        return allMenuItems;
    }

    private getAllMenuItemsRecursive(menuItem: AppMenuItem): AppMenuItem[] {
        if (!menuItem.items) {
            return [menuItem];
        }

        let menuItems = [menuItem];
        menuItem.items.forEach((subMenu) => {
            menuItems = menuItems.concat(this.getAllMenuItemsRecursive(subMenu));
        });

        return menuItems;
    }
}
