import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SupportGroupItemsComponent} from './supportGroupItems.component';



const routes: Routes = [
    {
        path: '',
        component: SupportGroupItemsComponent,
        pathMatch: 'full'
    },
    
    
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class SupportGroupItemRoutingModule {
}
