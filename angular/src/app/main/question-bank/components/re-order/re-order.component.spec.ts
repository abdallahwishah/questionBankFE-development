import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReOrderComponent } from './re-order.component';

describe('ReOrderComponent', () => {
  let component: ReOrderComponent;
  let fixture: ComponentFixture<ReOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReOrderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
