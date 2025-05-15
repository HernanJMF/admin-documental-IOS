import { TestBed } from '@angular/core/testing';

import { DocumentsListService } from './documents-list.service';

describe('DocumentsListService', () => {
  let service: DocumentsListService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DocumentsListService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
