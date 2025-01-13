import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrueFaseComponent } from './true-fase.component';

describe('TrueFaseComponent', () => {
  let component: TrueFaseComponent;
  let fixture: ComponentFixture<TrueFaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrueFaseComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TrueFaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
