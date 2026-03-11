export const calculateDaysUntilBirthday = (dateString: string): number | null => {
  if (!dateString) {
    return null;
  }

  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let birthday = new Date(today.getFullYear(), parsed.getMonth(), parsed.getDate());

  if (birthday.getTime() < today.getTime()) {
    birthday = new Date(today.getFullYear() + 1, parsed.getMonth(), parsed.getDate());
  }

  return Math.round((birthday.getTime() - today.getTime()) / 86400000);
};
