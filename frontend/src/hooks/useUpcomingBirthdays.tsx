import { useEffect, useState } from "react";
import { getSharedWithMe, SharedWithMeGroup } from "../shared/lib/sharedLinks";
import { useAuth } from "./useAuth";

export interface UpcomingBirthday {
  id: string;
  name: string;
  date: Date;
  daysLeft: number;
}

const hasOwnerDateOfBirth = (
  item: SharedWithMeGroup
): item is SharedWithMeGroup & { ownerDateOfBirth: string } =>
  typeof item.ownerDateOfBirth === "string" && item.ownerDateOfBirth.length > 0;

function calculateDaysUntilBirthday(dateString: string): number {
  const today = new Date();
  const birthday = new Date(dateString);
  birthday.setFullYear(today.getFullYear());
  if (birthday < today) birthday.setFullYear(today.getFullYear() + 1);
  return Math.ceil((birthday.getTime() - today.getTime()) / 86400000);
}

export function useUpcomingBirthdays(limit?: number) {
  const { firebaseUser } = useAuth();
  const [birthdays, setBirthdays] = useState<UpcomingBirthday[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseUser) return;

    const fetchBirthdays = async () => {
      const token = await firebaseUser.getIdToken();
      try {
        const data = await getSharedWithMe(token);

        const mapped: UpcomingBirthday[] = data
          .filter(hasOwnerDateOfBirth)
          .map((u) => ({
            id: u.ownerId,
            name: u.ownerName,
            date: new Date(u.ownerDateOfBirth),
            daysLeft: calculateDaysUntilBirthday(u.ownerDateOfBirth),
          }))
          .sort((a, b) => a.daysLeft - b.daysLeft);

        setBirthdays(limit ? mapped.slice(0, limit) : mapped);
      } catch (error) {
        console.error("Failed to fetch upcoming birthdays:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBirthdays();
  }, [firebaseUser, limit]);

  return { birthdays, loading };
}
