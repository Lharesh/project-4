export type Role = 'admin' | 'doctor' | 'therapist' | 'patient';

const permissions: Record<Role, string[]> = {
  admin: ["add", "edit", "delete", "upload", "download", "view", "clear"],
  doctor: ["add", "edit", "delete", "upload", "download", "view"],
  therapist: ["view"],
  patient: [],
};

export function hasPermission(role: Role, action: string) {
  return permissions[role]?.includes(action);
}
