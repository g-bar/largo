// Sample scorecard data, with every record
// filled out to a complete Scorecard.
//
// appeal and totalAppeal.overall are the same question
//   overall = [TopTwoBox, TopThreeBox, BottomTwoBox, BottomThreeBox]
//   TopTwo = likeALot + like          BottomTwo = dislike + dislikeALot
//   TopThree = +likeSomewhat          BottomThree = +dislikeSomewhat
// Each record below keeps those two views in sync. byName/byFace are separate
// bundled questions (name-only / face-only aware) and stand on their own.
//
// base is the respondent count behind a celebrity record's percentages. The #
// toggle turns the whole page into counts out of the viewed celebrity's base
// (REF_BASE in app.js = Brad Pitt's total base): count = round(pct * REF_BASE / 100).
// Brad Pitt's own figures become real headcounts. Category benchmarks are a pooled
// rate across all actors (every figure is count/aware*100); 
// their own base is far larger and on a different scale, so the page
// never uses it. Instead category figures are INDEXED to Brad Pitt's base so the
// comparison reads in one unit, and the UI flags them as indexed. Hence only the
// brad-pitt records carry a base; category records don't need one.
const SCORECARDS = [
  {
    subjectId: "brad-pitt", segmentId: "total", fieldingDate: "2025-07-25",
    base: 1200, eScore: 99, awareness: 60,
    totalAppeal: {
      overall: [52, 86, 5, 14],
      byName:  [49, 83, 7, 17],
      byFace:  [46, 89, 4, 11],
    },
    // Reconciles with overall [52,86,5,14]: 27+25=52, +34=86, 3+2=5, +9=14.
    appeal: {
      likeALot: 27, like: 25, likeSomewhat: 34,
      dislikeSomewhat: 9, dislike: 3, dislikeALot: 2,
    },
    attributes: {
      Attractive: 29, Approachable: 2, Aspirational: 3, Believable: 21,
      Confident: 35, Compassionate: 8, "Cool/Hip": 23, Creative: 5,
      Distinguished: 3, Edgy: 12, Influential: 10, "One-of-a-Kind": 15,
    },
    powerFactors: {
      Talented: 47, Funny: 12, Exciting: 11, Sexy: 14, Intelligent: 13,
      Beautiful: 6, "Good Energy": 19, Trustworthy: 6, Sincere: 6,
    },
  },
  {
    subjectId: "brad-pitt", segmentId: "male", fieldingDate: "2025-07-25",
    base: 590, eScore: 97, awareness: 58,
    totalAppeal: {
      overall: [49, 85, 6, 15],
      byName:  [46, 81, 8, 18],
      byFace:  [43, 87, 5, 12],
    },
    // Reconciles with overall [49,85,6,15]: 25+24=49, +36=85, 4+2=6, +9=15.
    appeal: {
      likeALot: 25, like: 24, likeSomewhat: 36,
      dislikeSomewhat: 9, dislike: 4, dislikeALot: 2,
    },
    attributes: {
      Attractive: 28, Approachable: 2, Aspirational: 2, Believable: 20,
      Confident: 34, Compassionate: 7, "Cool/Hip": 22, Creative: 4,
      Distinguished: 2, Edgy: 11, Influential: 9, "One-of-a-Kind": 14,
    },
    powerFactors: {
      Talented: 45, Funny: 11, Exciting: 10, Sexy: 12, Intelligent: 13,
      Beautiful: 5, "Good Energy": 18, Trustworthy: 6, Sincere: 5,
    },
  },
  {
    subjectId: "brad-pitt", segmentId: "female", fieldingDate: "2025-07-25",
    base: 610, eScore: 96, awareness: 56,
    totalAppeal: {
      overall: [47, 84, 6, 16],
      byName:  [44, 80, 8, 19],
      byFace:  [41, 86, 5, 13],
    },
    // Reconciles with overall [47,84,6,16]: 24+23=47, +37=84, 4+2=6, +10=16.
    appeal: {
      likeALot: 24, like: 23, likeSomewhat: 37,
      dislikeSomewhat: 10, dislike: 4, dislikeALot: 2,
    },
    attributes: {
      Attractive: 26, Approachable: 1, Aspirational: 2, Believable: 20,
      Confident: 33, Compassionate: 7, "Cool/Hip": 21, Creative: 4,
      Distinguished: 2, Edgy: 10, Influential: 8, "One-of-a-Kind": 13,
    },
    powerFactors: {
      Talented: 44, Funny: 12, Exciting: 11, Sexy: 15, Intelligent: 12,
      Beautiful: 7, "Good Energy": 19, Trustworthy: 6, Sincere: 6,
    },
  },
  {
    subjectId: "film-personality-actor", segmentId: "total", fieldingDate: "2025-07-25",
    awareness: 14,
    appeal: {
      likeALot: 27, like: 32, likeSomewhat: 31,
      dislikeSomewhat: 5, dislike: 3, dislikeALot: 2,
    },
    // Derived from appeal above: 27+32=59, +31=90, 3+2=5, +5=10.
    totalAppeal: {
      overall: [59, 90, 5, 10],
      byName:  [55, 87, 7, 13],
      byFace:  [52, 92, 4, 8],
    },
    attributes: {
      Attractive: 22, Approachable: 4, Aspirational: 3, Believable: 18,
      Confident: 27, Compassionate: 6, "Cool/Hip": 17, Creative: 5,
      Distinguished: 3, Edgy: 9, Influential: 8, "One-of-a-Kind": 10,
    },
    powerFactors: {
      Talented: 37, Funny: 12, Exciting: 11, Sexy: 14, Intelligent: 13,
      Beautiful: 6, "Good Energy": 19, Trustworthy: 6, Sincere: 6,
    },
  },
  {
    subjectId: "film-personality-actor-action-adventure", segmentId: "total", fieldingDate: "2025-07-25",
    awareness: 16,
    appeal: {
      likeALot: 25, like: 30, likeSomewhat: 33,
      dislikeSomewhat: 6, dislike: 4, dislikeALot: 2,
    },
    totalAppeal: {
      overall: [55, 88, 6, 12],
      byName:  [51, 85, 8, 15],
      byFace:  [48, 90, 5, 10],
    },
    attributes: {
      Attractive: 24, Approachable: 3, Aspirational: 4, Believable: 17,
      Confident: 30, Compassionate: 5, "Cool/Hip": 20, Creative: 5,
      Distinguished: 3, Edgy: 13, Influential: 9, "One-of-a-Kind": 11,
    },
    powerFactors: {
      Talented: 34, Funny: 10, Exciting: 16, Sexy: 13, Intelligent: 11,
      Beautiful: 6, "Good Energy": 17, Trustworthy: 5, Sincere: 5,
    },
  },
  {
    subjectId: "spokesperson", segmentId: "total", fieldingDate: "2025-07-25",
    awareness: 21,
    appeal: {
      likeALot: 20, like: 29, likeSomewhat: 34,
      dislikeSomewhat: 9, dislike: 5, dislikeALot: 3,
    },
    totalAppeal: {
      overall: [49, 83, 8, 17],
      byName:  [45, 80, 10, 20],
      byFace:  [42, 85, 7, 15],
    },
    attributes: {
      Attractive: 18, Approachable: 6, Aspirational: 3, Believable: 20,
      Confident: 26, Compassionate: 8, "Cool/Hip": 13, Creative: 4,
      Distinguished: 4, Edgy: 6, Influential: 11, "One-of-a-Kind": 8,
    },
    powerFactors: {
      Talented: 28, Funny: 11, Exciting: 9, Sexy: 9, Intelligent: 15,
      Beautiful: 5, "Good Energy": 17, Trustworthy: 10, Sincere: 9,
    },
  },
  {
    subjectId: "film-personality-actor-romance", segmentId: "total", fieldingDate: "2025-07-25",
    awareness: 16,
    appeal: {
      likeALot: 28, like: 31, likeSomewhat: 29,
      dislikeSomewhat: 6, dislike: 4, dislikeALot: 2,
    },
    totalAppeal: {
      overall: [59, 88, 6, 12],
      byName:  [55, 85, 8, 15],
      byFace:  [52, 90, 5, 10],
    },
    attributes: {
      Attractive: 27, Approachable: 5, Aspirational: 4, Believable: 18,
      Confident: 26, Compassionate: 9, "Cool/Hip": 18, Creative: 5,
      Distinguished: 3, Edgy: 7, Influential: 8, "One-of-a-Kind": 11,
    },
    powerFactors: {
      Talented: 33, Funny: 13, Exciting: 12, Sexy: 18, Intelligent: 11,
      Beautiful: 10, "Good Energy": 18, Trustworthy: 6, Sincere: 7,
    },
  },
  {
    subjectId: "streaming-actor", segmentId: "total", fieldingDate: "2025-07-25",
    awareness: 9,
    appeal: {
      likeALot: 22, like: 28, likeSomewhat: 33,
      dislikeSomewhat: 9, dislike: 5, dislikeALot: 3,
    },
    totalAppeal: {
      overall: [50, 83, 8, 17],
      byName:  [46, 80, 10, 20],
      byFace:  [43, 85, 7, 15],
    },
    attributes: {
      Attractive: 23, Approachable: 5, Aspirational: 3, Believable: 16,
      Confident: 24, Compassionate: 6, "Cool/Hip": 19, Creative: 6,
      Distinguished: 2, Edgy: 11, Influential: 7, "One-of-a-Kind": 12,
    },
    powerFactors: {
      Talented: 30, Funny: 12, Exciting: 13, Sexy: 13, Intelligent: 11,
      Beautiful: 7, "Good Energy": 16, Trustworthy: 5, Sincere: 6,
    },
  },
];

// News items for the carousel. image is a CSS background value (gradient placeholder).
const NEWS = [
  { date: "February 23, 2026", title: "Global Celebrities & Brands - A Winning Combination", image: "linear-gradient(135deg,#9b7cb8,#6b4a8a)" },
  { date: "February 9, 2026", title: "Talent in the Age of Influencers and AI", image: "linear-gradient(135deg,#c89a6b,#8a5a3a)" },
  { date: "January 28, 2026", title: "A New Era: Largo Acquires E-Poll", image: "linear-gradient(135deg,#5a7a9a,#3a4a6a)" },
  { date: "January 14, 2026", title: "Measuring Trust: Why Credibility Scores Matter", image: "linear-gradient(135deg,#7ca88a,#4a7a5a)" },
  { date: "December 20, 2025", title: "The 2025 Year in Review: Top Movers", image: "linear-gradient(135deg,#b87c7c,#8a4a4a)" },
  { date: "December 3, 2025", title: "Streaming Stars vs Traditional Celebrities", image: "linear-gradient(135deg,#7c8ab8,#4a5a8a)" },
  { date: "November 18, 2025", title: "How Gen Z Reshapes Celebrity Appeal", image: "linear-gradient(135deg,#a88ab8,#6a4a8a)" },
];
