const permissions = {
  Admin: ["add", "edit", "delete", "upload", "download", "view", "clear"],
  Doctor: ["add", "edit", "delete", "upload", "download", "view"],
  Therapist: ["view"],
  Patient: [],
};

export function hasPermission(role: string, action: string) {
  return permissions[role]?.includes(action);
}
