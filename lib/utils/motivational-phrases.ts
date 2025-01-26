export const ACHIEVEMENT_PHRASES = [
  "Amazing work! Keep crushing those goals!",
  "You're on fire! Nothing can stop you now!",
  "One step closer to greatness!",
  '"The only way to do great work is to love what you do." - Steve Jobs',
  '"Success is not final, failure is not fatal: it is the courage to continue that counts." - Winston Churchill',
  '"The future belongs to those who believe in the beauty of their dreams." - Eleanor Roosevelt',
  '"Innovation distinguishes between a leader and a follower." - Steve Jobs',
  '"The best time to plant a tree was 20 years ago. The second best time is now." - Chinese Proverb',
  '"Everything you\'ve ever wanted is sitting on the other side of fear." - George Addair',
  '"The only limit to our realization of tomorrow will be our doubts of today." - Franklin D. Roosevelt',
  '"Stay hungry, stay foolish." - Steve Jobs',
  '"Done is better than perfect." - Sheryl Sandberg',
  '"The way to get started is to quit talking and begin doing." - Walt Disney',
  "\"Your time is limited, don't waste it living someone else's life.\" - Steve Jobs",
  '"The harder you work for something, the greater you\'ll feel when you achieve it."',
  '"What you do makes a difference, and you have to decide what kind of difference you want to make." - Jane Goodall',
  '"Success is walking from failure to failure with no loss of enthusiasm." - Winston Churchill',
  '"The secret of getting ahead is getting started." - Mark Twain',
  '"Great things are done by a series of small things brought together." - Vincent Van Gogh',
  '"The future depends on what you do today." - Mahatma Gandhi',
];

export const ENCOURAGEMENT_PHRASES = [
  "You've got this! The journey continues!",
  "Every goal is a step toward your dreams!",
  "Your dedication is your superpower!",
  "Keep pushing - greatness takes time!",
  "Today's efforts are tomorrow's achievements!",
  '"Think different." - Apple',
  "\"I have not failed. I've just found 10,000 ways that won't work.\" - Thomas Edison",
  "\"Whether you think you can or you think you can't, you're right.\" - Henry Ford",
  '"It does not matter how slowly you go as long as you do not stop." - Confucius',
  '"Everything is figureoutable." - Marie Forleo',
  '"The journey of a thousand miles begins with one step." - Lao Tzu',
  '"Do what you can, with what you have, where you are." - Theodore Roosevelt',
  '"Believe you can and you\'re halfway there." - Theodore Roosevelt',
  '"The only person you are destined to become is the person you decide to be." - Ralph Waldo Emerson',
  '"You are never too old to set another goal or to dream a new dream." - C.S. Lewis',
  '"What lies behind us and what lies before us are tiny matters compared to what lies within us." - Ralph Waldo Emerson',
  '"The difference between try and triumph is just a little umph!" - Marvin Phillips',
  '"Life is 10% what happens to you and 90% how you react to it." - Charles R. Swindoll',
];

export function getRandomPhrase(
  type: "achievement" | "encouragement" = "achievement"
): string {
  const phrases =
    type === "achievement" ? ACHIEVEMENT_PHRASES : ENCOURAGEMENT_PHRASES;
  return phrases[Math.floor(Math.random() * phrases.length)];
}

export function generateShareableText(phrase: string): string {
  return encodeURIComponent(
    `${phrase}\n\nTracked with @onurhan1337's Aimly app`
  );
}

export function getShareUrl(phrase: string): string {
  const text = generateShareableText(phrase);
  return `https://twitter.com/intent/tweet?text=${text}`;
}
