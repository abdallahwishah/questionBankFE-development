import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicExamQuestionComponent } from './dynamic-exam-question.component';

describe('DynamicExamQuestionComponent', () => {
  let component: DynamicExamQuestionComponent;
  let fixture: ComponentFixture<DynamicExamQuestionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DynamicExamQuestionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DynamicExamQuestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
