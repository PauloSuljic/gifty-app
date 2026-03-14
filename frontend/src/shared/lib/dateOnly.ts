const dateOnlyPattern = /^(\d{4})-(\d{2})-(\d{2})$/;

export const parseDateOnlyAsLocalDate = (value: string): Date | null => {
  const match = dateOnlyPattern.exec(value);
  if (!match) {
    return null;
  }

  const [, yearString, monthString, dayString] = match;
  const year = Number(yearString);
  const monthIndex = Number(monthString) - 1;
  const day = Number(dayString);

  if (!Number.isInteger(year) || !Number.isInteger(monthIndex) || !Number.isInteger(day)) {
    return null;
  }

  const parsed = new Date(year, monthIndex, day);
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== monthIndex ||
    parsed.getDate() !== day
  ) {
    return null;
  }

  return parsed;
};

export const formatDateOnly = (
  value: string | null | undefined,
  options: Intl.DateTimeFormatOptions
) => {
  if (!value) {
    return null;
  }

  const parsed = parseDateOnlyAsLocalDate(value);
  if (!parsed) {
    return null;
  }

  return new Intl.DateTimeFormat(undefined, options).format(parsed);
};
