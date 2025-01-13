import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectingWordsComponent } from './connecting-words.component';

describe('ConnectingWordsComponent', () => {
  let component: ConnectingWordsComponent;
  let fixture: ComponentFixture<ConnectingWordsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConnectingWordsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConnectingWordsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
