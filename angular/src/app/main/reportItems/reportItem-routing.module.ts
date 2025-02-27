import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportItemsComponent } from './reportItems.component';
import { ReportItemsDesginComponent } from './report-items-desgin/report-items-desgin.component';
import { ReportViewerComponent } from './report-viewer/report-viewer.component';

const routes: Routes = [
    {
        path: '',
        component: ReportItemsComponent,
        pathMatch: 'full',
    },
    {
        path: 'desgin/:name',
        component: ReportItemsDesginComponent,
        pathMatch: 'full',
    },
    {
        path: 'viewer/:name',
        component: ReportViewerComponent,
        pathMatch: 'full',
    },

];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ReportItemRoutingModule {}
