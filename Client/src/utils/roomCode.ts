const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateRoomCode(): string {
  let code = '';
  for (let i = 0; i < 9; i += 1) {
    code += CHARSET[Math.floor(Math.random() * CHARSET.length)];
  }
  return code;
}

export function normalizeRoomCode(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 9);
}

export function formatRoomCode(raw: string): string {
  return (raw.match(/.{1,3}/g) ?? []).join('-');
}

export function splitRoomCode(raw: string): string[] {
  return raw.match(/.{1,3}/g) ?? [];
}