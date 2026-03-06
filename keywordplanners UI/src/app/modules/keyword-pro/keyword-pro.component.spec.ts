import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KeywordProComponent } from './keyword-pro.component';

describe('KeywordProComponent', () => {
  let component: KeywordProComponent;
  let fixture: ComponentFixture<KeywordProComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KeywordProComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KeywordProComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
