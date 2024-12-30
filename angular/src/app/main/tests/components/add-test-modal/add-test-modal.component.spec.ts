import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTestModalComponent } from './add-test-modal.component';

describe('AddTestModalComponent', () => {
  let component: AddTestModalComponent;
  let fixture: ComponentFixture<AddTestModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddTestModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddTestModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
