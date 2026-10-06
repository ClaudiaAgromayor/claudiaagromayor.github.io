/* ── the story, in five chapters ───────────────────────────────
   Each chapter opens with a short paragraph and one picture (`feature`), then its moments
   as a short list that opens on click. `moments` are chapter titles from src/data/chapters.js. */
import { CHAPTERS } from './chapters.js'

export const ACTS = [
  {
    n: 'I', title: 'Roots', years: '2003 – 2015',
    text: 'I grew up in Madrid between two languages, in a family that stretches across Europe, Asia and the Americas. Two things arrived early: a gymnastics mat and a maths problem. One taught me discipline under pressure; the other, that a hard problem is the best kind of game.',
    moments: ['Born between two cultures', 'Fifth in the world', 'Maths as a game'],
  },
  {
    n: 'II', title: 'Taking off', years: '2018 – 2022',
    text: 'I chose engineering because it was hard. Around the same time I found my first job, and pitched an idea nobody had asked for, from the most junior seat in the room. Then I spent a summer alone in Wisconsin, in charge of twelve girls and a lake.',
    moments: ['From 0 to 1,000 on TikTok', 'Top of the class', 'Engineering at ICAI', 'A summer at Lake Wapogasset'],
  },
  {
    n: 'III', title: 'Double degree in Paris', years: '2023 – 2025',
    text: 'Selected as one of two ICAI students for the double degree with CentraleSupélec, I moved to Paris without the usual prépa and in a new language. There I found what drives me, using data to understand real systems, while running the finances of France’s largest student forum.',
    moments: ['Paris, without a prépa', 'Basketball, rowing and surf', 'Treasurer of France’s largest student forum', 'Altex Asset Management', 'A third degree, in economics'],
  },
  {
    n: 'IV', title: 'Building with AI', years: '2025',
    text: '2025 was the year models met people: language models that have to follow business rules, factories that learn together without sharing their data, an AI system that AWS teams use every day, and a hackathon won in 48 hours.',
    moments: ['LLMs that follow rules', 'Learning without sharing data', 'Amazon Web Services', 'A double master’s in engineering and AI', 'First place in 48 hours'],
  },
  {
    n: 'V', title: 'AI where it counts', years: '2026',
    text: 'Now I train models where a wrong answer has a cost. A network that segments root canals in 3D so a dentist can plan the treatment. A network that reads 43 billion molecules looking for a safer anaesthetic. Same question in both: can you trust the model where it has never been tested?',
    moments: ['Seeing inside a tooth', 'One of eight in Spain', 'IRIC, Université de Montréal', 'A kill switch for AI agents'],
  },
].map((a) => ({ ...a, items: a.moments.map((t) => CHAPTERS.find((c) => c.title === t)).filter(Boolean) }))

