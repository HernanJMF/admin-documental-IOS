import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatAnalyzerComponent } from './chat-analyzer.component';

describe('ChatAnalyzerComponent', () => {
  let component: ChatAnalyzerComponent;
  let fixture: ComponentFixture<ChatAnalyzerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChatAnalyzerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatAnalyzerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
