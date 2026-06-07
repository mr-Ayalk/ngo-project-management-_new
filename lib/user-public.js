export const PUBLIC_USER_SELECT = {
  id: true,
  email: true,
  name: true,
  role: true,
  staffRole: true,
  avatar: true,
  phone: true,
  bio: true,
  countryScope: true,
  coreFocus: true,
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
    phone: user.phone ?? null,
    bio: user.bio ?? null,
    countryScope: user.countryScope ?? null,
    coreFocus: user.coreFocus ?? null,
  };
}
