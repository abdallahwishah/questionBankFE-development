import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WordsOrderComponent } from './words-order.component';

describe('WordsOrderComponent', () => {
  let component: WordsOrderComponent;
  let fixture: ComponentFixture<WordsOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WordsOrderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WordsOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
