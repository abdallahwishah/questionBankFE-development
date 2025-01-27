import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@node_modules/@angular/router';

@Component({
    selector: 'app-student',
    templateUrl: './student.component.html',
    styleUrls: ['./student.component.css'],
})
export class StudentComponent implements OnInit {
    constructor(private _router: Router) {}

    ngOnInit() {
        this._router.events.subscribe((val: any) => {
            if (val?.routerEvent instanceof NavigationEnd) {
                // this.showCart =
                //     val?.routerEvent?.url?.includes('resturantPage') || val?.routerEvent?.url?.includes('itemDetails');
                // console.log('val?.routerEvent?.url', val?.routerEvent?.url);
                // this.showGo =
                //     !val?.routerEvent?.url?.includes('/?') &&
                //     !val?.routerEvent?.url?.includes('verfication') &&
                //     !val?.routerEvent?.url?.includes('verficationOPT') &&
                //     !val?.routerEvent?.url?.includes('checkourAdressAndPayment');
                // this.hideHeader = val?.routerEvent?.url?.includes('trackOrder');
            }
        });
    }
}
