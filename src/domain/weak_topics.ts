const WEAK_TOPICS_HIDE_DATE_KEY = 'qa_trainer_weak_topics_hidden_date';
const WEAK_TOPICS_ACTIVE_LESSON_KEY = 'qa_trainer_weak_topics_active_lesson';
const WEAK_TOPICS_REWARD_DATE_KEY = 'qa_trainer_weak_topics_reward_date';

const WEAK_TOPIC_REPLAY_BONUS_XP = 5;

export function getWeakTopicsHiddenDate() {
  try {
    return localStorage.getItem(WEAK_TOPICS_HIDE_DATE_KEY) ?? '';
  } catch {
    return '';
  }
}

export function hideWeakTopicsForDate(dateKey: string) {
  try {
    localStorage.setItem(WEAK_TOPICS_HIDE_DATE_KEY, dateKey);
  } catch {
    // Ignore localStorage failures.
  }
}

export function markWeakTopicLaunch(lessonId: string, dateKey: string) {
  try {
    localStorage.setItem(WEAK_TOPICS_ACTIVE_LESSON_KEY, `${dateKey}:${lessonId}`);
  } catch {
    // Ignore localStorage failures.
  }
}

export function consumeWeakTopicCompletion(lessonId: string, dateKey: string) {
  try {
    const marker = localStorage.getItem(WEAK_TOPICS_ACTIVE_LESSON_KEY) ?? '';
    const [markerDate, markerLessonId] = marker.split(':');

    if (markerDate !== dateKey || markerLessonId !== lessonId) {
      return {
        fromWeakTopicSession: false,
        bonusXP: 0,
      };
    }

    localStorage.removeItem(WEAK_TOPICS_ACTIVE_LESSON_KEY);

    const rewardedDate = localStorage.getItem(WEAK_TOPICS_REWARD_DATE_KEY) ?? '';
    if (rewardedDate === dateKey) {
      return {
        fromWeakTopicSession: true,
        bonusXP: 0,
      };
    }

    localStorage.setItem(WEAK_TOPICS_REWARD_DATE_KEY, dateKey);
    return {
      fromWeakTopicSession: true,
      bonusXP: WEAK_TOPIC_REPLAY_BONUS_XP,
    };
  } catch {
    return {
      fromWeakTopicSession: false,
      bonusXP: 0,
    };
  }
}

export function clearWeakTopicsState() {
  try {
    localStorage.removeItem(WEAK_TOPICS_HIDE_DATE_KEY);
    localStorage.removeItem(WEAK_TOPICS_ACTIVE_LESSON_KEY);
    localStorage.removeItem(WEAK_TOPICS_REWARD_DATE_KEY);
  } catch {
    // Ignore localStorage failures.
  }
}
