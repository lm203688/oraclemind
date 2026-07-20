import React from "react";
import {
  AbsoluteFill,
  Audio,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
  staticFile,
} from "remotion";

/**
 * A-2 Demo 演示型 — 45秒 抖音竖版
 *
 * 分镜时间表 (fps=30, duration=1350帧):
 *  0–150帧 (0–5s)  : Hook — "你的AI Agent，跑路前会告诉你吗？"
 *  150–450帧 (5–15s): 终端敲入 npx agent-trust-mcp-server
 *  450–750帧 (15–25s): 评分仪表盘 + 雷达图动画
 *  750–1050帧 (25–35s): 实时折线图 + 数据卡片
 *  1050–1350帧 (35–45s): GitHub stars + CTA
 */

const COLORS = {
  bg: "#0a0a0f",
  bgGrad: "#0f1729",
  cyan: "#00f5ff",
  green: "#00ff88",
  purple: "#a855f7",
  yellow: "#fbbf24",
  text: "#ffffff",
  textDim: "#94a3b8",
  cardBg: "rgba(15, 23, 41, 0.85)",
};

const FONT = {
  display: '"PingFang SC", "Microsoft YaHei", system-ui, sans-serif',
  mono: '"Fira Code", "Cascadia Code", Consolas, monospace',
};

const Caption: React.FC<{ text: string; frame: number; fadeIn: number; hold: number; fadeOut: number }> = ({
  text,
  frame,
  fadeIn,
  hold,
  fadeOut,
}) => {
  const opacity = interpolate(
    frame,
    [fadeIn, fadeIn + 15, fadeIn + hold, fadeIn + hold + 15],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const translateY = interpolate(frame, [fadeIn, fadeIn + 20], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  return (
    <div
      style={{
        position: "absolute",
        bottom: 180,
        left: 0,
        right: 0,
        textAlign: "center",
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      <div
        style={{
          display: "inline-block",
          background: "rgba(0,0,0,0.75)",
          border: `2px solid ${COLORS.cyan}`,
          borderRadius: 16,
          padding: "20px 36px",
          fontSize: 56,
          fontWeight: 800,
          color: COLORS.text,
          fontFamily: FONT.display,
          textShadow: `0 0 30px ${COLORS.cyan}`,
          maxWidth: 880,
        }}
      >
        {text}
      </div>
    </div>
  );
};

const Background: React.FC = () => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse at 50% 30%, ${COLORS.bgGrad} 0%, ${COLORS.bg} 70%)`,
    }}
  >
    {/* 装饰网格 */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage:
          "linear-gradient(rgba(0,245,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,255,0.08) 1px, transparent 1px)",
        backgroundSize: "80px 80px",
        opacity: 0.5,
      }}
    />
    {/* 角落光晕 */}
    <div
      style={{
        position: "absolute",
        top: -200,
        right: -200,
        width: 600,
        height: 600,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${COLORS.purple}33 0%, transparent 70%)`,
      }}
    />
    <div
      style={{
        position: "absolute",
        bottom: -200,
        left: -200,
        width: 600,
        height: 600,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${COLORS.cyan}33 0%, transparent 70%)`,
      }}
    />
  </AbsoluteFill>
);

const Logo: React.FC = () => (
  <div
    style={{
      position: "absolute",
      top: 60,
      left: 0,
      right: 0,
      textAlign: "center",
      fontSize: 32,
      fontWeight: 700,
      color: COLORS.textDim,
      fontFamily: FONT.display,
      letterSpacing: 4,
    }}
  >
    AGENT<span style={{ color: COLORS.cyan }}>TRUST</span> PROTOCOL
  </div>
);

// 场景1: Hook
const Scene1Hook: React.FC<{ frame: number }> = ({ frame }) => {
  const f = frame;
  const titleOpacity = interpolate(f, [0, 30, 120, 150], [0, 1, 1, 0], {
    extrapolateRight: "clamp",
  });
  const titleScale = spring({ frame: f, fps: 30, config: { damping: 12 } });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div
        style={{
          opacity: titleOpacity,
          transform: `scale(${0.7 + titleScale * 0.3})`,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 96,
            fontWeight: 900,
            color: COLORS.text,
            fontFamily: FONT.display,
            textShadow: `0 0 40px ${COLORS.purple}`,
            lineHeight: 1.1,
          }}
        >
          你的 AI Agent
        </div>
        <div
          style={{
            fontSize: 96,
            fontWeight: 900,
            color: COLORS.cyan,
            fontFamily: FONT.display,
            textShadow: `0 0 40px ${COLORS.cyan}`,
            lineHeight: 1.1,
            marginTop: 30,
          }}
        >
          跑路前会告诉你？
        </div>
      </div>
    </AbsoluteFill>
  );
};

// 场景2: 终端命令
const Scene2Terminal: React.FC<{ frame: number }> = ({ frame }) => {
  const f = frame - 150; // 局部帧
  const code = "$ npx agent-trust-mcp-server";
  const charsToShow = Math.min(code.length, Math.floor(f / 2));
  const displayCode = code.slice(0, charsToShow);
  const cursorVisible = Math.floor(f / 8) % 2 === 0;

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: 80 }}>
      <div
        style={{
          width: "100%",
          background: "#000",
          border: `2px solid ${COLORS.cyan}`,
          borderRadius: 20,
          padding: 50,
          boxShadow: `0 0 60px ${COLORS.cyan}66`,
          fontFamily: FONT.mono,
        }}
      >
        <div style={{ display: "flex", gap: 12, marginBottom: 30 }}>
          <div style={{ width: 24, height: 24, borderRadius: 12, background: "#ff5f57" }} />
          <div style={{ width: 24, height: 24, borderRadius: 12, background: "#febc2e" }} />
          <div style={{ width: 24, height: 24, borderRadius: 12, background: "#28c840" }} />
        </div>
        <div style={{ fontSize: 48, color: COLORS.green, fontWeight: 700, minHeight: 60 }}>
          {displayCode}
          {cursorVisible && <span style={{ color: COLORS.cyan }}>▋</span>}
        </div>
        {f > 60 && (
          <div style={{ fontSize: 36, color: COLORS.textDim, marginTop: 24, lineHeight: 1.6 }}>
            <div>✔ MCP Server started on port 3001</div>
            <div>✔ Trust scoring engine loaded</div>
            <div>✔ Ready to evaluate agents</div>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

// 场景3: 评分仪表盘
const Scene3Scoreboard: React.FC<{ frame: number }> = ({ frame }) => {
  const f = frame - 450;
  const scoreProgress = interpolate(f, [0, 120], [0, 84], { extrapolateRight: "clamp" });
  const gaugeAngle = interpolate(scoreProgress, [0, 100], [-90, 270], { extrapolateRight: "clamp" });
  const gradeVisible = f > 100;
  const gradeScale = spring({ frame: f - 100, fps: 30, config: { damping: 8 } });

  return (
    <AbsoluteFill style={{ padding: 80 }}>
      <div
        style={{
          background: COLORS.cardBg,
          border: `1px solid ${COLORS.cyan}55`,
          borderRadius: 30,
          padding: 60,
          height: "100%",
          boxShadow: `0 0 80px ${COLORS.cyan}22`,
        }}
      >
        <div style={{ fontSize: 36, color: COLORS.textDim, marginBottom: 12, fontFamily: FONT.display }}>
          AGENT TRUST SCORE
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 50, marginTop: 40 }}>
          {/* 圆环分数 */}
          <div style={{ position: "relative", width: 400, height: 400 }}>
            <svg width="400" height="400" viewBox="0 0 400 400">
              <circle cx="200" cy="200" r="170" fill="none" stroke="#1f2937" strokeWidth="20" />
              <circle
                cx="200"
                cy="200"
                r="170"
                fill="none"
                stroke={COLORS.cyan}
                strokeWidth="20"
                strokeLinecap="round"
                strokeDasharray={`${(scoreProgress / 100) * 1068} 1068`}
                transform="rotate(-90 200 200)"
                style={{ filter: `drop-shadow(0 0 20px ${COLORS.cyan})` }}
              />
            </svg>
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <div style={{ fontSize: 120, fontWeight: 900, color: COLORS.cyan, fontFamily: FONT.display, lineHeight: 1 }}>
                {Math.floor(scoreProgress)}
              </div>
              <div style={{ fontSize: 36, color: COLORS.textDim, marginTop: 8 }}>/ 100</div>
            </div>
          </div>
          {/* 评分维度 */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 24 }}>
            {[
              { label: "Reliability", value: 92, color: COLORS.green },
              { label: "Security", value: 88, color: COLORS.cyan },
              { label: "Compliance", value: 76, color: COLORS.yellow },
              { label: "Performance", value: 81, color: COLORS.purple },
            ].map((d, i) => {
              const w = interpolate(f, [i * 8, i * 8 + 60], [0, d.value], { extrapolateRight: "clamp" });
              return (
                <div key={d.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ color: COLORS.text, fontSize: 28, fontFamily: FONT.display }}>{d.label}</span>
                    <span style={{ color: d.color, fontSize: 28, fontWeight: 700, fontFamily: FONT.mono }}>{Math.floor(w)}%</span>
                  </div>
                  <div style={{ height: 16, background: "#1f2937", borderRadius: 8, overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${w}%`,
                        height: "100%",
                        background: d.color,
                        boxShadow: `0 0 12px ${d.color}`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {gradeVisible && (
          <div
            style={{
              marginTop: 50,
              display: "inline-block",
              background: COLORS.green,
              color: "#000",
              padding: "16px 40px",
              borderRadius: 16,
              fontSize: 40,
              fontWeight: 900,
              fontFamily: FONT.display,
              transform: `scale(${gradeScale})`,
            }}
          >
            GRADE: B+ ★ TRUSTED
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

// 场景4: 折线图 + 数据
const Scene4Charts: React.FC<{ frame: number }> = ({ frame }) => {
  const f = frame - 750;
  // 折线动画
  const lineProgress = interpolate(f, [0, 180], [0, 1], { extrapolateRight: "clamp" });
  const points = [40, 35, 50, 30, 55, 45, 70, 60, 80, 75, 92, 88, 95];
  const pathLength = points.length;
  const visiblePoints = Math.floor(lineProgress * pathLength);
  const path = points
    .slice(0, visiblePoints + 1)
    .map((v, i) => `${i === 0 ? "M" : "L"} ${i * 60} ${260 - v * 2}`)
    .join(" ");

  // 数字滚动
  const txCount = Math.floor(lineProgress * 2847);

  return (
    <AbsoluteFill style={{ padding: 80 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 30, height: "100%" }}>
        {/* 折线图 */}
        <div
          style={{
            background: COLORS.cardBg,
            border: `1px solid ${COLORS.green}55`,
            borderRadius: 24,
            padding: 40,
            gridColumn: "span 2",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 30 }}>
            <div style={{ fontSize: 32, color: COLORS.text, fontFamily: FONT.display, fontWeight: 700 }}>Trust Trend — 30 Days</div>
            <div style={{ fontSize: 36, color: COLORS.green, fontFamily: FONT.mono, fontWeight: 700 }}>+127% ↑</div>
          </div>
          <svg width="100%" height="320" viewBox="0 0 780 320" preserveAspectRatio="none">
            {/* 网格 */}
            {[0, 1, 2, 3, 4].map((i) => (
              <line key={i} x1="0" y1={i * 80} x2="780" y2={i * 80} stroke="#1f2937" strokeWidth="1" />
            ))}
            <path d={path} fill="none" stroke={COLORS.green} strokeWidth="6" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 12px ${COLORS.green})` }} />
            {points.slice(0, visiblePoints + 1).map((v, i) => (
              <circle key={i} cx={i * 60} cy={260 - v * 2} r="6" fill={COLORS.cyan} />
            ))}
          </svg>
        </div>

        {/* 数据卡片 */}
        <div
          style={{
            background: COLORS.cardBg,
            border: `1px solid ${COLORS.cyan}55`,
            borderRadius: 24,
            padding: 40,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div style={{ fontSize: 28, color: COLORS.textDim, fontFamily: FONT.display }}>Transactions Scored</div>
          <div style={{ fontSize: 80, fontWeight: 900, color: COLORS.cyan, fontFamily: FONT.mono, textShadow: `0 0 20px ${COLORS.cyan}` }}>
            {txCount.toLocaleString()}
          </div>
        </div>
        <div
          style={{
            background: COLORS.cardBg,
            border: `1px solid ${COLORS.purple}55`,
            borderRadius: 24,
            padding: 40,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div style={{ fontSize: 28, color: COLORS.textDim, fontFamily: FONT.display }}>AI Agents Verified</div>
          <div style={{ fontSize: 80, fontWeight: 900, color: COLORS.purple, fontFamily: FONT.mono, textShadow: `0 0 20px ${COLORS.purple}` }}>
            347
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// 场景5: CTA + GitHub
const Scene5CTA: React.FC<{ frame: number }> = ({ frame }) => {
  const f = frame - 1050;
  const logoScale = spring({ frame: f, fps: 30, config: { damping: 10 } });
  const ctaOpacity = interpolate(f, [60, 100, 270, 300], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ textAlign: "center", transform: `scale(${logoScale})` }}>
        {/* 大六边形 */}
        <svg width="500" height="500" viewBox="0 0 500 500">
          <defs>
            <linearGradient id="hexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={COLORS.cyan} />
              <stop offset="100%" stopColor={COLORS.green} />
            </linearGradient>
          </defs>
          <polygon
            points="250,30 450,140 450,360 250,470 50,360 50,140"
            fill="none"
            stroke="url(#hexGrad)"
            strokeWidth="8"
            style={{ filter: `drop-shadow(0 0 40px ${COLORS.cyan})` }}
          />
          <text x="250" y="240" textAnchor="middle" fill={COLORS.text} fontSize="60" fontWeight="900" fontFamily={FONT.display}>
            AGENT
          </text>
          <text x="250" y="320" textAnchor="middle" fill={COLORS.cyan} fontSize="60" fontWeight="900" fontFamily={FONT.display}>
            TRUST
          </text>
        </svg>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 400,
          opacity: ctaOpacity,
          textAlign: "center",
        }}
      >
        <div
          style={{
            background: COLORS.cyan,
            color: "#000",
            padding: "24px 60px",
            borderRadius: 20,
            fontSize: 48,
            fontWeight: 900,
            fontFamily: FONT.display,
            display: "inline-block",
            boxShadow: `0 0 40px ${COLORS.cyan}88`,
          }}
        >
          ⭐ github.com/lm203688
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const AgentTrustDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, width, height }}>
      {/* BGM - Neon Laser Horizon (科技电子风) */}
      <Audio
        src={staticFile("audio/neon-laser-horizon.mp3")}
        volume={(f) => {
          // 渐入 + 末尾淡出
          if (f < 30) return Math.min(0.7, (f / 30) * 0.7); // 1秒淡入到0.7
          if (f > durationInFrames - 30) {
            return Math.max(0, 0.7 * (1 - (f - (durationInFrames - 30)) / 30));
          }
          return 0.7;
        }}
      />
      <Background />
      <Logo />

      {/* 场景切换 */}
      {frame < 150 && <Scene1Hook frame={frame} />}
      {frame >= 150 && frame < 450 && <Scene2Terminal frame={frame} />}
      {frame >= 450 && frame < 750 && <Scene3Scoreboard frame={frame} />}
      {frame >= 750 && frame < 1050 && <Scene4Charts frame={frame} />}
      {frame >= 1050 && <Scene5CTA frame={frame} />}

      {/* 字幕 */}
      {frame < 150 && <Caption text="你的 AI Agent，跑路前会告诉你吗？" frame={frame} fadeIn={30} hold={90} fadeOut={150} />}
      {frame >= 150 && frame < 450 && <Caption text="30秒接入，一行命令搞定" frame={frame} fadeIn={180} hold={220} fadeOut={450} />}
      {frame >= 450 && frame < 750 && <Caption text="4维度评分，可靠性、安全、合规、性能" frame={frame} fadeIn={480} hold={220} fadeOut={750} />}
      {frame >= 750 && frame < 1050 && <Caption text="实时监控，数据驱动决策" frame={frame} fadeIn={780} hold={220} fadeOut={1050} />}
      {frame >= 1050 && <Caption text="GitHub 开源，立即体验" frame={frame} fadeIn={1080} hold={220} fadeOut={1320} />}

      {/* 进度条 */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 8,
          background: "#1f2937",
        }}
      >
        <div
          style={{
            width: `${(frame / (45 * 30)) * 100}%`,
            height: "100%",
            background: `linear-gradient(90deg, ${COLORS.cyan}, ${COLORS.green})`,
            boxShadow: `0 0 12px ${COLORS.cyan}`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
