import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyPhonePage } from './verify-phone.page';

describe('VerifyPhonePage', () => {
  let component: VerifyPhonePage;
  let fixture: ComponentFixture<VerifyPhonePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerifyPhonePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerifyPhonePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
