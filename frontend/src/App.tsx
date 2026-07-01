import React, { useState } from "react";
import { motion } from "framer-motion";
import { Header } from "./components/Header";
import { Toggle, type ViewType } from "./components/Toggle";
import { YearToggle } from "./components/YearToggle";
import { GlassPanel } from "./components/GlassPanel";

import { Heatmap, type CalendarDay } from "./components/Heatmap";
import { Tooltip } from "./components/Tooltip";




const INPUT_GITHUB_ICON = (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M12.01 2c-5.53 0-10 4.47-10 10 0 4.42 2.87 8.17 6.84 9.49.5.09.68-.22.68-.48 0-.24-.01-.87-.01-1.7-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.1.39-1.99 1.03-2.69-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.69 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85 0 1.34-.01 2.42-.01 2.75 0 .27.18.58.69.48C19.14 20.16 22 16.42 22 12c0-5.53-4.47-10-10-10z" />
  </svg>
);

const INPUT_LEETCODE_ICON = (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M20.303 16.047h-9.561c-.936 0-1.697-.803-1.697-1.79s.762-1.79 1.697-1.79h9.561c.936 0 1.697.803 1.697 1.79s-.762 1.79-1.697 1.79zm-9.561-2.58c-.385 0-.697.354-.697.79s.312.79.697.79h9.561c.385 0 .697-.354.697-.79s-.312-.79-.697-.79h-9.561z" />
    <path d="M11.618 24c-1.604 0-2.977-.533-3.97-1.541L3.55 18.278C2.551 17.262 2 15.819 2 14.215c0-1.578.551-3.008 1.552-4.025L13.071.509c.66-.67 1.829-.652 2.506.036.694.706.71 1.839.034 2.524l-1.762 1.816a5.25 5.25 0 0 1 1.739 1.159l2.463 2.53c.672.684.655 1.815-.039 2.521a1.79 1.79 0 0 1-1.284.545c-.464 0-.896-.181-1.219-.509l-2.536-2.492c-.321-.327-.779-.49-1.367-.49-.606 0-1.069.157-1.375.469l-4.067 4.194c-.342.349-.521.831-.521 1.4 0 .577.189 1.101.519 1.436l4.083 4.182c.315.321.774.484 1.362.484s1.045-.163 1.36-.484l2.549-2.505a1.687 1.687 0 0 1 1.209-.503h.002c.483 0 .939.194 1.286.546.693.705.71 1.837.036 2.522l-2.457 2.525C14.586 23.438 13.176 24 11.618 24zM14.29 1a.703.703 0 0 0-.507.21l-9.519 9.681C3.449 11.72 3 12.9 3 14.215c0 1.341.449 2.535 1.265 3.363l.001.001 4.097 4.18C9.162 22.57 10.288 23 11.618 23c1.288 0 2.444-.455 3.258-1.282l2.457-2.525c.295-.301.279-.804-.034-1.122a.801.801 0 0 0-.573-.247h-.001a.703.703 0 0 0-.502.209l-2.549 2.505c-.497.507-1.214.778-2.068.778s-1.572-.271-2.076-.784L5.446 16.35c-.519-.527-.805-1.286-.805-2.136 0-.824.286-1.57.806-2.099l4.067-4.194c.503-.512 1.206-.771 2.091-.771.854 0 1.571.271 2.074.783l2.536 2.492a.705.705 0 0 0 .512.216.798.798 0 0 0 .571-.246c.313-.319.33-.822.037-1.121l-2.461-2.528a4.238 4.238 0 0 0-2.028-1.137c-.175-.041-.331-.176-.382-.349s-.021-.363.104-.492l2.325-2.398c.298-.302.282-.805-.031-1.124A.799.799 0 0 0 14.29 1z" />
  </svg>
);

const generateEmptyCalendarForYear = (year?: number | null): CalendarDay[][] => {
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

const getUnifiedWeeks = (ghWeeks: CalendarDay[][], lcWeeks: CalendarDay[][]): CalendarDay[][] => {
  if (ghWeeks.length === 0) return lcWeeks;
  if (lcWeeks.length === 0) return ghWeeks;

  const lcMap: Record<string, CalendarDay> = {};
  lcWeeks.forEach((week) => {
    week.forEach((day) => {
      if (day.date) {
        lcMap[day.date] = day;
      }
    });
  });

  return ghWeeks.map((week) => {
    return week.map((ghDay) => {
      if (!ghDay.date) {
        return { ...ghDay };
      }
      const lcDay = lcMap[ghDay.date];
      const githubCount = ghDay.count;
      const leetcodeCount = lcDay ? lcDay.count : 0;
      const totalCount = githubCount + leetcodeCount;

      let level = 0;
      if (totalCount > 0) {
        if (totalCount <= 2) level = 1;
        else if (totalCount <= 5) level = 2;
        else if (totalCount <= 9) level = 3;
        else level = 4;
      }

      return {
        date: ghDay.date,
        count: totalCount,
        level,
        githubCount,
        leetcodeCount,
      };
    });
  });
};

function App() {
  const [githubUser, setGithubUser] = useState("");
  const [leetcodeUser, setLeetcodeUser] = useState("");
  const [activeGithubUser, setActiveGithubUser] = useState("");
  const [activeLeetcodeUser, setActiveLeetcodeUser] = useState("");

  const [view, setView] = useState<ViewType>("unified");
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  // Incremented on each successful load to trigger animation replay
  const [loadCount, setLoadCount] = useState(0);

  // Heatmap Calendars
  const [githubWeeks, setGithubWeeks] = useState<CalendarDay[][]>([]);
  const [leetcodeWeeks, setLeetcodeWeeks] = useState<CalendarDay[][]>([]);

  // Stats Counters
  const [githubStats, setGithubStats] = useState({ total: 0, activeDays: 0, streak: 0 });
  const [leetcodeStats, setLeetcodeStats] = useState({ total: 0, activeDays: 0, streak: 0 });

  // Inline error toast
  const [error, setError] = useState<string | null>(null);

  // Floating Tooltip State
  const [tooltip, setTooltip] = useState({
    content: "",
    x: 0,
    y: 0,
    visible: false,
    color: "",
  });

  const apiHost = import.meta.env.VITE_API_URL || "http://localhost:8000";

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

  const processLeetcodeData = (data: any, year?: number | null) => {
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
  const loadData = async (forceUpdateUsers = false, year: number | null | undefined = selectedYear) => {
    const gh = githubUser.trim();
    const lc = leetcodeUser.trim();

    // Validate inputs before hitting the API
    if (!gh && !lc) {
      setError("Please enter at least one username to generate a heatmap.");
      return;
    }
    if (!gh) {
      setError("Please enter your GitHub username.");
      return;
    }
    if (!lc) {
      setError("Please enter your LeetCode username.");
      return;
    }

    setError(null);
    setLoading(true);

    if (forceUpdateUsers) {
      setActiveGithubUser(gh);
      setActiveLeetcodeUser(lc);
    }

    const yearParam = year ? `?year=${year}` : "";

    // Fetch GitHub
    try {
      const res = await fetch(`${apiHost}/api/github/heatmap/${gh}${yearParam}`);
      if (res.ok) {
        const data = await res.json();
        processGithubData(data);
      } else if (res.status === 404) {
        setError(`GitHub user "${gh}" not found. Check the username and try again.`);
        setGithubWeeks(generateEmptyCalendarForYear(year));
        setGithubStats({ total: 0, activeDays: 0, streak: 0 });
      } else {
        setError("GitHub API error. Please try again in a moment.");
        setGithubWeeks(generateEmptyCalendarForYear(year));
        setGithubStats({ total: 0, activeDays: 0, streak: 0 });
      }
    } catch {
      setError("Could not reach the server. Make sure the backend is running.");
      setGithubWeeks(generateEmptyCalendarForYear(year));
      setGithubStats({ total: 0, activeDays: 0, streak: 0 });
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
      } else if (res.status === 404) {
        setError((prev) =>
          prev
            ? prev + ` Also: LeetCode user "${lc}" not found.`
            : `LeetCode user "${lc}" not found or profile is private.`
        );
        setLeetcodeWeeks(generateEmptyCalendarForYear(year));
        setLeetcodeStats({ total: 0, activeDays: 0, streak: 0 });
      } else {
        setLeetcodeWeeks(generateEmptyCalendarForYear(year));
        setLeetcodeStats({ total: 0, activeDays: 0, streak: 0 });
      }
    } catch {
      setLeetcodeWeeks(generateEmptyCalendarForYear(year));
      setLeetcodeStats({ total: 0, activeDays: 0, streak: 0 });
    }

    setLoading(false);
    setLoadCount((c) => c + 1);
  };

  const handleYearChange = (year: number | null) => {
    setSelectedYear(year);
    loadData(false, year);
  };

  // No auto-load on mount — user must enter usernames and click Generate

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

        {/* Error Toast */}
        {error && (
          <motion.div
            className="error-toast"
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style={{ flexShrink: 0 }}>
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
            <span>{error}</span>
            <button className="error-toast-dismiss" onClick={() => setError(null)} aria-label="Dismiss error">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>
          </motion.div>
        )}

        {/* Controls */}
        <div className="controls-wrapper">
          <div className="input-group">
            {INPUT_GITHUB_ICON}
            <div className="input-with-label">
              <label htmlFor="github-username-input" className="input-label">
                GitHub USERNAME
              </label>
              <input
                id="github-username-input"
                type="text"
                value={githubUser}
                onChange={(e) => setGithubUser(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && loadData(true)}
              />
            </div>
          </div>
          <div className="input-divider" />
          <div className="input-group">
            {INPUT_LEETCODE_ICON}
            <div className="input-with-label">
              <label htmlFor="leetcode-username-input" className="input-label">
                LeetCode USERNAME
              </label>
              <input
                id="leetcode-username-input"
                type="text"
                value={leetcodeUser}
                onChange={(e) => setLeetcodeUser(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && loadData(true)}
              />
            </div>
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
        {(() => {
          const unifiedWeeks = getUnifiedWeeks(githubWeeks, leetcodeWeeks);

          let unifiedActiveDays = 0;
          let unifiedCurrentStreak = 0;
          let unifiedMaxStreak = 0;

          unifiedWeeks.forEach((week) => {
            week.forEach((day) => {
              if (day.count > 0) {
                unifiedActiveDays++;
                unifiedCurrentStreak++;
                if (unifiedCurrentStreak > unifiedMaxStreak) {
                  unifiedMaxStreak = unifiedCurrentStreak;
                }
              } else {
                unifiedCurrentStreak = 0;
              }
            });
          });

          const unifiedTotal = githubStats.total + leetcodeStats.total;

          return (
            <div 
              className="cards-wrapper"
              style={{
                gap: view === "combined" ? "30px" : "0px",
                transition: "gap 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
              }}
            >
              {/* Unified Card */}
              <motion.div
                layout
                key="unified-card"
                className="card-container unified-container"
                style={{
                  flex: view === "unified" ? "1 1 0%" : "0 0 0%",
                  opacity: view === "unified" ? 1 : 0,
                  pointerEvents: view === "unified" ? "auto" : "none",
                  overflow: "hidden",
                }}
                transition={{
                  type: "spring",
                  stiffness: 280,
                  damping: 28,
                  opacity: { duration: 0.15 }
                }}
              >
                <GlassPanel theme="unified" id="unified-panel">
                  <div className="card-header">
                    <div className="card-title-group">
                      <span className="card-category">Unified Activity</span>
                      <div className="card-main-row">
                        <h2 className="card-main-val">
                          {unifiedTotal} <span className="card-main-unit">Total Activities</span>
                        </h2>
                        <div className="card-badges-row">
                          <span className="badge-stat badge-active">
                            <span className="badge-dot" style={{ backgroundColor: "var(--sc-red-4)" }} />
                            {unifiedActiveDays} Combined Days
                          </span>
                          <span className="badge-stat badge-streak">
                            <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" style={{ opacity: 0.85 }}>
                              <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Streak: {unifiedMaxStreak}d
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="card-header-actions">
                      <span className="badge-user">@{activeGithubUser} + @{activeLeetcodeUser}</span>
                      <button className="btn-action-more" aria-label="More options">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                          <path d="M5 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm14 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-7 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {unifiedWeeks.length > 0 && (
                    <Heatmap
                      weeks={unifiedWeeks}
                      type="unified"
                      onHoverCell={handleHoverCell}
                      onLeaveCell={handleLeaveCell}
                      year={selectedYear}
                      direction="ltr"
                      animKey={loadCount}
                    />
                  )}
                </GlassPanel>
              </motion.div>

              {/* GitHub Card */}
              <motion.div
                layout
                key="github-card"
                className="card-container github-container"
                style={{
                  flex: view === "combined" || view === "github" ? "1 1 0%" : "0 0 0%",
                  opacity: view === "combined" || view === "github" ? 1 : 0,
                  pointerEvents: view === "combined" || view === "github" ? "auto" : "none",
                  overflow: "hidden",
                }}
                transition={{
                  type: "spring",
                  stiffness: 280,
                  damping: 28,
                  opacity: { duration: 0.15 }
                }}
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
                      direction="ltr"
                      animKey={loadCount}
                    />
                  )}
                </GlassPanel>
              </motion.div>

              {/* LeetCode Card */}
              <motion.div
                layout
                key="leetcode-card"
                className="card-container leetcode-container"
                style={{
                  flex: view === "combined" || view === "leetcode" ? "1 1 0%" : "0 0 0%",
                  opacity: view === "combined" || view === "leetcode" ? 1 : 0,
                  pointerEvents: view === "combined" || view === "leetcode" ? "auto" : "none",
                  overflow: "hidden",
                }}
                transition={{
                  type: "spring",
                  stiffness: 280,
                  damping: 28,
                  opacity: { duration: 0.15 }
                }}
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
                      direction="rtl"
                      animKey={loadCount}
                    />
                  )}
                </GlassPanel>
              </motion.div>
            </div>
          );
        })()}

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
