import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelatedQuestionsComponent } from './related-questions.component';

describe('RelatedQuestionsComponent', () => {
  let component: RelatedQuestionsComponent;
  let fixture: ComponentFixture<RelatedQuestionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RelatedQuestionsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RelatedQuestionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
