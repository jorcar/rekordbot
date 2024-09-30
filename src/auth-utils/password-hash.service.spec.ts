import { PasswordHashService } from './password-hash.service';

describe('PasswordHashService', () => {
  let service: PasswordHashService;

  beforeEach(async () => {
    service = new PasswordHashService();
  });

  describe('hashPassword', () => {
    it('should generate a hash of the password', async () => {
      expect(await service.hashPassword('password')).toEqual(
        expect.any(String),
      );
    });
  });

  describe('comparePasswords', () => {
    describe('when correct hash', () => {
      let hash: string;
      beforeEach(async () => {
        hash = await service.hashPassword('password');
      });
      it('returns true', async () => {
        expect(await service.comparePasswords('password', hash)).toBe(true);
      });
    });
    describe('when incorrect hash', () => {
      it('returns false', async () => {
        expect(await service.comparePasswords('password', 'asd')).toBe(false);
      });
    });
  });
});
