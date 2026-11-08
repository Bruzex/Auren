export const roomAliases = [
  'Moth',
  'Lumen',
  'Echo',
  'Vesper',
  'Cipher',
  'Nimbus',
  'Zephyr',
  'Aura',
  'Solaris',
  'Nova',
  'Drift',
  'Shade',
];

export function generateRoomCode(length = 6): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid easily confused chars (I, O, 1, 0)
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function getRandomAlias(): string {
  const alias = roomAliases[Math.floor(Math.random() * roomAliases.length)];
  const num = Math.floor(10 + Math.random() * 90);
  return `${alias} ${num}`;
}

