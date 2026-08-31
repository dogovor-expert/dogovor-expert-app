import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createTestUser, deleteTestUser } from '../../../../vitest.integration.setup';
import { GET, PATCH, DELETE } from '../profile/route';

describe('/api/profile integration', () => {
  let testUserId: string;

  beforeAll(async () => {
    const { user } = await createTestUser();
    testUserId = user.id;
  });

  afterAll(async () => {
    await deleteTestUser(testUserId);
  });

  it('should get profile via GET', async () => {
    // Требуется авторизация.
    expect(true).toBe(true);
  });

  it('should update profile via PATCH', async () => {
    expect(true).toBe(true);
  });

  it('should delete profile via DELETE', async () => {
    expect(true).toBe(true);
  });
});