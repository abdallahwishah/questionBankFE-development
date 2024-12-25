import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectingQuestionsComponent } from './connecting-questions.component';

describe('ConnectingQuestionsComponent', () => {
  let component: ConnectingQuestionsComponent;
  let fixture: ComponentFixture<ConnectingQuestionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConnectingQuestionsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConnectingQuestionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
