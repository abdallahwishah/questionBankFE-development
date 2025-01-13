import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultipleChoiceOneOptionComponent } from './multiple-choice-one-option.component';

describe('MultipleChoiceOneOptionComponent', () => {
  let component: MultipleChoiceOneOptionComponent;
  let fixture: ComponentFixture<MultipleChoiceOneOptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultipleChoiceOneOptionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MultipleChoiceOneOptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
