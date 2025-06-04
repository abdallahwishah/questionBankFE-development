/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { WidgetSessionStats } from './widget-session-stats.component';

describe('WidgetSessionStats', () => {
    let component: WidgetSessionStats;
    let fixture: ComponentFixture<WidgetSessionStats>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [WidgetSessionStats],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(WidgetSessionStats);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
