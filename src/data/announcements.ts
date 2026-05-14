export interface Announcement {
  date: string;
  title: string;
  body: string;
  kind?: 'news' | 'security' | 'event';
}

export const announcements: Announcement[] = [
  {
    date: '2026-05-13',
    title: 'The Pack is being built',
    body: 'Welcome to your DOGYPT account. This space will grow with you — heroglyph profiles, the Constitution, the Eternal Dog, and the upcoming mobile app. Stay tuned.',
    kind: 'news',
  },
];
