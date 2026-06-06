/**
 * Normalize UPLOADTHING_TOKEN — fixes common copy-paste mistakes in .env files.
 */
export function getUploadThingToken() {
  const raw = process.env.UPLOADTHING_TOKEN?.trim();
  if (!raw) return null;

  // Value was pasted as: UPLOADTHING_TOKEN='eyJ...'
  const embedded = raw.match(/eyJ[A-Za-z0-9+/=_-]+=*/);
  if (embedded) return embedded[0];

  let token = raw;
  if ((token.startsWith("'") && token.endsWith("'")) || (token.startsWith('"') && token.endsWith('"'))) {
    token = token.slice(1, -1);
  }

  return token.startsWith('eyJ') ? token : null;
}

export function isUploadThingConfigured() {
  return Boolean(getUploadThingToken());
}
