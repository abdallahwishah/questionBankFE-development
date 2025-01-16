import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArticleQuestionsComponent } from './article-questions.component';

describe('ArticleQuestionsComponent', () => {
  let component: ArticleQuestionsComponent;
  let fixture: ComponentFixture<ArticleQuestionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArticleQuestionsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ArticleQuestionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
