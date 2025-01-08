import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectingSentencesComponent } from './connecting-sentences.component';

describe('ConnectingSentencesComponent', () => {
  let component: ConnectingSentencesComponent;
  let fixture: ComponentFixture<ConnectingSentencesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConnectingSentencesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConnectingSentencesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
