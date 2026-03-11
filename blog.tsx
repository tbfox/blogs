#!/usr/bin/env bun
import { render, Text, Box, useStdout, useInput, useApp } from "ink";
import { useState, useRef } from "react";
import { globSync, readFileSync } from "fs";
import { basename } from "path";
import { spawn } from "child_process";

const STAGES = ["STUB", "RAW_RECORDING", "GENERATING_PLAN", "AI_PLAN", "HUMAN_PLAN", "DRAFTING", "AI_DRAFT", "FINAL", "UNKNOWN"] as const;
type Stage = (typeof STAGES)[number];

const STAGE_COLORS: Record<Stage, string> = {
  STUB: "gray",
  RAW_RECORDING: "red",
  GENERATING_PLAN: "redBright",
  AI_PLAN: "magenta",
  HUMAN_PLAN: "cyan",
  DRAFTING: "blueBright",
  AI_DRAFT: "blue",
  FINAL: "green",
  UNKNOWN: "yellow",
};

function parseFrontmatter(content: string) {
  const match = content.match(/^---\n([\s\S]+?)\n---/);
  if (!match) return { stage: "UNKNOWN" as Stage, title: null };
  const fm = match[1];
  const stageMatch = fm.match(/^stage:\s*(\S+)/m);
  const titleMatch = fm.match(/^title:\s*(.+)/m);
  return {
    stage: (stageMatch?.[1] ?? "UNKNOWN") as Stage,
    title: titleMatch?.[1]?.trim() ?? null,
  };
}

function loadArticles() {
  const files = globSync("articles/*.md");
  return files.map((f) => {
    const content = readFileSync(f, "utf8");
    const { stage, title } = parseFrontmatter(content);
    const slug = basename(f, ".md");
    return { slug, title: title ?? slug, stage };
  });
}

type Article = ReturnType<typeof loadArticles>[number];

function Row({
  article,
  slugWidth,
  stageWidth,
  selected,
}: {
  article: Article;
  slugWidth: number;
  stageWidth: number;
  selected?: boolean;
}) {
  const { stdout } = useStdout();
  const cols = stdout.columns ?? 120;
  const stage = article.stage as Stage;

  return (
    <Box width={cols}>
      <Box width={2}>
        <Text>{selected ? ">" : " "}</Text>
      </Box>
      <Box width={slugWidth + 2}>
        <Text bold={selected}>{article.slug}</Text>
      </Box>
      <Box width={stageWidth + 2}>
        <Text color={STAGE_COLORS[stage]}>{stage}</Text>
      </Box>
      <Text wrap="truncate-end">- {article.title}</Text>
    </Box>
  );
}

function ArticleList() {
  const articles = loadArticles();

  const rows = STAGES.flatMap((stage) =>
    articles
      .filter((a: Article) => a.stage === stage)
      .map((a: Article) => ({ ...a, stage }))
  );

  const slugWidth = Math.max(...rows.map((a) => a.slug.length));
  const stageWidth = Math.max(...STAGES.map((s) => s.length));

  return (
    <Box flexDirection="column">
      {rows.map((a) => (
        <Row key={a.slug} article={a} slugWidth={slugWidth} stageWidth={stageWidth} />
      ))}
    </Box>
  );
}

function AdvanceSelect() {
  const { exit } = useApp();

  const [articles, setArticles] = useState(() => loadArticles());
  const [cursor, setCursor] = useState(0);
  const [busy, setBusy] = useState<Set<string>>(new Set());
  const busyRef = useRef(busy);
  busyRef.current = busy;

  const rows = STAGES.flatMap((stage) =>
    articles
      .filter((a: Article) => a.stage === stage)
      .map((a: Article) => ({ ...a, stage }))
  );

  const slugWidth = Math.max(...rows.map((a) => a.slug.length));
  const stageWidth = Math.max(...STAGES.map((s) => s.length));

  function reloadArticle(slug: string) {
    const content = readFileSync(`articles/${slug}.md`, "utf8");
    const { stage, title } = parseFrontmatter(content);
    setArticles((prev) =>
      prev.map((a) => (a.slug === slug ? { ...a, stage, title: title ?? slug } : a))
    );
  }

  function runPlanArticle(slug: string) {
    setBusy((prev) => new Set(prev).add(slug));
    // Optimistically show GENERATING_PLAN in the UI
    setArticles((prev) =>
      prev.map((a) => (a.slug === slug ? { ...a, stage: "GENERATING_PLAN" as Stage } : a))
    );

    const proc = spawn(
      "claude",
      [
        "-p", `/plan-article ${slug}`,
        "--allowedTools", `Read,Write`,
      ],
      { stdio: "ignore" }
    );

    proc.on("close", () => {
      reloadArticle(slug);
      setBusy((prev) => {
        const next = new Set(prev);
        next.delete(slug);
        return next;
      });
    });
  }

  useInput((input, key) => {
    if (key.upArrow || input === "k") setCursor((c) => Math.max(0, c - 1));
    if (key.downArrow || input === "j") setCursor((c) => Math.min(rows.length - 1, c + 1));
    if (key.return) {
      const article = rows[cursor]!;
      if (article.stage === "RAW_RECORDING" && !busyRef.current.has(article.slug)) {
        runPlanArticle(article.slug);
      }
    }
    if (key.escape || (key.ctrl && input === "c")) exit();
  });

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text dimColor>↑↓/jk to navigate · Enter on RAW_RECORDING to plan · Esc to quit</Text>
      </Box>
      {rows.map((a, i) => (
        <Row
          key={a.slug}
          article={a}
          slugWidth={slugWidth}
          stageWidth={stageWidth}
          selected={i === cursor}
        />
      ))}
    </Box>
  );
}

const command = process.argv[2] ?? "list";

let app: ReturnType<typeof render>;

if (command === "advance") {
  app = render(<AdvanceSelect />);
} else {
  app = render(<ArticleList />);
}

app.waitUntilExit().finally(() => process.stdout.write("\x1B[?25h"));
