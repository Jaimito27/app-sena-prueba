import { TestBed } from '@angular/core/testing';

import { TokenRefreshService } from './token-refresh.service';

describe('TokenRefresh', () => {
  let service: TokenRefreshService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TokenRefreshService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
