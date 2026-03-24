export interface WizardOption {
  label: string;
  emoji: string;
  value: string;
}

export interface WizardStep {
  key: string;
  title: string;
  subtitle?: string;
  type: 'cards' | 'grid' | 'input' | 'date';
  options?: WizardOption[];
}

const traits: WizardOption[] = [
  { label: 'Watcher', emoji: '👁️', value: 'watcher' },
  { label: 'Gamer', emoji: '🎾', value: 'gamer' },
  { label: 'Hyperactive', emoji: '🔋', value: 'hyperactive' },
  { label: 'Savage', emoji: '☠️', value: 'savage' },
  { label: 'Lover', emoji: '💘', value: 'lover' },
  { label: 'Poseidog', emoji: '🌊', value: 'poseidog' },
  { label: 'Gourmet', emoji: '🥣', value: 'gourmet' },
  { label: 'Chillmaster', emoji: '🛋️', value: 'chillmaster' },
];

const breeds: WizardOption[] = [
  'Chihuahua', 'Golden Retriever', 'Labrador', 'German Shepherd', 'Bulldog',
  'Poodle', 'Beagle', 'Rottweiler', 'Boxer', 'Dachshund',
  'Husky', 'Corgi', 'Pug', 'Doberman', 'Shih Tzu',
  'Border Collie', 'Pitbull', 'Cocker Spaniel', 'Dalmatian', 'Akita',
  'Maltese', 'Yorkie', 'Great Dane', 'Bernese', 'Samoyed',
  'Whippet', 'Malinois', 'Schnauzer', 'Mixed', 'Other',
].map((b, i) => ({
  label: b,
  emoji: ['🐕', '🐩', '🦮', '🐕‍🦺'][i % 4],
  value: b.toLowerCase().replace(/\s/g, '-'),
}));

const letters: WizardOption[] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(l => ({
  label: l, emoji: l, value: l,
}));

const romanNumerals: WizardOption[] = [
  { label: 'I', emoji: 'I', value: '1' },
  { label: 'II', emoji: 'II', value: '2' },
  { label: 'III', emoji: 'III', value: '3' },
  { label: 'IV', emoji: 'IV', value: '4' },
  { label: 'V+', emoji: 'V+', value: '5+' },
];

export const wizardSteps: WizardStep[] = [
  {
    key: 'sex', title: 'DOG SEX', subtitle: 'Choose your dog\'s sex',
    type: 'cards',
    options: [
      { label: 'Male', emoji: '👑', value: 'male' },
      { label: 'Female', emoji: '👑', value: 'female' },
    ],
  },
  {
    key: 'furColor', title: 'FUR COLOR', subtitle: 'What color is their coat?',
    type: 'cards',
    options: [
      { label: 'Dark', emoji: '🌑', value: 'dark' },
      { label: 'Light', emoji: '☀️', value: 'light' },
      { label: 'Mixed', emoji: '🌈', value: 'mixed' },
    ],
  },
  {
    key: 'destiny', title: 'DESTINY', subtitle: 'How did your paths cross?',
    type: 'cards',
    options: [
      { label: 'Rescued / Adopted', emoji: '🛟', value: 'rescued' },
      { label: 'Raised from Puppy', emoji: '🍼', value: 'puppy' },
    ],
  },
  {
    key: 'bloodline', title: 'BLOODLINE', subtitle: 'What is their lineage?',
    type: 'cards',
    options: [
      { label: 'Mixed Breed', emoji: '📄', value: 'mixed' },
      { label: 'Purebred', emoji: '📜', value: 'purebred' },
    ],
  },
  {
    key: 'patron', title: 'PATRON', subtitle: 'Select the breed closest to your dog',
    type: 'grid',
    options: breeds,
  },
  {
    key: 'trait1', title: 'CHARACTER TRAIT I', subtitle: 'Their primary nature',
    type: 'cards',
    options: traits,
  },
  {
    key: 'trait2', title: 'CHARACTER TRAIT II', subtitle: 'Their secondary nature',
    type: 'cards',
    options: [...traits, { label: 'GOD-TOY', emoji: '🧸', value: 'god-toy' }],
  },
  {
    key: 'ownerSex', title: 'OWNER\'S SEX', subtitle: 'Your identity in the dynasty',
    type: 'cards',
    options: [
      { label: 'Male', emoji: '🚹', value: 'male' },
      { label: 'Female', emoji: '🚺', value: 'female' },
    ],
  },
  {
    key: 'ownerInitial', title: 'OWNER\'S INITIAL', subtitle: 'Your letter in the HEROGLYPH',
    type: 'grid',
    options: letters,
  },
  {
    key: 'dogOrder', title: 'DOG ORDER', subtitle: 'Which number dog is this in your life?',
    type: 'cards',
    options: romanNumerals,
  },
  {
    key: 'chineseZodiac', title: 'CHINESE ZODIAC', subtitle: 'Enter your birth year',
    type: 'input',
  },
  {
    key: 'westernZodiac', title: 'WESTERN ZODIAC', subtitle: 'Select your birthday (month/day)',
    type: 'date',
  },
];

export const toRoman = (n: number): string => {
  const numerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
  return numerals[n - 1] || String(n);
};
