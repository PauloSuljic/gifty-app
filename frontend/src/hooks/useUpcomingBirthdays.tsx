import { useEffect, useState } from "react";
import { apiFetch } from "../api";
import { useAuth } from "../components/AuthProvider";

export interface UpcomingBirthday {
  id: string;
  name: string;
  date: Date;
  daysLeft: number;
}

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
      const res = await apiFetch("/api/shared-links/shared-with-me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) return setLoading(false);

      const data = await res.json();
      const mapped = data
        .filter((u: any) => u.ownerDateOfBirth)
        .map((u: any) => ({
          id: u.ownerId,
          name: u.ownerName,
          date: new Date(u.ownerDateOfBirth),
          daysLeft: calculateDaysUntilBirthday(u.ownerDateOfBirth),
        }))
        .sort((a: any, b: any) => a.daysLeft - b.daysLeft);

      setBirthdays(limit ? mapped.slice(0, limit) : mapped);
      setLoading(false);
    };

    fetchBirthdays();
  }, [firebaseUser, limit]);

  return { birthdays, loading };
}