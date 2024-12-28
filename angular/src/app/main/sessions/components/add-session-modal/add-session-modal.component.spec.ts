import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSessionsModalComponent } from './add-session-modal.component';

describe('AddSessionsModalComponent', () => {
  let component: AddSessionsModalComponent;
  let fixture: ComponentFixture<AddSessionsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddSessionsModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddSessionsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
