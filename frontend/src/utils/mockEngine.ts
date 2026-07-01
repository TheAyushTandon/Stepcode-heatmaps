export interface GithubContributionDay {
  date: string;
  count: number;
  level: "NONE" | "FIRST_QUARTILE" | "SECOND_QUARTILE" | "THIRD_QUARTILE" | "FOURTH_QUARTILE";
}

export interface GithubContributionWeek {
  contributionDays: GithubContributionDay[];
}

export interface GithubData {
  totalContributions: number;
  weeks: GithubContributionWeek[];
}

export interface LeetCodeData {
  username: string;
  submission_calendar: { [timestamp: string]: number };
}

export function generateMockGithub(_username: string, year?: number): GithubData {
  let calendarStart: Date;
  let totalWeeks = 53;

  if (year) {
    // Jan 1st of selected year aligned to preceding Sunday (in UTC to prevent timezone issues)
    calendarStart = new Date(Date.UTC(year, 0, 1));
    const startDayOfWeek = calendarStart.getUTCDay();
    calendarStart.setUTCDate(calendarStart.getUTCDate() - startDayOfWeek);

    const calendarEnd = new Date(Date.UTC(year, 11, 31));
    const endDayOfWeek = calendarEnd.getUTCDay();
    calendarEnd.setUTCDate(calendarEnd.getUTCDate() + (6 - endDayOfWeek));

    const diffTime = Math.abs(calendarEnd.getTime() - calendarStart.getTime());
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    totalWeeks = Math.ceil(totalDays / 7);
  } else {
    const today = new Date();
    calendarStart = new Date();
    calendarStart.setDate(today.getDate() - 364);
    const startDayOfWeek = calendarStart.getDay();
    calendarStart.setDate(calendarStart.getDate() - startDayOfWeek);
    totalWeeks = 53;
  }

  const weeks: GithubContributionWeek[] = [];
  let total = 0;
  const loopDate = new Date(calendarStart);

  for (let w = 0; w < totalWeeks; w++) {
    const days: GithubContributionDay[] = [];
    for (let d = 0; d < 7; d++) {
      const dStr = loopDate.toISOString().split("T")[0];
      
      const rand = Math.random();
      let count = 0;
      const isWeekend = d === 0 || d === 6;
      const activeChance = isWeekend ? 0.22 : 0.48;

      if (rand < activeChance) {
        count = Math.floor(Math.random() * 6) + 1;
        if (Math.random() > 0.92) {
          count = Math.floor(Math.random() * 12) + 6;
        }
      }
      
      total += count;

      let level: GithubContributionDay["level"] = "NONE";
      if (count > 0) {
        if (count <= 2) level = "FIRST_QUARTILE";
        else if (count <= 4) level = "SECOND_QUARTILE";
        else if (count <= 8) level = "THIRD_QUARTILE";
        else level = "FOURTH_QUARTILE";
      }

      days.push({
        date: dStr,
        count: count,
        level: level,
      });

      // Advance loop date in UTC or local depending on view
      if (year) {
        loopDate.setUTCDate(loopDate.getUTCDate() + 1);
      } else {
        loopDate.setDate(loopDate.getDate() + 1);
      }
    }
    weeks.push({ contributionDays: days });
  }

  return {
    totalContributions: total,
    weeks,
  };
}

export function generateMockLeetcode(username: string, year?: number): LeetCodeData {
  const map: { [timestamp: string]: number } = {};
  
  if (year) {
    // Generate submissions throughout the calendar year
    const start = new Date(Date.UTC(year, 0, 1));
    const end = new Date(Date.UTC(year, 11, 31));
    const loopDate = new Date(start);

    while (loopDate <= end) {
      const rand = Math.random();
      if (rand < 0.35) {
        const count = Math.floor(Math.random() * 4) + 1;
        // Unix timestamp in seconds
        const ts = Math.floor(loopDate.getTime() / 1000);
        map[ts] = count;
      }
      loopDate.setUTCDate(loopDate.getUTCDate() + 1);
    }
  } else {
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const loopDate = new Date();
      loopDate.setDate(today.getDate() - i);
      
      const rand = Math.random();
      if (rand < 0.35) {
        const count = Math.floor(Math.random() * 4) + 1;
        const ts = Math.floor(loopDate.getTime() / 1000);
        map[ts] = count;
      }
    }
  }

  return {
    username,
    submission_calendar: map,
  };
}
