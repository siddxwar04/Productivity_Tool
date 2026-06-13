export interface QuizCard {
  id: string;
  term: string;
  answer: string;
  hint?: string;
  tag?: string;
}

export const QUIZ_QUESTIONS: QuizCard[] = [
  {
    id: '1',
    term: 'What is the powerhouse of the cell?',
    answer: 'Mitochondria — it generates ATP energy through cellular respiration.',
    hint: 'Think about energy production inside cells.',
    tag: 'Biology',
  },
  {
    id: '2',
    term: 'What is the process by which plants make their own food?',
    answer: 'Photosynthesis — plants use sunlight, water, and CO₂ to produce glucose and oxygen.',
    hint: 'Plants + sunlight = food.',
    tag: 'Biology',
  },
  {
    id: '3',
    term: 'What does DNA stand for?',
    answer: 'Deoxyribonucleic Acid — the molecule that carries genetic information in all living organisms.',
    hint: "It's the blueprint of life.",
    tag: 'Biology',
  },
  {
    id: '4',
    term: 'What is the chemical symbol for Gold?',
    answer: 'Au — from the Latin word "Aurum". Atomic number 79.',
    hint: "It's not \"Go\" — think Latin.",
    tag: 'Chemistry',
  },
  {
    id: '5',
    term: 'What is the pH of pure water?',
    answer: '7 — Pure water is neutral, neither acidic nor basic.',
    hint: "It's right in the middle of the pH scale (0–14).",
    tag: 'Chemistry',
  },
  {
    id: '6',
    term: "What is the most abundant gas in Earth's atmosphere?",
    answer: 'Nitrogen (N₂) — makes up about 78% of the atmosphere.',
    hint: "It's not oxygen — that's only about 21%.",
    tag: 'Chemistry',
  },
  {
    id: '7',
    term: "What is Newton's Second Law of Motion?",
    answer: 'Force = Mass × Acceleration (F = ma). The greater the mass or acceleration, the greater the force.',
    hint: "It's a famous formula with three variables.",
    tag: 'Physics',
  },
  {
    id: '8',
    term: 'What is the speed of light?',
    answer: 'Approximately 299,792,458 metres per second (≈ 3 × 10⁸ m/s) in a vacuum.',
    hint: 'Nothing in the universe travels faster.',
    tag: 'Physics',
  },
  {
    id: '9',
    term: 'What is the unit of electrical resistance?',
    answer: 'Ohm (Ω) — named after German physicist Georg Simon Ohm.',
    hint: 'Named after a scientist. Symbol looks like a horseshoe.',
    tag: 'Physics',
  },
  {
    id: '10',
    term: 'What is the value of π (Pi) to 5 decimal places?',
    answer: "3.14159 — Pi is the ratio of a circle's circumference to its diameter.",
    hint: 'Starts with 3.14...',
    tag: 'Math',
  },
  {
    id: '11',
    term: 'What is the Pythagorean Theorem?',
    answer: 'a² + b² = c² — In a right triangle, the square of the hypotenuse equals the sum of squares of the other two sides.',
    hint: 'It involves three sides of a right triangle.',
    tag: 'Math',
  },
  {
    id: '12',
    term: 'What is a prime number?',
    answer: 'A number greater than 1 that has no divisors other than 1 and itself. Examples: 2, 3, 5, 7, 11.',
    hint: 'It can only be divided by 1 and itself.',
    tag: 'Math',
  },
  {
    id: '13',
    term: 'Which planet is known as the Red Planet?',
    answer: 'Mars — its reddish appearance comes from iron oxide (rust) on its surface.',
    hint: 'Fourth planet from the Sun.',
    tag: 'General',
  },
  {
    id: '14',
    term: 'Who painted the Mona Lisa?',
    answer: 'Leonardo da Vinci — painted between 1503 and 1519. It now hangs in the Louvre, Paris.',
    hint: 'A famous Italian Renaissance genius.',
    tag: 'General',
  },
  {
    id: '15',
    term: 'What is the largest ocean on Earth?',
    answer: "The Pacific Ocean — covers more than 165 million km², over 30% of Earth's surface.",
    hint: 'It borders Asia, Australia, and the Americas.',
    tag: 'General',
  },
  {
    id: '16',
    term: 'How many bones are in the adult human body?',
    answer: '206 bones — babies are born with around 270–300, which fuse over time.',
    hint: "It's between 200 and 210.",
    tag: 'General',
  },
  {
    id: '17',
    term: 'What is the capital city of Australia?',
    answer: 'Canberra — not Sydney or Melbourne. It was purpose-built as the capital in 1913.',
    hint: "It's not the most famous city there.",
    tag: 'General',
  },
  {
    id: '18',
    term: 'What does CPU stand for?',
    answer: 'Central Processing Unit — the primary component of a computer that executes instructions.',
    hint: 'It\'s considered the "brain" of the computer.',
    tag: 'CS',
  },
  {
    id: '19',
    term: 'What is the binary representation of the decimal number 10?',
    answer: '1010 in binary — binary uses base 2 (only 0s and 1s). 8 + 0 + 2 + 0 = 10.',
    hint: 'Binary uses only 0 and 1. Count in powers of 2.',
    tag: 'CS',
  },
  {
    id: '20',
    term: 'Who wrote the play "Romeo and Juliet"?',
    answer: 'William Shakespeare — written around 1594–1596. A timeless tragedy of two star-crossed lovers.',
    hint: 'The most famous playwright in the English language.',
    tag: 'Literature',
  },
];
