import { useEffect, useState } from "react";
import { getSharedOwnerName, getSharedWithMe, SharedWithMeGroup } from "../shared/lib/sharedLinks";
import { useAuth } from "./useAuth";
import { calculateDaysUntilBirthday } from "../shared/lib/birthdays";
import { parseDateOnlyAsLocalDate } from "../shared/lib/dateOnly";

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

export function useUpcomingBirthdays(limit?: number, enabled = true) {
  const { firebaseUser } = useAuth();
  const [birthdays, setBirthdays] = useState<UpcomingBirthday[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseUser) {
      setBirthdays([]);
      setLoading(false);
      return;
    }

    if (!enabled) {
      setBirthdays([]);
      setLoading(true);
      return;
    }

    const fetchBirthdays = async () => {
      setLoading(true);
      try {
        const token = await firebaseUser.getIdToken();
        const data = await getSharedWithMe(token);

        const mapped: UpcomingBirthday[] = data
          .filter(hasOwnerDateOfBirth)
          .map((u) => {
            const daysLeft = calculateDaysUntilBirthday(u.ownerDateOfBirth);
            if (daysLeft == null) {
              return null;
            }

            return {
              id: u.ownerId,
              name: getSharedOwnerName(u.ownerName),
              date: parseDateOnlyAsLocalDate(u.ownerDateOfBirth) ?? new Date(u.ownerDateOfBirth),
              daysLeft,
            };
          })
          .filter((birthday): birthday is UpcomingBirthday => birthday !== null)
          .sort((a, b) => a.daysLeft - b.daysLeft);

        setBirthdays(limit ? mapped.slice(0, limit) : mapped);
      } catch (error) {
        console.error("Failed to fetch upcoming birthdays:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBirthdays();
  }, [enabled, firebaseUser, limit]);

  return { birthdays, loading };
}
