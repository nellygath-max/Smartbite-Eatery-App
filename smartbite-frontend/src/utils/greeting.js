const GREETINGS = [
  {
    period: 'morning',
    emoji: '🌅',
    matches: (hour) => hour >= 5 && hour < 12,
    getTitle: (userName) => `Good morning, ${userName}!`,
    message: 'Start your day with something fresh and delicious.',
  },
  {
    period: 'afternoon',
    emoji: '☀️',
    matches: (hour) => hour >= 12 && hour < 17,
    getTitle: (userName) => `Good afternoon, ${userName}!`,
    message: 'Take a break and enjoy a satisfying meal.',
  },
  {
    period: 'evening',
    emoji: '🌇',
    matches: (hour) => hour >= 17 && hour < 22,
    getTitle: (userName) => `Good evening, ${userName}!`,
    message: "Relax—we'll take care of dinner.",
  },
  {
    period: 'night',
    emoji: '🌙',
    matches: (hour) => hour >= 22 || hour < 5,
    getTitle: (userName) => `Good night, ${userName}!`,
    message:
      "Rest well—we'll be here with delicious meals whenever you're ready.",
  },
];

const fallbackGreeting = GREETINGS[GREETINGS.length - 1];

export function getGreeting(userName) {
  const displayName = userName?.trim() || 'there';
  const currentHour = new Date().getHours();
  const greeting =
    GREETINGS.find(({ matches }) => matches(currentHour)) || fallbackGreeting;

  return {
    title: greeting.getTitle(displayName),
    message: greeting.message,
    emoji: greeting.emoji,
    period: greeting.period,
  };
}
