﻿import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CategoriesComponent} from './categories.component';



const routes: Routes = [
    {
        path: '',
        component: CategoriesComponent,
        pathMatch: 'full'
    },
    
    
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class CategoryRoutingModule {
}
