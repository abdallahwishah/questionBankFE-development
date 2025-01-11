import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupForPickComponent } from './popup-for-pick.component';

describe('PopupForPickComponent', () => {
  let component: PopupForPickComponent;
  let fixture: ComponentFixture<PopupForPickComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupForPickComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupForPickComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
