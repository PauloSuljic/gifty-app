const PENDING_PREFIX = "pending_";
const PENDING_SUFFIX_LENGTH = 6;

export const createPendingDisplayName = (uid: string) =>
  `${PENDING_PREFIX}${uid.substring(0, PENDING_SUFFIX_LENGTH)}`;

export const isPendingDisplayName = (value?: string) =>
  new RegExp(`^${PENDING_PREFIX}[a-z0-9]{${PENDING_SUFFIX_LENGTH}}$`, "i").test((value || "").trim());
