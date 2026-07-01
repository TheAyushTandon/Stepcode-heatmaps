import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "./components/Header";
import { Toggle, type ViewType } from "./components/Toggle";
import { YearToggle } from "./components/YearToggle";
import { GlassPanel } from "./components/GlassPanel";

import { Heatmap, type CalendarDay } from "./components/Heatmap";
import { Tooltip } from "./components/Tooltip";

import {
  generateMockGithub,
  generateMockLeetcode,
} from "./utils/mockEngine";

const GITHUB_ICON = (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.479C19.138 20.164 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
  </svg>
);

const LEETCODE_ICON = (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
    <path d="M16.102 17.93l-2.697 2.607c-.466.467-1.111.662-1.744.53a1.593 1.593 0 01-1.007-.63L5.052 14.88a1.56 1.56 0 010-2.203l7.247-7.25c.304-.302.72-.43 1.137-.34a1.56 1.56 0 011.022.68l2.69 2.61c.467.466.662 1.112.53 1.745a1.593 1.593 0 01-.63 1.007l-7.247 7.25c-.304.302-.72.43-1.137.34a1.56 1.56 0 01-1.022-.68L5.008 15.65c-.467-.466-.662-1.112-.53-1.745a1.593 1.593 0 01.63-1.007l7.247-7.25c.304-.302.72-.43 1.137-.34a1.56 1.56 0 011.022.68l.588.588-7.248 7.25a1.56 1.56 0 000 2.203l.587.587a1.56 1.56 0 002.203 0l7.247-7.25.588.588a1.56 1.56 0 010 2.203zM22 12c0-5.523-4.477-10-10-10S2 6.477 2 12s4.477 10 10 10 10-4.477 10-10zM13.483 3.5a1.37 1.37 0 00-.961.414l-6.85 6.85a1.37 1.37 0 000 1.937l3.228 3.228c.26.26.607.393.96.393.327 0 .654-.124.906-.356l6.905-6.905a1.37 1.37 0 000-1.937l-3.228-3.228a1.375 1.375 0 00-.96-.414z" />
  </svg>
);

const INPUT_GITHUB_ICON = (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M12.01 2c-5.53 0-10 4.47-10 10 0 4.42 2.87 8.17 6.84 9.49.5.09.68-.22.68-.48 0-.24-.01-.87-.01-1.7-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.1.39-1.99 1.03-2.69-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.69 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85 0 1.34-.01 2.42-.01 2.75 0 .27.18.58.69.48C19.14 20.16 22 16.42 22 12c0-5.53-4.47-10-10-10z" />
  </svg>
);

const INPUT_LEETCODE_ICON = (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M13.483 0a1.374 1.374 0 0 0-.961.414l-9.85 9.85a1.37 1.37 0 0 0 0 1.937l3.228 3.228c.26.26.607.393.96.393a1.3 1.3 0 0 0 .906-.356l9.905-9.905a1.37 1.37 0 0 0 0-1.937L14.444.414A1.375 1.375 0 0 0 13.483 0zm.087 1.85 3.228 3.228-9.85 9.85-3.228-3.228 9.85-9.85zm-4.726 9.878c-.27 0-.54.103-.746.31l-3.228 3.228a1.055 1.055 0 0 0 0 1.493l6.772 6.773a1.054 1.054 0 0 0 1.493 0l6.772-6.773a1.055 1.055 0 0 0 0-1.493l-3.228-3.228a1.055 1.055 0 0 0-1.493 0L12 15.011l-2.405-2.405c-.2-.2-.472-.3-.74-.298z" />
  </svg>
);

const generateEmptyCalendarForYear = (year?: number): CalendarDay[][] => {
  let calendarStart: Date;
  let totalDays = 371; // 53 weeks default

  if (year) {
    calendarStart = new Date(Date.UTC(year, 0, 1));
    const startDayOfWeek = calendarStart.getUTCDay();
    calendarStart.setUTCDate(calendarStart.getUTCDate() - startDayOfWeek);

    const calendarEnd = new Date(Date.UTC(year, 11, 31));
    const endDayOfWeek = calendarEnd.getUTCDay();
    calendarEnd.setUTCDate(calendarEnd.getUTCDate() + (6 - endDayOfWeek));

    const diffTime = Math.abs(calendarEnd.getTime() - calendarStart.getTime());
    totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  } else {
    const today = new Date();
    const oneYearAgo = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate() - 364));
    const startDayOfWeek = oneYearAgo.getUTCDay();
    calendarStart = new Date(oneYearAgo);
    calendarStart.setUTCDate(oneYearAgo.getUTCDate() - startDayOfWeek);
  }

  const weeks: CalendarDay[][] = [];
  let currentWeek: CalendarDay[] = [];
  const loopDate = new Date(calendarStart);

  for (let i = 0; i < totalDays; i++) {
    currentWeek.push({
      date: loopDate.toISOString().split("T")[0],
      count: 0,
      level: 0,
    });

    if (currentWeek.length === 7) {
      weeks.push([...currentWeek]);
      currentWeek = [];
    }
    if (year) {
      loopDate.setUTCDate(loopDate.getUTCDate() + 1);
    } else {
      loopDate.setDate(loopDate.getDate() + 1);
    }
  }

  return weeks;
};

function App() {
  const [githubUser, setGithubUser] = useState("TheAyushTandon");
  const [leetcodeUser, setLeetcodeUser] = useState("aarnav63");
  const [activeGithubUser, setActiveGithubUser] = useState("TheAyushTandon");
  const [activeLeetcodeUser, setActiveLeetcodeUser] = useState("aarnav63");

  const [view, setView] = useState<ViewType>("combined");
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  // Connection State
  const [connStatus, setConnStatus] = useState<ConnectionStatus>("loading");
  const [connText, setConnText] = useState("Checking API Server Connection...");

  // Heatmap Calendars
  const [githubWeeks, setGithubWeeks] = useState<CalendarDay[][]>([]);
  const [leetcodeWeeks, setLeetcodeWeeks] = useState<CalendarDay[][]>([]);

  // Stats Counters
  const [githubStats, setGithubStats] = useState({ total: 0, activeDays: 0, streak: 0 });
  const [leetcodeStats, setLeetcodeStats] = useState({ total: 0, activeDays: 0, streak: 0 });

  // Floating Tooltip State
  const [tooltip, setTooltip] = useState({
    content: "",
    x: 0,
    y: 0,
    visible: false,
    color: "",
  });

  const apiHost = "http://localhost:8000";

  // Data Normalization Helpers
  const processGithubData = (data: any) => {
    const levelMap: Record<string, number> = {
      NONE: 0,
      FIRST_QUARTILE: 1,
      SECOND_QUARTILE: 2,
      THIRD_QUARTILE: 3,
      FOURTH_QUARTILE: 4,
    };

    const weeks: CalendarDay[][] = data.weeks.map((week: any) =>
      week.contributionDays.map((day: any) => ({
        date: day.date,
        count: day.count,
        level: levelMap[day.level] ?? 0,
      }))
    );

    let activeDays = 0;
    let currentStreak = 0;
    let maxStreak = 0;

    weeks.forEach((week) => {
      week.forEach((day) => {
        if (day.count > 0) {
          activeDays++;
          currentStreak++;
          if (currentStreak > maxStreak) maxStreak = currentStreak;
        } else {
          currentStreak = 0;
        }
      });
    });

    setGithubWeeks(weeks);
    setGithubStats({
      total: data.totalContributions,
      activeDays,
      streak: maxStreak,
    });
  };

  const processLeetcodeData = (data: any, year?: number) => {
    const map = data.submission_calendar || {};
    let totalSubmissions = 0;
    Object.values(map).forEach((v) => (totalSubmissions += Number(v)));

    const entries = Object.entries(map) as [string, number][];
    const activeDays = entries.filter(([_, count]) => count > 0).length;

    // Start calendar calculations
    const dateMap: Record<string, number> = {};
    entries.forEach(([ts, count]) => {
      const dStr = new Date(Number(ts) * 1000).toISOString().split("T")[0];
      dateMap[dStr] = Number(count);
    });

    let calendarStart: Date;
    let totalDays: number;

    if (year) {
      calendarStart = new Date(Date.UTC(year, 0, 1));
      const startDayOfWeek = calendarStart.getUTCDay();
      calendarStart.setUTCDate(calendarStart.getUTCDate() - startDayOfWeek);

      const calendarEnd = new Date(Date.UTC(year, 11, 31));
      const endDayOfWeek = calendarEnd.getUTCDay();
      calendarEnd.setUTCDate(calendarEnd.getUTCDate() + (6 - endDayOfWeek));

      const diffTime = Math.abs(calendarEnd.getTime() - calendarStart.getTime());
      totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    } else {
      const today = new Date();
      const oneYearAgo = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate() - 364));
      const startDayOfWeek = oneYearAgo.getUTCDay();
      calendarStart = new Date(oneYearAgo);
      calendarStart.setUTCDate(oneYearAgo.getUTCDate() - startDayOfWeek);
      totalDays = 371; // 53 weeks
    }

    const weeks: CalendarDay[][] = [];
    let currentWeek: CalendarDay[] = [];
    let currentStreak = 0;
    let maxStreak = 0;

    const loopDate = new Date(calendarStart);
    for (let i = 0; i < totalDays; i++) {
      const dStr = loopDate.toISOString().split("T")[0];
      const count = dateMap[dStr] || 0;

      let lvl = 0;
      if (count > 0) {
        if (count <= 2) lvl = 1;
        else if (count <= 4) lvl = 2;
        else if (count <= 7) lvl = 3;
        else lvl = 4;
      }

      currentWeek.push({
        date: dStr,
        count,
        level: lvl,
      });

      if (count > 0) {
        currentStreak++;
        if (currentStreak > maxStreak) maxStreak = currentStreak;
      } else {
        currentStreak = 0;
      }

      if (currentWeek.length === 7) {
        weeks.push([...currentWeek]);
        currentWeek = [];
      }

      if (year) {
        loopDate.setUTCDate(loopDate.getUTCDate() + 1);
      } else {
        loopDate.setDate(loopDate.getDate() + 1);
      }
    }

    setLeetcodeWeeks(weeks);
    setLeetcodeStats({
      total: totalSubmissions,
      activeDays,
      streak: maxStreak,
    });
  };

  // Main Data Loading Handler
  const loadData = async (forceUpdateUsers = false, year: number | undefined = selectedYear) => {
    setLoading(true);

    const gh = githubUser.trim() || "TheAyushTandon";
    const lc = leetcodeUser.trim() || "aarnav63";

    if (forceUpdateUsers) {
      setActiveGithubUser(gh);
      setActiveLeetcodeUser(lc);
    }

    let isGithubDemo = false;
    let isLeetcodeDemo = false;
    let isOffline = false;

    const yearParam = year ? `?year=${year}` : "";

    // Fetch GitHub
    try {
      const res = await fetch(`${apiHost}/api/github/heatmap/${gh}${yearParam}`);
      if (res.ok) {
        const data = await res.json();
        processGithubData(data);
      } else {
        if (res.status === 404) {
          alert(`GitHub user "${gh}" not found.`);
          setGithubWeeks(generateEmptyCalendarForYear(year));
          setGithubStats({ total: 0, activeDays: 0, streak: 0 });
        } else {
          isGithubDemo = true;
        }
      }
    } catch (err) {
      isGithubDemo = true;
      isOffline = true;
    }

    // Fetch LeetCode
    try {
      const res = await fetch(`${apiHost}/api/leetcode/heatmap/${lc}${yearParam}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.submission_calendar && Object.keys(data.submission_calendar).length > 0) {
          processLeetcodeData(data, year);
        } else {
          setLeetcodeWeeks(generateEmptyCalendarForYear(year));
          setLeetcodeStats({ total: 0, activeDays: 0, streak: 0 });
        }
      } else {
        if (res.status === 404) {
          alert(`LeetCode user "${lc}" not found or profile is private.`);
          setLeetcodeWeeks(generateEmptyCalendarForYear(year));
          setLeetcodeStats({ total: 0, activeDays: 0, streak: 0 });
        } else {
          isLeetcodeDemo = true;
        }
      }
    } catch (err) {
      isLeetcodeDemo = true;
      isOffline = true;
    }

    // Mock Fallbacks
    if (isGithubDemo) {
      const mock = generateMockGithub(gh, year);
      processGithubData(mock);
    }
    if (isLeetcodeDemo) {
      const mock = generateMockLeetcode(lc, year);
      processLeetcodeData(mock, year);
    }

    // Connection diagnostics text updates
    if (!isGithubDemo && !isLeetcodeDemo) {
      setConnStatus("live");
      setConnText("Live Sync Active (FastAPI Connected)");
    } else if (isOffline) {
      setConnStatus("demo");
      setConnText("Offline Demo Mode (Backend not running, using mock engine)");
    } else if (isGithubDemo) {
      setConnStatus("warning");
      setConnText("Demo Mode: GITHUB_TOKEN missing on backend, using mock engine for GitHub");
    } else {
      setConnStatus("warning");
      setConnText("Demo Mode: LeetCode profile private or error, using mock engine");
    }

    setLoading(false);
  };

  const handleYearChange = (year: number | undefined) => {
    setSelectedYear(year);
    loadData(false, year);
  };

  // Initial Load on mount
  useEffect(() => {
    loadData(true);
  }, []);

  const handleHoverCell = (e: React.MouseEvent, text: string, color: string) => {
    setTooltip({
      content: text,
      x: e.clientX,
      y: e.clientY,
      visible: true,
      color,
    });
  };

  const handleLeaveCell = () => {
    setTooltip((prev) => ({ ...prev, visible: false }));
  };

  return (
    <>
      <div className="container">
        <Header />

        {/* Controls */}
        <div className="controls-wrapper">
          <div className="input-group">
            {INPUT_GITHUB_ICON}
            <input
              type="text"
              placeholder="GitHub Username"
              value={githubUser}
              onChange={(e) => setGithubUser(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && loadData(true)}
            />
          </div>
          <div className="input-divider" />
          <div className="input-group">
            {INPUT_LEETCODE_ICON}
            <input
              type="text"
              placeholder="LeetCode Username"
              value={leetcodeUser}
              onChange={(e) => setLeetcodeUser(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && loadData(true)}
            />
          </div>
          <button
            className={`btn-generate ${loading ? "loading" : ""}`}
            onClick={() => loadData(true)}
          >
            {loading ? (
              <svg
                className="spinner"
                viewBox="0 0 24 24"
                width="16"
                height="16"
                stroke="currentColor"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
              >
                <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.2)"></circle>
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
              </svg>
            ) : null}
            <span className="btn-text">Generate</span>
          </button>
        </div>

        {/* Toggle view tabs */}
        <Toggle currentView={view} onChange={(v) => setView(v)} />

        {/* Toggle year tabs */}
        <YearToggle currentYear={selectedYear} onChange={handleYearChange} />

        {/* Cards Layout */}
        <div className="cards-wrapper">
          <AnimatePresence mode="popLayout">
            {(view === "combined" || view === "github") && (
              <motion.div
                key="github-card"
                className="card-container github-container"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.12, ease: "easeOut" }}
              >
                <GlassPanel theme="github" id="github-panel">
                  <div className="card-header">
                    <div className="card-title-group">
                      <span className="card-category">GitHub Activity</span>
                      <div className="card-main-row">
                        <h2 className="card-main-val">
                          {githubStats.total} <span className="card-main-unit">Contributions</span>
                        </h2>
                        <div className="card-badges-row">
                          <span className="badge-stat badge-active">
                            <span className="badge-dot" style={{ backgroundColor: "var(--gh-green-4)" }} />
                            {githubStats.activeDays} Days Active
                          </span>
                          <span className="badge-stat badge-streak">
                            <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" style={{ opacity: 0.85 }}>
                              <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Streak: {githubStats.streak}d
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="card-header-actions">
                      <span className="badge-user">@{activeGithubUser}</span>
                      <button className="btn-action-more" aria-label="More options">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                          <path d="M5 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm14 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-7 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {githubWeeks.length > 0 && (
                    <Heatmap
                      weeks={githubWeeks}
                      type="github"
                      onHoverCell={handleHoverCell}
                      onLeaveCell={handleLeaveCell}
                      year={selectedYear}
                    />
                  )}
                </GlassPanel>
              </motion.div>
            )}

            {(view === "combined" || view === "leetcode") && (
              <motion.div
                key="leetcode-card"
                className="card-container leetcode-container"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.12, ease: "easeOut" }}
              >
                <GlassPanel theme="leetcode" id="leetcode-panel">
                  <div className="card-header">
                    <div className="card-title-group">
                      <span className="card-category">LeetCode Activity</span>
                      <div className="card-main-row">
                        <h2 className="card-main-val">
                          {leetcodeStats.total} <span className="card-main-unit">Submissions</span>
                        </h2>
                        <div className="card-badges-row">
                          <span className="badge-stat badge-active">
                            <span className="badge-dot" style={{ backgroundColor: "var(--lc-orange-4)" }} />
                            {leetcodeStats.activeDays} Days Active
                          </span>
                          <span className="badge-stat badge-streak">
                            <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" style={{ opacity: 0.85 }}>
                              <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Streak: {leetcodeStats.streak}d
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="card-header-actions">
                      <span className="badge-user">@{activeLeetcodeUser}</span>
                      <button className="btn-action-more" aria-label="More options">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                          <path d="M5 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm14 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-7 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {leetcodeWeeks.length > 0 && (
                    <Heatmap
                      weeks={leetcodeWeeks}
                      type="leetcode"
                      onHoverCell={handleHoverCell}
                      onLeaveCell={handleLeaveCell}
                      year={selectedYear}
                    />
                  )}
                </GlassPanel>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      <Tooltip
        content={tooltip.content}
        x={tooltip.x}
        y={tooltip.y}
        visible={tooltip.visible}
        borderColor={tooltip.color}
      />
    </>
  );
}

export default App;
