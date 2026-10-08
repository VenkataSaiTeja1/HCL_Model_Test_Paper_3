/**
 * HCL Campus Drive — Model Test Paper 3
 * --------------------------------------------------------------------------
 * A self-contained React component (no external UI libraries) for final-year
 * B.Tech students (CSE, CSM, CAI, CSD, IT, ECE, EEE).
 *
 * Tabs
 *   1. Question Bank – Paper 3: 30 MCQs (A1 Quant 10 · A2 Reasoning 8 · A3 Computer Fundamentals 12)
 *                      + the Section B coding problem, with section chips, filters, search, sort
 *   2. Mock Test     – timed test: full Section A (30 Qs · 60 min) or one section
 *   3. Coding Round  – Section B: Minimum Server Capacity (Binary search on the answer), Java + Python solutions, extra tests
 *
 * Content
 *   • Questions, options, answers and working are exactly those of the Word paper
 *     HCL_Model_Test_Paper_3.docx and its answer key (unchanged).
 *   • Topic and difficulty tags were added for filtering only.
 *
 * Usage: drop into any React 18+ project (Vite/CRA/Next client component) and
 * render <HCLModelTestPaper3 />. Progress is kept in component state and, where
 * the browser allows it, mirrored to localStorage (safe no-op otherwise).
 */
import { useEffect, useMemo, useRef, useState } from "react";

// ─── QUESTION BANK (Paper 3: 30 MCQs + 1 coding problem) ─────────────────
// MCQ fields: id, paper, no (question number in the paper), cat (quant|reasoning|technical), topic, diff,
//             time (sec), q, code?, lang?, opts[], ans (index), sol
// Coding item (type: "coding", id P3-B) instead carries: pattern, statement, input, output, constraints,
//             samples[{in,out,note}], tests[{in,out}], approach, complexity, marking, java, python
const BANK = [
  {"id": "P3-Q01", "paper": 3, "no": 1, "cat": "quant", "topic": "Percentages", "diff": "Easy", "time": 45, "q": "Two successive increases of 10% and 20% are equivalent to a single increase of:", "opts": ["32%", "30%", "28%", "34%"], "ans": 0, "sol": "1.1 × 1.2 = 1.32"},
  {"id": "P3-Q02", "paper": 3, "no": 2, "cat": "quant", "topic": "Time & Work", "diff": "Medium", "time": 60, "q": "8 men or 12 women can finish a job in 15 days. In how many days will 4 men and 6 women finish it?", "opts": ["10 days", "20 days", "12 days", "15 days"], "ans": 3, "sol": "1 man = 1.5 women; 4 men + 6 women = 12 women → 15 days"},
  {"id": "P3-Q03", "paper": 3, "no": 3, "cat": "quant", "topic": "Speed & Distance", "diff": "Easy", "time": 45, "q": "A man rows 24 km downstream in 3 hours and 12 km upstream in 3 hours. His speed in still water is:", "opts": ["4 km/h", "5 km/h", "6 km/h", "8 km/h"], "ans": 2, "sol": "Down 8, up 4 → (8 + 4)/2 = 6"},
  {"id": "P3-Q04", "paper": 3, "no": 4, "cat": "quant", "topic": "Averages", "diff": "Medium", "time": 60, "q": "The average of 11 results is 50. The average of the first six is 49 and of the last six is 52. The sixth result is:", "opts": ["54", "56", "58", "50"], "ans": 1, "sol": "294 + 312 − 550 = 56"},
  {"id": "P3-Q05", "paper": 3, "no": 5, "cat": "quant", "topic": "Interest", "diff": "Medium", "time": 60, "q": "At what rate of compound interest per annum will ₹5,000 become ₹7,200 in 2 years?", "opts": ["20%", "18%", "22%", "24%"], "ans": 0, "sol": "(1 + r)² = 1.44 → r = 0.2"},
  {"id": "P3-Q06", "paper": 3, "no": 6, "cat": "quant", "topic": "Ratio & Proportion", "diff": "Easy", "time": 45, "q": "If a : b = 2 : 3 and b : c = 4 : 5, then a : b : c is:", "opts": ["8 : 12 : 15", "2 : 3 : 5", "8 : 12 : 10", "6 : 9 : 10"], "ans": 0, "sol": "Make b common: 8 : 12 and 12 : 15"},
  {"id": "P3-Q07", "paper": 3, "no": 7, "cat": "quant", "topic": "Permutations & Combinations", "diff": "Medium", "time": 60, "q": "In how many ways can 4 boys and 3 girls sit in a row so that the 3 girls are always together?", "opts": ["1,440", "720", "5,040", "144"], "ans": 1, "sol": "Treat girls as one unit: 5! × 3! = 720"},
  {"id": "P3-Q08", "paper": 3, "no": 8, "cat": "quant", "topic": "Number System", "diff": "Medium", "time": 60, "q": "How many numbers from 1 to 100 are divisible by 3 or 5?", "opts": ["53", "45", "47", "50"], "ans": 2, "sol": "33 + 20 − 6 = 47"},
  {"id": "P3-Q09", "paper": 3, "no": 9, "cat": "quant", "topic": "Number System", "diff": "Easy", "time": 45, "q": "The HCF of 84, 126 and 210 is:", "opts": ["21", "14", "42", "63"], "ans": 2, "sol": "84 = 2²·3·7, 126 = 2·3²·7, 210 = 2·3·5·7 → 2·3·7 = 42"},
  {"id": "P3-Q10", "paper": 3, "no": 10, "cat": "quant", "topic": "Probability", "diff": "Easy", "time": 45, "q": "A bag has 4 red and 6 green balls. Two balls are drawn one after another with replacement. The probability that both are green is:", "opts": ["9/25", "3/5", "1/3", "6/25"], "ans": 0, "sol": "(6/10)² = 9/25"},
  {"id": "P3-Q11", "paper": 3, "no": 11, "cat": "reasoning", "topic": "Number Series", "diff": "Easy", "time": 45, "q": "Find the next number: 4, 9, 25, 49, 121, ?", "opts": ["144", "169", "196", "225"], "ans": 1, "sol": "Squares of primes 2, 3, 5, 7, 11, 13"},
  {"id": "P3-Q12", "paper": 3, "no": 12, "cat": "reasoning", "topic": "Odd One Out", "diff": "Easy", "time": 45, "q": "Choose the odd one out: 3, 5, 7, 9, 11", "opts": ["3", "7", "9", "11"], "ans": 2, "sol": "9 is the only non-prime"},
  {"id": "P3-Q13", "paper": 3, "no": 13, "cat": "reasoning", "topic": "Coding–Decoding", "diff": "Medium", "time": 60, "q": "If FRIEND is coded as HUMJTK, then CANDLE is coded as:", "opts": ["EDRIRK", "EDRJRL", "ECRIRL", "EDRIRL"], "ans": 3, "sol": "Shifts +2, +3, +4, +5, +6, +7"},
  {"id": "P3-Q14", "paper": 3, "no": 14, "cat": "reasoning", "topic": "Blood Relations", "diff": "Medium", "time": 60, "q": "A is B's brother. C is A's mother. D is C's father. E is D's son. How is E related to A?", "opts": ["Grandfather", "Maternal uncle", "Brother", "Cousin"], "ans": 1, "sol": "E is C's brother, and C is A's mother"},
  {"id": "P3-Q15", "paper": 3, "no": 15, "cat": "reasoning", "topic": "Directions", "diff": "Hard", "time": 90, "q": "One evening Ravi stood facing the setting sun. He turned right, then turned 135° clockwise. Which direction is he facing now?", "opts": ["South-East", "South-West", "North-East", "South"], "ans": 0, "sol": "Facing west → right turn = north → 135° clockwise = south-east"},
  {"id": "P3-Q16", "paper": 3, "no": 16, "cat": "reasoning", "topic": "Counting Figures", "diff": "Medium", "time": 60, "q": "How many squares of all sizes are there on an 8 × 8 chessboard?", "opts": ["204", "64", "196", "256"], "ans": 0, "sol": "1² + 2² + … + 8² = 204"},
  {"id": "P3-Q17", "paper": 3, "no": 17, "cat": "reasoning", "topic": "Seating & Ranking", "diff": "Easy", "time": 45, "q": "Five people stand in a queue. T is at the front. P is ahead of Q but behind R. S is behind Q. Who is third in the queue?", "opts": ["R", "P", "Q", "S"], "ans": 1, "sol": "Order: T, R, P, Q, S"},
  {"id": "P3-Q18", "paper": 3, "no": 18, "cat": "reasoning", "topic": "Data Sufficiency", "diff": "Medium", "time": 60, "q": "What is the code for 'sky' in a certain language?\nStatement I: 'sky is blue' is written as 'ta na ka'.\nStatement II: 'blue is nice' is written as 'na ka pi'.", "opts": ["Statement I alone is sufficient", "Statement II alone is sufficient", "Either statement alone is sufficient", "Both statements together are needed"], "ans": 3, "sol": "Common words 'is blue' = 'na ka'; so 'sky' = 'ta' only when both are used"},
  {"id": "P3-Q19", "paper": 3, "no": 19, "cat": "technical", "topic": "Operating Systems", "diff": "Easy", "time": 45, "q": "Which UNIX system call creates a new process?", "opts": ["exec()", "wait()", "fork()", "exit()"], "ans": 2, "sol": "fork() duplicates the calling process; exec() replaces its image"},
  {"id": "P3-Q20", "paper": 3, "no": 20, "cat": "technical", "topic": "Operating Systems", "diff": "Easy", "time": 45, "q": "When a running process requests I/O, it moves to the:", "opts": ["Ready state", "Terminated state", "New state", "Waiting (blocked) state"], "ans": 3, "sol": "It waits until the I/O completes, then goes to Ready"},
  {"id": "P3-Q21", "paper": 3, "no": 21, "cat": "technical", "topic": "Computer Networks", "diff": "Easy", "time": 45, "q": "Which protocol automatically assigns IP addresses to devices on a network?", "opts": ["DNS", "ARP", "FTP", "DHCP"], "ans": 3, "sol": "Dynamic Host Configuration Protocol"},
  {"id": "P3-Q22", "paper": 3, "no": 22, "cat": "technical", "topic": "Computer Networks", "diff": "Easy", "time": 45, "q": "In which network topology are all devices connected to a single central device?", "opts": ["Bus", "Star", "Ring", "Mesh"], "ans": 1, "sol": "Star uses a central switch or hub"},
  {"id": "P3-Q23", "paper": 3, "no": 23, "cat": "technical", "topic": "DBMS & SQL", "diff": "Easy", "time": 45, "q": "Which condition returns employees whose name starts with 'S'?", "opts": ["WHERE name LIKE 'S%'", "WHERE name LIKE '%S'", "WHERE name = 'S%'", "WHERE name LIKE 'S_'"], "ans": 0, "sol": "'S%' = S followed by anything"},
  {"id": "P3-Q24", "paper": 3, "no": 24, "cat": "technical", "topic": "DBMS & SQL", "diff": "Hard", "time": 90, "q": "Relation R(A, B, C) has key A and dependencies A → B and B → C. The highest normal form R satisfies is:", "opts": ["1NF", "3NF", "2NF", "BCNF"], "ans": 2, "sol": "No partial dependency (single-attribute key), but A → B → C is transitive"},
  {"id": "P3-Q25", "paper": 3, "no": 25, "cat": "technical", "topic": "Data Structures", "diff": "Medium", "time": 60, "q": "The value of the postfix expression 6 2 3 + − 3 8 2 / + * is:", "opts": ["5", "7", "1", "49"], "ans": 1, "sol": "6 − (2 + 3) = 1; 3 + 8/2 = 7; 1 × 7 = 7"},
  {"id": "P3-Q26", "paper": 3, "no": 26, "cat": "technical", "topic": "Data Structures", "diff": "Medium", "time": 60, "q": "The minimum height of a binary tree with 15 nodes (root at height 0) is:", "opts": ["4", "3", "14", "7"], "ans": 1, "sol": "A perfect tree of height 3 has 2⁴ − 1 = 15 nodes"},
  {"id": "P3-Q27", "paper": 3, "no": 27, "cat": "technical", "topic": "Data Structures", "diff": "Easy", "time": 45, "q": "The space needed by an adjacency matrix for a graph with V vertices is:", "opts": ["O(V + E)", "O(E)", "O(V)", "O(V²)"], "ans": 3, "sol": "A V × V matrix"},
  {"id": "P3-Q28", "paper": 3, "no": 28, "cat": "technical", "topic": "OOP & Java", "diff": "Easy", "time": 45, "q": "Which statement about an abstract class in Java is true?", "opts": ["It cannot have constructors", "All its methods must be abstract", "It cannot be instantiated", "It cannot have fields"], "ans": 2, "sol": "Abstract classes may have constructors, fields and concrete methods"},
  {"id": "P3-Q29", "paper": 3, "no": 29, "cat": "technical", "topic": "Output Prediction", "diff": "Easy", "time": 45, "q": "What is the output of the following Python code?", "code": "a = [1, 2, 3]\nb = a\nb.append(4)\nprint(len(a))", "lang": "python", "opts": ["3", "Error", "1", "4"], "ans": 3, "sol": "b refers to the same list as a, so a also has 4 elements"},
  {"id": "P3-Q30", "paper": 3, "no": 30, "cat": "technical", "topic": "Output Prediction", "diff": "Medium", "time": 60, "q": "What is the output of the following C code?", "code": "printf(\"%d\", 7 >> 1 | 1 << 2);", "lang": "c", "opts": ["7", "6", "4", "3"], "ans": 0, "sol": "Shifts bind tighter than |: (7 >> 1) | (1 << 2) = 3 | 4 = 7"},
  {"id": "P3-B", "paper": 3, "no": 31, "cat": "coding", "type": "coding", "topic": "Coding: Binary search on the answer", "diff": "Medium", "time": 2700, "q": "Minimum Server Capacity", "pattern": "Binary search on the answer", "statement": "A data team must process N batch jobs in the given order within D days. Each day the server processes a continuous group of the next jobs, and the total size processed in a day cannot exceed the server's daily capacity. A job cannot be split across days.\n\nPrint the minimum daily capacity that lets all jobs finish within D days.", "input": "Line 1: two integers N and D.\nLine 2: N space-separated integers, the job sizes in order.", "output": "A single integer: the minimum daily capacity.", "constraints": "1 ≤ D ≤ N ≤ 10^5\n1 ≤ job size ≤ 10^4\nExpected time complexity: O(N log(sum of sizes))", "samples": [{"in": "10 5\n1 2 3 4 5 6 7 8 9 10\n", "out": "15\n", "note": "Days: [1–5], [6,7], [8], [9], [10] with capacity 15."}, {"in": "6 3\n3 2 2 4 1 4\n", "out": "6\n", "note": ""}, {"in": "5 4\n1 2 3 1 1\n", "out": "3\n", "note": ""}], "tests": [{"in": "1 1\n7\n", "out": "7\n"}, {"in": "4 4\n5 5 5 5\n", "out": "5\n"}, {"in": "4 1\n2 3 4 5\n", "out": "14\n"}], "approach": "The answer lies between the largest job (every job must fit in one day) and the total of all jobs (one day). For a candidate capacity, one greedy pass counts the days needed. Binary search for the smallest capacity that needs at most D days. Time O(N log S) where S is the sum of sizes.", "complexity": "O(N log S) time, O(1) extra space", "marking": "Common mistake: starting the search at 1 instead of the largest job, which lets a single job exceed the capacity. A linear search over capacities is correct but slow — award at most 8 correctness marks and 0 efficiency marks.", "java": "import java.util.*;\nimport java.io.*;\npublic class Main {\n    static int[] jobs;\n    static int daysNeeded(long cap) {\n        int days = 1; long load = 0;\n        for (int j : jobs) {\n            if (load + j > cap) { days++; load = 0; }\n            load += j;\n        }\n        return days;\n    }\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        StringTokenizer st = new StringTokenizer(br.readLine());\n        int n = Integer.parseInt(st.nextToken()), d = Integer.parseInt(st.nextToken());\n        jobs = new int[n];\n        st = new StringTokenizer(br.readLine());\n        long lo = 0, hi = 0;\n        for (int i = 0; i < n; i++) {\n            jobs[i] = Integer.parseInt(st.nextToken());\n            lo = Math.max(lo, jobs[i]);\n            hi += jobs[i];\n        }\n        while (lo < hi) {\n            long mid = (lo + hi) / 2;\n            if (daysNeeded(mid) <= d) hi = mid; else lo = mid + 1;\n        }\n        System.out.println(lo);\n    }\n}", "python": "n, d = map(int, input().split())\njobs = list(map(int, input().split()))\ndef days_needed(cap):\n    days, load = 1, 0\n    for j in jobs:\n        if load + j > cap:\n            days += 1\n            load = 0\n        load += j\n    return days\nlo, hi = max(jobs), sum(jobs)\nwhile lo < hi:\n    mid = (lo + hi) // 2\n    if days_needed(mid) <= d:\n        hi = mid\n    else:\n        lo = mid + 1\nprint(lo)"}
];

// ─── STATIC CONTENT ─────────────────────────────────────────────────────────
const CATS = [
  { id: "quant", name: "Quantitative Aptitude", short: "Quant", icon: "∑", color: "#2563EB", section: "A1" },
  { id: "reasoning", name: "Logical Reasoning", short: "Reasoning", icon: "◇", color: "#7C3AED", section: "A2" },
  { id: "technical", name: "Computer Fundamentals", short: "Technical", icon: "</>", color: "#EA580C", section: "A3" },
  { id: "coding", name: "Coding (Section B)", short: "Coding", icon: "{ }", color: "#0D9488", section: "B" },
];
const CAT_BY_ID = Object.fromEntries(CATS.map((c) => [c.id, c]));
const COUNT = Object.fromEntries(CATS.map((c) => [c.id, BANK.filter((q) => q.cat === c.id).length]));
const MCQ_TOTAL = BANK.filter((q) => q.type !== "coding").length;
const CODING_ITEMS = BANK.filter((q) => q.type === "coding");
const PAPERS = [...new Set(BANK.map((q) => q.paper))];
const SINGLE = PAPERS.length === 1;
const DIFF_ORDER = { Easy: 0, Medium: 1, Hard: 2 };
const DIFF_META = {
  Easy: { fg: "#166534", bg: "#DCFCE7" },
  Medium: { fg: "#9A3412", bg: "#FFEDD5" },
  Hard: { fg: "#991B1B", bg: "#FEE2E2" },
};

const TEST_SCOPES = [
  { id: "full", name: "Full paper (Section A)", cats: ["quant", "reasoning", "technical"], minutes: 60 },
  { id: "quant", name: "A1 · Quant", cats: ["quant"], minutes: 20 },
  { id: "reasoning", name: "A2 · Reasoning", cats: ["reasoning"], minutes: 15 },
  { id: "technical", name: "A3 · Computer Fundamentals", cats: ["technical"], minutes: 25 },
];

// ─── HELPERS ────────────────────────────────────────────────────────────────
const LS_KEY = "hcl-model-paper-3-progress-v1";
function loadProgress() {
  try { return JSON.parse(window.localStorage.getItem(LS_KEY)) || {}; } catch { return {}; }
}
function saveProgress(p) {
  try { window.localStorage.setItem(LS_KEY, JSON.stringify(p)); } catch { /* storage unavailable: keep in memory */ }
}
const fmtTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

// ─── SMALL UI PIECES ────────────────────────────────────────────────────────
function Pill({ fg, bg, children, title }) {
  return <span className="pill" style={{ color: fg, background: bg }} title={title}>{children}</span>;
}
function CodeBlock({ code, lang }) {
  return (
    <div className="code">
      {lang && <span className="code-lang">{lang.toUpperCase()}</span>}
      <pre><code>{code}</code></pre>
    </div>
  );
}

/** A single MCQ card: answer by clicking an option, or reveal the solution. */
function QuestionCard({ q, index, record, onAnswer, showMeta = true, lockReveal = false }) {
  const [open, setOpen] = useState(false);
  const chosen = record?.choice;
  const answered = chosen !== undefined;
  const reveal = !lockReveal && (answered || open);
  const cat = CAT_BY_ID[q.cat];
  return (
    <article className="qcard" style={{ borderLeftColor: cat.color }}>
      <header className="qhead">
        <span className="qid" style={{ color: cat.color }}>Paper {q.paper} · Q{q.no}</span>
        <span className="qtopic">{q.topic}</span>
        <span className="spacer" />
        <Pill {...DIFF_META[q.diff]}>{q.diff}</Pill>
        <span className="qtime" title="Recommended time">⏱ {q.time}s</span>
      </header>
      <p className="qtext">{index !== undefined && <b>{index + 1}. </b>}{q.q}</p>
      {q.code && <CodeBlock code={q.code} lang={q.lang} />}
      <ol className="opts">
        {q.opts.map((o, i) => {
          let cls = "opt";
          if (reveal && i === q.ans) cls += " correct";
          else if (answered && i === chosen && chosen !== q.ans && !lockReveal) cls += " wrong";
          else if (answered && i === chosen) cls += " picked";
          return (
            <li key={i}>
              <button className={cls} onClick={() => onAnswer && onAnswer(q, i)} disabled={!onAnswer || (answered && !lockReveal)}>
                <span className="optkey">{String.fromCharCode(65 + i)}</span>
                <span>{o}</span>
              </button>
            </li>
          );
        })}
      </ol>
      {!lockReveal && (
        <div className="qfoot">
          <button className="link" onClick={() => setOpen((v) => !v)}>{reveal ? "Hide solution" : "Show solution"}</button>
        </div>
      )}
      {reveal && (
        <div className="sol">
          <div><b>Answer: {String.fromCharCode(65 + q.ans)}</b> — {q.opts[q.ans]}</div>
          <p>{q.sol}</p>
        </div>
      )}
      {showMeta && (
        <footer className="qmeta">
          <Pill fg="#1E40AF" bg="#DBEAFE">Model Test Paper {q.paper}</Pill>
          <span className="ref">Section {cat.section} — {cat.name}</span>
        </footer>
      )}
    </article>
  );
}

/** A coding problem: statement, I/O spec, samples, then approach / Java / Python / test cases on demand. */
function CodingCard({ q, solved, onToggle }) {
  const [view, setView] = useState(null); // null | "approach" | "java" | "python" | "tests"
  const cat = CAT_BY_ID[q.cat];
  const toggle = (v) => setView((cur) => (cur === v ? null : v));
  return (
    <article className="qcard coding" style={{ borderLeftColor: cat.color }}>
      <header className="qhead">
        <span className="qid" style={{ color: cat.color }}>Paper {q.paper} · Section B</span>
        <span className="qtopic">{q.topic}</span>
        <span className="spacer" />
        <Pill {...DIFF_META[q.diff]}>{q.diff}</Pill>
        <span className="qtime" title="Recommended time">⏱ {Math.round(q.time / 60)} min</span>
      </header>
      <h4 className="ctitle">{q.q}</h4>
      <p className="qtext">{q.statement}</p>
      <dl className="io">
        <dt>Input</dt><dd>{q.input}</dd>
        <dt>Output</dt><dd>{q.output}</dd>
        <dt>Constraints</dt><dd>{q.constraints}</dd>
      </dl>
      {q.samples.map((s, i) => (
        <div key={i} className="sample">
          <div><div className="sample-h">Sample input {q.samples.length > 1 ? i + 1 : ""}</div><pre>{s.in.replace(/\n$/, "")}</pre></div>
          <div><div className="sample-h">Sample output</div><pre>{s.out.replace(/\n$/, "")}</pre></div>
          {s.note && <div className="sample-note">{s.note}</div>}
        </div>
      ))}
      <div className="ctabs">
        <button className={view === "approach" ? "on" : ""} onClick={() => toggle("approach")}>Approach</button>
        <button className={view === "java" ? "on" : ""} onClick={() => toggle("java")}>Java solution</button>
        <button className={view === "python" ? "on" : ""} onClick={() => toggle("python")}>Python solution</button>
        <button className={view === "tests" ? "on" : ""} onClick={() => toggle("tests")}>Extra test cases</button>
        <span className="spacer" />
        <label className="solved"><input type="checkbox" checked={solved} onChange={() => onToggle(q)} /> Solved</label>
      </div>
      {view === "approach" && <div className="sol"><p>{q.approach}</p><p><b>Complexity:</b> {q.complexity}</p><p className="muted">{q.marking}</p></div>}
      {view === "java" && <CodeBlock code={q.java} lang="java" />}
      {view === "python" && <CodeBlock code={q.python} lang="python" />}
      {view === "tests" && q.tests.map((s, i) => (
        <div key={i} className="sample">
          <div><div className="sample-h">Test input {i + 1}</div><pre>{s.in.replace(/\n$/, "")}</pre></div>
          <div><div className="sample-h">Expected output</div><pre>{s.out.replace(/\n$/, "")}</pre></div>
        </div>
      ))}
      <footer className="qmeta">
        <Pill fg="#1E40AF" bg="#DBEAFE">Model Test Paper {q.paper}</Pill>
        <span className="ref">Pattern tested: {q.pattern}</span>
      </footer>
    </article>
  );
}

// ─── TABS ───────────────────────────────────────────────────────────────────
/** Labelled <select> used by the Question Bank filters. */
function Sel({ label, value, set, options }) {
  return (
    <label className="sel"><span>{label}</span>
      <select value={value} onChange={(e) => set(e.target.value)}>
        {options.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
      </select>
    </label>
  );
}

function Bank({ progress, cat = "all", setCat, paper = "all", setPaper, onAnswer, onSolved, onReset }) {
  const [diff, setDiff] = useState("all");
  const [topic, setTopic] = useState("all");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("id");
  const [query, setQuery] = useState("");

  const topics = useMemo(() => [...new Set(BANK.filter((q) => cat === "all" || q.cat === cat).map((q) => q.topic))].sort(), [cat]);
  useEffect(() => { setTopic("all"); }, [cat]);

  const list = useMemo(() => {
    const s = query.trim().toLowerCase();
    const r = BANK.filter((q) =>
      (cat === "all" || q.cat === cat) && (paper === "all" || q.paper === Number(paper)) &&
      (diff === "all" || q.diff === diff) && (topic === "all" || q.topic === topic) &&
      (status === "all" || (status === "todo" && !progress[q.id]) || (status === "wrong" && progress[q.id] && !progress[q.id].correct) || (status === "right" && progress[q.id]?.correct)) &&
      (!s || [q.q, q.topic, q.id, q.code || "", q.statement || "", (q.opts || []).join(" ")].join(" ").toLowerCase().includes(s))
    );
    const by = {
      id: (a, b) => BANK.indexOf(a) - BANK.indexOf(b),
      diff: (a, b) => DIFF_ORDER[a.diff] - DIFF_ORDER[b.diff] || BANK.indexOf(a) - BANK.indexOf(b),
      diffDesc: (a, b) => DIFF_ORDER[b.diff] - DIFF_ORDER[a.diff] || BANK.indexOf(a) - BANK.indexOf(b),
      time: (a, b) => a.time - b.time || BANK.indexOf(a) - BANK.indexOf(b),
      topic: (a, b) => a.topic.localeCompare(b.topic) || BANK.indexOf(a) - BANK.indexOf(b),
    }[sort];
    return [...r].sort(by);
  }, [cat, paper, diff, topic, status, sort, query, progress]);

  return (
    <div className="stack">
      {!SINGLE && <div className="chips">
        <button className={`chip ${paper === "all" ? "on" : ""}`} onClick={() => setPaper("all")}>All papers</button>
        {PAPERS.map((p) => <button key={p} className={`chip ${String(paper) === String(p) ? "on" : ""}`} onClick={() => setPaper(String(p))}>Paper {p}</button>)}
      </div>}
      <div className="chips">
        <button className={`chip ${cat === "all" ? "on" : ""}`} onClick={() => setCat("all")}>All sections ({BANK.length})</button>
        {CATS.map((c) => (
          <button key={c.id} className={`chip ${cat === c.id ? "on" : ""}`} style={cat === c.id ? { background: c.color, borderColor: c.color } : {}} onClick={() => setCat(c.id)}>{c.section} · {c.short} ({COUNT[c.id]})</button>
        ))}
      </div>
      <div className="filters">
        <input className="search" placeholder="Search questions, topics, code…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search" />
        <Sel label="Topic" value={topic} set={setTopic} options={[["all", "All topics"], ...topics.map((t) => [t, t])]} />
        <Sel label="Difficulty" value={diff} set={setDiff} options={[["all", "All"], ["Easy", "Easy"], ["Medium", "Medium"], ["Hard", "Hard"]]} />
        <Sel label="Status" value={status} set={setStatus} options={[["all", "All"], ["todo", "Not attempted"], ["wrong", "Got wrong"], ["right", "Got right"]]} />
        <Sel label="Sort" value={sort} set={setSort} options={[["id", "Paper order"], ["diff", "Easy → Hard"], ["diffDesc", "Hard → Easy"], ["time", "Shortest time"], ["topic", "Topic A–Z"]]} />
      </div>
      <div className="row">
        <span className="muted">{list.length} item{list.length === 1 ? "" : "s"} · est. {Math.round(list.reduce((a, q) => a + q.time, 0) / 60)} min</span>
        <span className="spacer" />
        <button className="link" onClick={onReset}>Reset progress</button>
      </div>
      {list.length === 0 && <div className="card muted">No questions match these filters.</div>}
      {list.map((q) => q.type === "coding"
        ? <CodingCard key={q.id} q={q} solved={!!progress[q.id]} onToggle={onSolved} />
        : <QuestionCard key={q.id} q={q} record={progress[q.id]} onAnswer={onAnswer} />)}
    </div>
  );
}

/** Timed test: a whole paper's Section A (30 questions, 60 min) or one section, in paper order. */
function MockTest() {
  const [paper, setPaper] = useState(PAPERS[0]);
  const [scopeId, setScopeId] = useState("full");
  const [test, setTest] = useState(null); // { qs, answers, start, submitted, paper, scope }
  const [now, setNow] = useState(Date.now());
  const timer = useRef(null);
  const scope = TEST_SCOPES.find((s) => s.id === (test ? test.scope : scopeId));
  const LIMIT = scope.minutes * 60;

  useEffect(() => {
    if (test && !test.submitted) { timer.current = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer.current); }
  }, [test]);
  const left = test ? Math.max(0, LIMIT - Math.floor((now - test.start) / 1000)) : LIMIT;
  useEffect(() => { if (test && !test.submitted && left === 0) setTest((t) => ({ ...t, submitted: true })); }, [left, test]);

  const start = () => {
    const qs = BANK.filter((q) => q.paper === paper && q.type !== "coding" && scope.cats.includes(q.cat));
    setTest({ qs, answers: {}, start: Date.now(), submitted: false, paper, scope: scopeId });
    setNow(Date.now());
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const score = test ? test.qs.filter((q) => test.answers[q.id] === q.ans).length : 0;
  const answeredCount = test ? Object.keys(test.answers).length : 0;

  if (!test) {
    return (
      <div className="stack">
        <section className="card">
          <h3>Timed paper test</h3>
          <p>{SINGLE ? `Take Paper ${PAPERS[0]}'s Section A under exam timing:` : "Take a model paper's Section A under exam timing:"}{" the full 30 questions in 60 minutes, or one section on its own. Questions appear"} in the same order as the printed paper. There is no negative marking, so answer every question. The test submits itself when time runs out.</p>
          {!SINGLE && <>
          <div className="row" style={{ marginTop: 10 }}><b>Paper</b></div>
          <div className="chips">
            {PAPERS.map((p) => <button key={p} className={`chip ${paper === p ? "on" : ""}`} onClick={() => setPaper(p)}>Paper {p}</button>)}
          </div>
          </>}
          <div className="row" style={{ marginTop: 10 }}><b>Scope</b></div>
          <div className="chips">
            {TEST_SCOPES.map((s) => <button key={s.id} className={`chip ${scopeId === s.id ? "on" : ""}`} onClick={() => setScopeId(s.id)}>{s.name} · {s.minutes} min</button>)}
          </div>
          <button className="primary" onClick={start}>Start {TEST_SCOPES.find((s) => s.id === scopeId).minutes}-minute test</button>
        </section>
        <section className="card muted small">Section B (coding, 45 min) is practised in the Coding Round tab.</section>
      </div>
    );
  }
  const bySection = scope.cats.map((cid) => {
    const qs = test.qs.filter((q) => q.cat === cid);
    return { c: CAT_BY_ID[cid], total: qs.length, right: qs.filter((q) => test.answers[q.id] === q.ans).length };
  });
  return (
    <div className="stack">
      <div className="testbar">
        <b>Paper {test.paper} · {scope.name}</b>
        <span className="muted small">{answeredCount}/{test.qs.length} answered</span>
        <span className="spacer" />
        {!test.submitted ? <span className={`clock ${left < 120 ? "low" : ""}`}>⏱ {fmtTime(left)}</span> : <span className={`score ${score / test.qs.length >= 0.7 ? "pass" : "fail"}`}>Score {score}/{test.qs.length} ({Math.round((score / test.qs.length) * 100)}%)</span>}
        {!test.submitted ? <button className="primary" onClick={() => setTest((t) => ({ ...t, submitted: true }))}>Submit</button> : <button className="primary" onClick={() => setTest(null)}>New test</button>}
      </div>
      {test.submitted && (
        <section className="grid4">
          {bySection.map(({ c, total, right }) => (
            <div key={c.id} className="statcard" style={{ borderTopColor: c.color }}>
              <div className="stat-name">{c.section} · {c.name}</div>
              <div className="stat-num">{right}<span>/{total} correct</span></div>
              <div className="bar"><div style={{ width: `${(right / total) * 100}%`, background: c.color }} /></div>
            </div>
          ))}
        </section>
      )}
      {test.qs.map((q, i) => (
        <QuestionCard key={q.id} q={q} index={i} showMeta={test.submitted}
          record={test.answers[q.id] !== undefined ? { choice: test.answers[q.id] } : undefined}
          lockReveal={!test.submitted}
          onAnswer={test.submitted ? null : (qq, c) => setTest((t) => ({ ...t, answers: { ...t.answers, [qq.id]: c } }))} />
      ))}
    </div>
  );
}

function Coding({ progress, onSolved }) {
  return (
    <div className="stack">
      <section className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Paper</th><th>Problem</th><th>Pattern</th><th>Difficulty</th><th>Status</th></tr></thead>
            <tbody>{CODING_ITEMS.map((p) => (
              <tr key={p.id}><td>{p.paper}</td><td>{p.q}</td><td>{p.pattern}</td><td><Pill {...DIFF_META[p.diff]}>{p.diff}</Pill></td><td>{progress[p.id] ? "Solved" : "—"}</td></tr>
            ))}</tbody>
          </table>
        </div>
      </section>
      <section className="card">
        <h3>{SINGLE ? "Section B problem with solutions" : `All ${CODING_ITEMS.length} Section B problems with solutions`}</h3>
        <p className="muted small">{SINGLE ? "This is the paper's Section B question." : "Each problem is the Section B question of its model paper."} Every Java and Python solution was tested on the samples and extra test cases shown, and cross-checked against a brute-force reference on 300 random inputs. Allow 45 minutes per problem.</p>
      </section>
      {CODING_ITEMS.map((q) => <CodingCard key={q.id} q={q} solved={!!progress[q.id]} onToggle={onSolved} />)}
    </div>
  );
}

// ─── ROOT ───────────────────────────────────────────────────────────────────
const TABS = [["bank", "Question Bank"], ["mock", "Mock Test"], ["coding", "Coding Round"]];

export default function HCLModelTestPaper3() {
  const [tab, setTab] = useState("bank");
  const [bankCat, setBankCat] = useState("all");
  const [bankPaper, setBankPaper] = useState("all");
  const [progress, setProgress] = useState(loadProgress);
  useEffect(() => saveProgress(progress), [progress]);


  const onAnswer = (q, choice) => setProgress((p) => (p[q.id] ? p : { ...p, [q.id]: { choice, correct: choice === q.ans } }));
  const onSolved = (q) => setProgress((p) => { const n = { ...p }; if (n[q.id]) delete n[q.id]; else n[q.id] = { solved: true, correct: true }; return n; });
  const onReset = () => { if (window.confirm("Clear all attempted answers?")) setProgress({}); };

  const stats = useMemo(() => Object.fromEntries(CATS.map((c) => {
    const ids = BANK.filter((q) => q.cat === c.id).map((q) => q.id);
    return [c.id, { done: ids.filter((id) => progress[id]).length, correct: ids.filter((id) => progress[id]?.correct).length }];
  })), [progress]);
  const totalDone = Object.values(stats).reduce((a, s) => a + s.done, 0);

  return (
    <div className="hcl-root">
      <style>{CSS}</style>
      <header className="hero">
        <div className="hero-inner">
          <div className="eyebrow">HCL Campus Drive · Final Year B.Tech</div>
          <h1>HCL Model Test Paper 3</h1>
          <p>{MCQ_TOTAL} MCQs across Quantitative Aptitude, Logical Reasoning and Computer Fundamentals, plus {SINGLE ? "a Section B coding problem" : `${CODING_ITEMS.length} Section B coding problems`} with Java and Python solutions.</p>
          <div className="progress"><div style={{ width: `${(totalDone / BANK.length) * 100}%` }} /></div>
          <div className="small">{totalDone}/{BANK.length} attempted</div>
        </div>
        <nav className="tabs" role="tablist">
          {TABS.map(([k, t]) => <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>{t}</button>)}
        </nav>
      </header>
      <main className="main">
        {tab === "bank" && <Bank progress={progress} cat={bankCat} setCat={setBankCat} paper={bankPaper} setPaper={setBankPaper} onAnswer={onAnswer} onSolved={onSolved} onReset={onReset} />}
        {tab === "mock" && <MockTest />}
        {tab === "coding" && <Coding progress={progress} onSolved={onSolved} />}
      </main>
    </div>
  );
}

// ─── STYLES (scoped under .hcl-root) ────────────────────────────────────────
const CSS = `
.hcl-root{--ink:#0F172A;--muted:#64748B;--line:#E2E8F0;--bg:#F8FAFC;--card:#FFFFFF;--accent:#4F46E5;
  font-family:Inter,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:var(--ink);background:var(--bg);min-height:100vh;line-height:1.5}
.hcl-root *{box-sizing:border-box}
.hcl-root h1,.hcl-root h3{margin:0}
.hero{background:linear-gradient(135deg,#0B1220 0%,#1E1B4B 60%,#312E81 100%);color:#fff}
.hero-inner{max-width:960px;margin:0 auto;padding:28px 16px 16px}
.eyebrow{font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#A5B4FC}
.hero h1{font-size:clamp(24px,4vw,32px);font-weight:800;margin:6px 0}
.hero p{color:#CBD5E1;margin:0 0 14px;max-width:640px;font-size:14px}
.progress{height:6px;background:rgba(255,255,255,.12);border-radius:9px;overflow:hidden;max-width:360px}
.progress>div{height:100%;background:linear-gradient(90deg,#818CF8,#22D3EE);transition:width .3s}
.small{font-size:12px}
.hero .small{color:#94A3B8;margin-top:4px}
.tabs{display:flex;gap:2px;max-width:960px;margin:0 auto;padding:0 8px;overflow-x:auto;scrollbar-width:none}
.tabs button{flex:0 0 auto;background:none;border:0;color:#94A3B8;padding:12px 14px;font-weight:600;font-size:14px;cursor:pointer;border-bottom:2px solid transparent}
.tabs button.on{color:#fff;border-bottom-color:#818CF8}
.main{max-width:960px;margin:0 auto;padding:18px 16px 48px}
.stack{display:flex;flex-direction:column;gap:12px}
.card{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:16px}
.card h3{font-size:16px;margin-bottom:8px}
.card p{margin:0 0 8px;font-size:14px}
.card ul{margin:0;padding-left:20px;font-size:14px}
.card li{margin:4px 0}
.card.warn{background:#FFFBEB;border-color:#FDE68A}
.note{background:#FEF2F2;border-radius:8px;padding:8px 10px;color:#991B1B;font-size:13px}
.muted{color:var(--muted)}
.table-wrap{overflow-x:auto}
table{width:100%;border-collapse:collapse;font-size:13px;min-width:560px}
th,td{text-align:left;padding:8px;border-bottom:1px solid var(--line);vertical-align:top}
th{font-size:11px;text-transform:uppercase;letter-spacing:.5px;color:var(--muted)}
.grid2{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
.grid4{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
.fact{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:12px}
.fact-k{font-size:11px;text-transform:uppercase;letter-spacing:.5px;color:var(--muted)}
.fact-v{font-weight:700;margin:2px 0 6px}
.fact-why{font-size:12px;color:var(--muted)}
.legend{display:flex;flex-direction:column;gap:6px;font-size:13px;margin-bottom:10px}
.statcard{background:var(--card);border:1px solid var(--line);border-top:3px solid;border-radius:12px;padding:12px}
.stat-icon{font-weight:800;font-size:18px}
.stat-name{font-size:13px;font-weight:600}
.stat-num{font-size:22px;font-weight:800}
.stat-num span{font-size:12px;font-weight:500;color:var(--muted);margin-left:2px}
.bar{height:5px;background:var(--line);border-radius:9px;overflow:hidden;margin:6px 0}
.bar>div{height:100%}
.sources{font-size:13px}
.sources a{color:var(--accent)}
.pill{display:inline-block;font-size:11px;font-weight:700;padding:2px 8px;border-radius:999px;white-space:nowrap}
.chips{display:flex;flex-wrap:wrap;gap:6px}
.chip{border:1px solid var(--line);background:var(--card);border-radius:999px;padding:6px 12px;font-size:13px;font-weight:600;cursor:pointer;color:var(--ink)}
.chip.on{background:var(--accent);border-color:var(--accent);color:#fff}
.filters{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:12px}
.search{grid-column:1/-1;border:1px solid var(--line);border-radius:8px;padding:9px 12px;font-size:14px;width:100%}
.sel{display:flex;flex-direction:column;font-size:11px;color:var(--muted);gap:2px;min-width:0}
.sel select{border:1px solid var(--line);border-radius:8px;padding:7px 8px;font-size:13px;background:#fff;color:var(--ink);width:100%}
.row{display:flex;align-items:center;gap:8px;font-size:13px}
.spacer{flex:1}
.link{background:none;border:0;color:var(--accent);font-weight:600;cursor:pointer;font-size:13px;padding:0}
.primary{background:var(--accent);color:#fff;border:0;border-radius:8px;padding:9px 16px;font-weight:700;cursor:pointer;margin-top:10px}
.testbar .primary{margin-top:0}
.qcard{background:var(--card);border:1px solid var(--line);border-left:4px solid;border-radius:12px;padding:14px 16px}
.qhead{display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:12px}
.qid{font-weight:800}
.qtopic{color:var(--muted);font-weight:600}
.qtime{color:var(--muted)}
.qtext{white-space:pre-line;margin:10px 0;font-size:15px}
.passage{margin:10px 0;padding:10px 12px;background:#F1F5F9;border-left:3px solid #94A3B8;border-radius:6px;font-size:13.5px;color:#334155}
.code{position:relative;margin:8px 0}
.code pre{margin:0;background:#0F172A;color:#E2E8F0;border-radius:8px;padding:12px;overflow-x:auto;font-size:12.5px;line-height:1.5}
.code code{font-family:"JetBrains Mono",ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
.code-lang{position:absolute;top:6px;right:8px;font-size:10px;color:#94A3B8;font-weight:700}
.opts{list-style:none;padding:0;margin:0;display:grid;gap:6px}
.opt{width:100%;display:flex;gap:10px;align-items:flex-start;text-align:left;background:#fff;border:1px solid var(--line);border-radius:8px;padding:8px 10px;font-size:14px;cursor:pointer;color:var(--ink)}
.opt:hover:not(:disabled){border-color:#A5B4FC;background:#EEF2FF}
.opt:disabled{cursor:default}
.optkey{font-weight:800;color:var(--muted);min-width:14px}
.opt.correct{background:#DCFCE7;border-color:#22C55E}
.opt.wrong{background:#FEE2E2;border-color:#EF4444}
.opt.picked{background:#EEF2FF;border-color:#6366F1}
.qfoot{margin-top:8px}
.sol{margin-top:8px;background:#F0FDF4;border:1px solid #BBF7D0;border-radius:8px;padding:10px 12px;font-size:14px}
.sol p{margin:4px 0 0}
.qmeta{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:10px;padding-top:8px;border-top:1px dashed var(--line)}
.ref{font-size:11.5px;color:var(--muted)}
.testbar{position:sticky;top:0;z-index:5;display:flex;flex-wrap:wrap;align-items:center;gap:10px;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:10px 14px;box-shadow:0 4px 12px rgba(15,23,42,.06)}
.clock{font-weight:800;font-variant-numeric:tabular-nums}
.clock.low{color:#DC2626}
.score{font-weight:800}
.score.pass{color:#16A34A}.score.fail{color:#DC2626}
.timeline{display:flex;flex-direction:column;gap:12px}
.tl-item{display:grid;grid-template-columns:110px 1fr;gap:12px}
.tl-when{font-weight:800;color:var(--accent);padding-top:16px;text-align:right}
.ctitle{margin:8px 0 0;font-size:16px}
.io{display:grid;grid-template-columns:max-content 1fr;gap:4px 12px;font-size:13px;margin:6px 0 10px;white-space:pre-line}
.io dt{font-weight:700;color:var(--muted)}.io dd{margin:0}
.sample{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px}
.sample pre{margin:0;background:#F1F5F9;border:1px solid var(--line);border-radius:6px;padding:8px;font-size:12.5px;overflow-x:auto;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
.sample-h{font-size:11px;font-weight:700;color:var(--muted);margin-bottom:2px}
.sample-note{grid-column:1/-1;font-size:12px;color:var(--muted)}
.ctabs{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-top:6px}
.ctabs button{border:1px solid var(--line);background:#fff;border-radius:8px;padding:6px 10px;font-size:13px;font-weight:600;cursor:pointer;color:var(--ink)}
.ctabs button.on{background:var(--accent);border-color:var(--accent);color:#fff}
.navlink{font-weight:700;font-size:14px;display:inline-flex;align-items:center;gap:6px;padding:4px 0;text-decoration:underline;text-underline-offset:3px;text-align:left}
.solved{font-size:13px;font-weight:600;display:flex;gap:6px;align-items:center;cursor:pointer}
@media (max-width:720px){
  .sample{grid-template-columns:1fr}
  .grid4{grid-template-columns:repeat(2,1fr)}
  .grid2{grid-template-columns:1fr}
  .filters{grid-template-columns:repeat(2,1fr)}
  .tl-item{grid-template-columns:1fr;gap:4px}
  .tl-when{text-align:left;padding-top:0}
}
`;
