import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SupportGroupsComponent} from './supportGroups.component';



const routes: Routes = [
    {
        path: '',
        component: SupportGroupsComponent,
        pathMatch: 'full'
    },
    
    
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class SupportGroupRoutingModule {
}
