/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { WidgetExamTemplateStats } from './widget-exam-template-stats.component';

describe('WidgetExamTemplateStats', () => {
  let component: WidgetExamTemplateStats;
  let fixture: ComponentFixture<WidgetExamTemplateStats>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WidgetExamTemplateStats ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WidgetExamTemplateStats);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
