import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultipleChoiceMoreThanOptionComponent } from './multiple-choice-more-than-option.component';

describe('MultipleChoiceMoreThanOptionComponent', () => {
  let component: MultipleChoiceMoreThanOptionComponent;
  let fixture: ComponentFixture<MultipleChoiceMoreThanOptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultipleChoiceMoreThanOptionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MultipleChoiceMoreThanOptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
