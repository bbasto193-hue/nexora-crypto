import { validatePassportDates } from '../passportValidation';

const assert = (condition: unknown, message: string) => {
  if (!condition) throw new Error(message);
};

const fixedToday = new Date('2026-10-29T12:00:00Z');

assert(validatePassportDates({ dateOfBirth: '1990-04-15', issueDate: '2020-06-01', expirationDate: '2030-06-01' }, fixedToday) === null, 'Valid synthetic dates should pass.');
assert(validatePassportDates({ dateOfBirth: '2030-04-15', issueDate: '', expirationDate: '' }, fixedToday) !== null, 'Future birth date should be rejected.');
assert(validatePassportDates({ dateOfBirth: '', issueDate: '2027-01-01', expirationDate: '' }, fixedToday) !== null, 'Future issue date should be rejected.');
assert(validatePassportDates({ dateOfBirth: '', issueDate: '2020-06-01', expirationDate: '2020-06-01' }, fixedToday) !== null, 'Expiration must follow issue date.');
assert(validatePassportDates({ dateOfBirth: '', issueDate: '', expirationDate: '2026-02-31' }, fixedToday) !== null, 'Impossible calendar dates should be rejected.');

console.log('PASS: passport date validation using synthetic test values only.');
