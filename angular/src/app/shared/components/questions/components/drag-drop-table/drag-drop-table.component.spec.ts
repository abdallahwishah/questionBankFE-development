import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DragDropTableComponent } from './drag-drop-table.component';

describe('DragDropTableComponent', () => {
  let component: DragDropTableComponent;
  let fixture: ComponentFixture<DragDropTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DragDropTableComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DragDropTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
