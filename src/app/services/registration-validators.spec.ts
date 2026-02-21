import { TestBed } from '@angular/core/testing';

import { RegistrationValidators } from './registration-validators';

describe('RegistrationValidators', () => {
  let service: RegistrationValidators;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RegistrationValidators);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
