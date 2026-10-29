export interface PassportDraft {
  holderName: string;
  number: string;
  nationality: string;
  dateOfBirth: string;
  issueDate: string;
  expirationDate: string;
  issuingCountry: string;
}

const parseDateOnly = (value: string): number | null => {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const timestamp = Date.UTC(year, month - 1, day);
  const date = new Date(timestamp);
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
    ? timestamp
    : null;
};

export const validatePassportDates = (draft: Pick<PassportDraft, 'dateOfBirth' | 'issueDate' | 'expirationDate'>, today = new Date()): string | null => {
  const birth = draft.dateOfBirth ? parseDateOnly(draft.dateOfBirth) : null;
  const issue = draft.issueDate ? parseDateOnly(draft.issueDate) : null;
  const expiry = draft.expirationDate ? parseDateOnly(draft.expirationDate) : null;

  if ((draft.dateOfBirth && birth === null) || (draft.issueDate && issue === null) || (draft.expirationDate && expiry === null)) {
    return 'Enter valid dates.';
  }
  const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  if (birth !== null && birth > todayUtc) return 'Date of birth cannot be in the future.';
  if (issue !== null && issue > todayUtc) return 'Issue date cannot be in the future.';
  if (birth !== null && issue !== null && birth > issue) return 'Issue date must be on or after the date of birth.';
  if (issue !== null && expiry !== null && expiry <= issue) return 'Expiration date must be after the issue date.';
  return null;
};
