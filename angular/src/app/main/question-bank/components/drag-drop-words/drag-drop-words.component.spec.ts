import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DragDropWordsComponent } from './drag-drop-words.component';

describe('DragDropWordsComponent', () => {
  let component: DragDropWordsComponent;
  let fixture: ComponentFixture<DragDropWordsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DragDropWordsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DragDropWordsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
