import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportItemsDesginComponent } from './report-items-desgin.component';

describe('ReportItemsDesginComponent', () => {
  let component: ReportItemsDesginComponent;
  let fixture: ComponentFixture<ReportItemsDesginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportItemsDesginComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportItemsDesginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
