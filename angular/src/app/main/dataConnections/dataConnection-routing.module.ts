import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {DataConnectionsComponent} from './dataConnections.component';



const routes: Routes = [
    {
        path: '',
        component: DataConnectionsComponent,
        pathMatch: 'full'
    },
    
    
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class DataConnectionRoutingModule {
}
