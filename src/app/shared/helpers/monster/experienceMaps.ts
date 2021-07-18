export interface Budget {
  level: number;
  daily: number;
  easy: number;
  medium: number;
  hard: number;
  deadly: number;
}

export interface crXp {
  cr: string;
  xp: number;
}

export const levelXp: Budget[] = [
    { level: 0,   daily: 100,	  easy: 10,	  medium: 20,		hard: 30,	  deadly: 40 },
    { level: 1,   daily: 300,	  easy: 25,	  medium: 50,		hard: 75,	  deadly: 100 },
    { level: 2,   daily: 600,	  easy: 50,	  medium: 100,	hard: 150,	deadly: 200 },
    { level: 3,   daily: 1200,	easy: 75,	  medium: 150,	hard: 225,	deadly: 400 },
    { level: 4,   daily: 1700,	easy: 125,	medium: 250,	hard: 375,	deadly: 500 },
    { level: 5,   daily: 3500,	easy: 250,	medium: 500,	hard: 750,	deadly: 1100 },
    { level: 6,   daily: 4000,	easy: 300,	medium: 600,	hard: 900,	deadly: 1400 },
    { level: 7,   daily: 5000,	easy: 350,	medium: 750,	hard: 1100,	deadly: 1700 },
    { level: 8,   daily: 6000,	easy: 450,	medium: 900,	hard: 1400,	deadly: 2100 },
    { level: 9,   daily: 7500,	easy: 550,	medium: 1100,	hard: 1600,	deadly: 2400 },
    { level: 10,  daily: 9000,	easy: 600,	medium: 1200,	hard: 1900,	deadly: 2800 },
    { level: 11,  daily: 10500,	easy: 800,	medium: 1600,	hard: 2400,	deadly: 3600 },
    { level: 12,  daily: 11500,	easy: 1000,	medium: 2000,	hard: 3000,	deadly: 4500 },
    { level: 13,  daily: 13500,	easy: 1100,	medium: 2200,	hard: 3400,	deadly: 5100 },
    { level: 14,  daily: 15000,	easy: 1250,	medium: 2500,	hard: 3800,	deadly: 5700 },
    { level: 15,  daily: 18000,	easy: 1400,	medium: 2800,	hard: 4300,	deadly: 6400 },
    { level: 16,  daily: 20000,	easy: 1600,	medium: 3200,	hard: 4800,	deadly: 7200 },
    { level: 17,  daily: 25000,	easy: 2000,	medium: 3900,	hard: 5900,	deadly: 8800 },
    { level: 18,  daily: 27000,	easy: 2100,	medium: 4200,	hard: 6300,	deadly: 9500 },
    { level: 19,  daily: 30000,	easy: 2400,	medium: 4900,	hard: 7300,	deadly: 10900 },
    { level: 20,  daily: 40000,	easy: 2800,	medium: 5700,	hard: 8500,	deadly: 12700 }
  ];

export const crXpMap: crXp[] = [
  { cr: "0", xp: 5 },
  { cr: "1/8", xp: 25 },
  { cr: "1/4", xp: 50 },
  { cr: "1/2", xp: 100 },
  { cr: "1", xp: 200 },
  { cr: "2", xp: 450 },
  { cr: "3", xp: 700 },
  { cr: "4", xp: 1100 },
  { cr: "5", xp: 1800 },
  { cr: "6", xp: 2300 },
  { cr: "7", xp: 2900 },
  { cr: "8", xp: 3900 },
  { cr: "9", xp: 5000 },
  { cr: "10", xp: 5900 },
  { cr: "11", xp: 7200 },
  { cr: "12", xp: 8400 },
  { cr: "13", xp: 10000 },
  { cr: "14", xp: 11500 },
  { cr: "15", xp: 13000 },
  { cr: "16", xp: 15000 },
  { cr: "17", xp: 18000 },
  { cr: "18", xp: 20000 },
  { cr: "19", xp: 22000 },
  { cr: "20", xp: 25000 },
  { cr: "21", xp: 33000 },
  { cr: "22", xp: 41000 },
  { cr: "23", xp: 50000 },
  { cr: "24", xp: 62000 },
  { cr: "25", xp: 75000 },
  { cr: "26", xp: 90000 },
  { cr: "27", xp: 105000 },
  { cr: "28", xp: 120000 },
  { cr: "29", xp: 135000 },
  { cr: "30", xp: 155000 }
]