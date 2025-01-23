import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@node_modules/@angular/common';

@Component({
    standalone: true,
    imports: [CommonModule],
    selector: 'app-student-main',
    templateUrl: './student-main.component.html',
    styleUrls: ['./student-main.component.css'],
})
export class StudentMainComponent implements OnInit {
    constructor() {}

    ngOnInit() {}
}
