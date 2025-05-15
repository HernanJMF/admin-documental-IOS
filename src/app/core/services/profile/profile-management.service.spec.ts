import { TestBed } from '@angular/core/testing';

import { ProfileManagementService } from './profile-management.service';

describe('ProfileManagementService', () => {
  let service: ProfileManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProfileManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
