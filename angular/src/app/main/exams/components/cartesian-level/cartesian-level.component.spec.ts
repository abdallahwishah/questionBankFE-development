import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CartesianLevelComponent } from './cartesian-level.component';

describe('CartesianLevelComponent', () => {
  let component: CartesianLevelComponent;
  let fixture: ComponentFixture<CartesianLevelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CartesianLevelComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CartesianLevelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
