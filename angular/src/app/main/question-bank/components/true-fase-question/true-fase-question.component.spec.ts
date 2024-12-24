import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrueFaseQuestionComponent } from './true-fase-question.component';

describe('TrueFaseQuestionComponent', () => {
  let component: TrueFaseQuestionComponent;
  let fixture: ComponentFixture<TrueFaseQuestionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrueFaseQuestionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TrueFaseQuestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
