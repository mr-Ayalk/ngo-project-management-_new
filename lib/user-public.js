export const PUBLIC_USER_SELECT = {
  id: true,
  email: true,
  name: true,
  role: true,
  staffRole: true,
  avatar: true,
};

export function toPublicUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    staffRole: user.staffRole,
    avatar: user.avatar ?? null,
  };
}
