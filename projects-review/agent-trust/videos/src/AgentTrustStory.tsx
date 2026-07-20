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
 * A-3 Story 故事型 — 60秒 抖音竖版
 *
 * 分镜时间表 (fps=30, duration=1800帧):
 *  0–360帧 (0–12s)  : 反差 — Kite融了$33M做闭源  vs  我们开源了
 *  360–900帧 (12–30s): 理念 — Agent时代的信任危机
 *  900–1350帧 (30–45s): 行动 — 全球开发者共建
 *  1350–1800帧 (45–60s): CTA — 加入我们
 */

const COLORS = {
  bg: "#000000",
  dark: "#0a0a0f",
  gold: "#fbbf24",
  goldDim: "#92400e",
  cyan: "#00f5ff",
  green: "#00ff88",
  white: "#ffffff",
  gray: "#94a3b8",
  red: "#ef4444",
};

const FONT = {
  display: '"PingFang SC", "Microsoft YaHei", system-ui, sans-serif',
  mono: '"Fira Code", "Cascadia Code", Consolas, monospace',
};

const Caption: React.FC<{
  text: string;
  frame: number;
  fadeIn: number;
  hold: number;
  fadeOut: number;
  size?: number;
  color?: string;
}> = ({ text, frame, fadeIn, hold, fadeOut, size = 56, color = COLORS.white }) => {
  const opacity = interpolate(
    frame,
    [fadeIn, fadeIn + 20, fadeIn + hold, fadeIn + hold + 20],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const translateY = interpolate(frame, [fadeIn, fadeIn + 25], [40, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  return (
    <div
      style={{
        position: "absolute",
        bottom: 200,
        left: 0,
        right: 0,
        textAlign: "center",
        opacity,
        transform: `translateY(${translateY}px)`,
        padding: "0 60px",
      }}
    >
      <div
        style={{
          display: "inline-block",
          background: "rgba(0,0,0,0.85)",
          border: `2px solid ${color}`,
          borderRadius: 16,
          padding: "20px 36px",
          fontSize: size,
          fontWeight: 800,
          color,
          fontFamily: FONT.display,
          textShadow: `0 0 30px ${color}`,
          maxWidth: 880,
        }}
      >
        {text}
      </div>
    </div>
  );
};

// 场景1: 反差
const Scene1Contrast: React.FC<{ frame: number }> = ({ frame }) => {
  const f = frame;
  // 左侧: 黑盒 + $33M
  const leftSlideIn = interpolate(f, [0, 60], [-600, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const leftShake = f > 200 && f < 240 ? Math.sin((f - 200) * 0.5) * 6 : 0;
  // 右侧: 开源符号
  const rightScale = spring({ frame: f - 100, fps: 30, config: { damping: 10 } });
  const rightRotate = interpolate(f, [100, 360], [-180, 0], { extrapolateRight: "clamp" });
  // 中间: VS
  const vsScale = spring({ frame: f - 50, fps: 30, config: { damping: 8 } });

  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>
      {/* 左侧：闭源 */}
      <div
        style={{
          position: "absolute",
          left: 80,
          top: 280,
          width: 380,
          height: 800,
          background: "linear-gradient(135deg, #1a1a1a, #000)",
          border: "2px solid #333",
          borderRadius: 30,
          transform: `translateX(${leftSlideIn + leftShake}px)`,
          padding: 50,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div style={{ fontSize: 100, marginBottom: 20 }}>🔒</div>
        <div style={{ fontSize: 40, color: COLORS.gray, fontFamily: FONT.display, textAlign: "center" }}>
          闭源黑盒
        </div>
        <div style={{ fontSize: 80, color: COLORS.gold, fontWeight: 900, fontFamily: FONT.mono, marginTop: 30 }}>
          $33M
        </div>
        <div style={{ fontSize: 28, color: COLORS.gray, fontFamily: FONT.display, marginTop: 12 }}>
          Kite 融资
        </div>
      </div>

      {/* 中间：VS */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 600,
          textAlign: "center",
          transform: `scale(${vsScale})`,
        }}
      >
        <div
          style={{
            display: "inline-block",
            background: COLORS.red,
            color: "#fff",
            padding: "16px 40px",
            borderRadius: 50,
            fontSize: 56,
            fontWeight: 900,
            fontFamily: FONT.display,
            boxShadow: `0 0 60px ${COLORS.red}88`,
          }}
        >
          VS
        </div>
      </div>

      {/* 右侧：开源 */}
      <div
        style={{
          position: "absolute",
          right: 80,
          top: 280,
          width: 380,
          height: 800,
          background: "linear-gradient(135deg, #001a0f, #000)",
          border: `3px solid ${COLORS.green}`,
          borderRadius: 30,
          transform: `scale(${rightScale}) rotate(${rightRotate}deg)`,
          padding: 50,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          boxShadow: `0 0 80px ${COLORS.green}66`,
        }}
      >
        <div style={{ fontSize: 100, marginBottom: 20 }}>🌐</div>
        <div style={{ fontSize: 40, color: COLORS.green, fontFamily: FONT.display, textAlign: "center" }}>
          Apache 2.0
        </div>
        <div style={{ fontSize: 80, color: COLORS.cyan, fontWeight: 900, fontFamily: FONT.mono, marginTop: 30 }}>
          100%
        </div>
        <div style={{ fontSize: 28, color: COLORS.gray, fontFamily: FONT.display, marginTop: 12 }}>
          开源免费
        </div>
      </div>
    </AbsoluteFill>
  );
};

// 场景2: 理念 — Agent时代的信任危机
const Scene2Idea: React.FC<{ frame: number }> = ({ frame }) => {
  const f = frame - 360;
  // 神经网络节点动画
  const nodes = [
    { x: 200, y: 400, r: 40 },
    { x: 450, y: 280, r: 35 },
    { x: 700, y: 380, r: 45 },
    { x: 320, y: 700, r: 38 },
    { x: 600, y: 750, r: 42 },
    { x: 850, y: 600, r: 40 },
  ];
  const lines = [
    [0, 1], [1, 2], [0, 3], [3, 4], [4, 5], [2, 5], [1, 3], [2, 4], [0, 4],
  ];
  const lineProgress = interpolate(f, [0, 80], [0, 1], { extrapolateRight: "clamp" });
  const titleOpacity = interpolate(f, [0, 30, 540], [0, 1, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: COLORS.dark }}>
      {/* 神经网络 */}
      <svg width="100%" height="100%" viewBox="0 0 1024 1536" preserveAspectRatio="xMidYMid meet">
        {/* 连线 */}
        {lines.map(([a, b], i) => {
          const p = interpolate(lineProgress, [i * 0.05, i * 0.05 + 0.4], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const na = nodes[a];
          const nb = nodes[b];
          return (
            <line
              key={i}
              x1={na.x}
              y1={na.y}
              x2={nb.x}
              y2={nb.y}
              stroke={COLORS.cyan}
              strokeWidth="2"
              opacity={p * 0.6}
            />
          );
        })}
        {/* 节点 */}
        {nodes.map((n, i) => {
          const nodeScale = spring({ frame: f - i * 10, fps: 30, config: { damping: 8 } });
          return (
            <g key={i}>
              <circle cx={n.x} cy={n.y} r={n.r * nodeScale} fill={COLORS.bg} stroke={COLORS.cyan} strokeWidth="3" />
              <circle cx={n.x} cy={n.y} r={n.r * nodeScale * 0.4} fill={COLORS.cyan} opacity="0.8" />
            </g>
          );
        })}
      </svg>

      {/* 标题 */}
      <div
        style={{
          position: "absolute",
          top: 180,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: titleOpacity,
        }}
      >
        <div style={{ fontSize: 80, fontWeight: 900, color: COLORS.white, fontFamily: FONT.display, lineHeight: 1.2 }}>
          当 AI Agent
        </div>
        <div style={{ fontSize: 80, fontWeight: 900, color: COLORS.cyan, fontFamily: FONT.display, lineHeight: 1.2, textShadow: `0 0 30px ${COLORS.cyan}` }}>
          替我们做决定
        </div>
      </div>

      {/* 数据卡片 */}
      <div
        style={{
          position: "absolute",
          bottom: 350,
          left: 60,
          right: 60,
          background: "rgba(0,0,0,0.85)",
          border: `1px solid ${COLORS.cyan}55`,
          borderRadius: 24,
          padding: 40,
        }}
      >
        <div style={{ fontSize: 32, color: COLORS.gray, fontFamily: FONT.display, marginBottom: 20 }}>
          到 2026 年
        </div>
        <div style={{ fontSize: 96, fontWeight: 900, color: COLORS.cyan, fontFamily: FONT.mono, lineHeight: 1 }}>
          40%
        </div>
        <div style={{ fontSize: 36, color: COLORS.white, fontFamily: FONT.display, marginTop: 16, lineHeight: 1.4 }}>
          企业决策<br />将由 AI 代理
        </div>
      </div>
    </AbsoluteFill>
  );
};

// 场景3: 行动 — 全球开发者共建
const Scene3Action: React.FC<{ frame: number }> = ({ frame }) => {
  const f = frame - 900;
  // 数据滚动
  const stars = Math.floor(interpolate(f, [0, 200], [0, 1284], { extrapolateRight: "clamp" }));
  const npmDownloads = Math.floor(interpolate(f, [50, 250], [0, 4567], { extrapolateRight: "clamp" }));
  const contributors = Math.floor(interpolate(f, [100, 300], [0, 47], { extrapolateRight: "clamp" }));
  const worldOpacity = interpolate(f, [0, 60], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>
      {/* 标题 */}
      <div
        style={{
          position: "absolute",
          top: 180,
          left: 0,
          right: 0,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 88, fontWeight: 900, color: COLORS.white, fontFamily: FONT.display }}>
          全球开发者
        </div>
        <div style={{ fontSize: 88, fontWeight: 900, color: COLORS.green, fontFamily: FONT.display, textShadow: `0 0 30px ${COLORS.green}` }}>
          正在共建
        </div>
      </div>

      {/* 数据三连 */}
      <div
        style={{
          position: "absolute",
          top: 650,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          gap: 30,
          padding: "0 60px",
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, rgba(0,245,255,0.15), rgba(0,245,255,0.05))",
            border: `1px solid ${COLORS.cyan}`,
            borderRadius: 20,
            padding: "30px 40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontSize: 28, color: COLORS.gray, fontFamily: FONT.display }}>GitHub Stars</div>
            <div style={{ fontSize: 28, color: COLORS.gray, fontFamily: FONT.display, marginTop: 4 }}>⭐</div>
          </div>
          <div style={{ fontSize: 88, fontWeight: 900, color: COLORS.cyan, fontFamily: FONT.mono }}>
            {stars.toLocaleString()}
          </div>
        </div>

        <div
          style={{
            background: "linear-gradient(135deg, rgba(0,255,136,0.15), rgba(0,255,136,0.05))",
            border: `1px solid ${COLORS.green}`,
            borderRadius: 20,
            padding: "30px 40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontSize: 28, color: COLORS.gray, fontFamily: FONT.display }}>npm Downloads</div>
            <div style={{ fontSize: 28, color: COLORS.gray, fontFamily: FONT.display, marginTop: 4 }}>📦</div>
          </div>
          <div style={{ fontSize: 88, fontWeight: 900, color: COLORS.green, fontFamily: FONT.mono }}>
            {npmDownloads.toLocaleString()}
          </div>
        </div>

        <div
          style={{
            background: "linear-gradient(135deg, rgba(251,191,36,0.15), rgba(251,191,36,0.05))",
            border: `1px solid ${COLORS.gold}`,
            borderRadius: 20,
            padding: "30px 40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontSize: 28, color: COLORS.gray, fontFamily: FONT.display }}>Contributors</div>
            <div style={{ fontSize: 28, color: COLORS.gray, fontFamily: FONT.display, marginTop: 4 }}>🌍</div>
          </div>
          <div style={{ fontSize: 88, fontWeight: 900, color: COLORS.gold, fontFamily: FONT.mono }}>
            {contributors}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// 场景4: CTA
const Scene4CTA: React.FC<{ frame: number }> = ({ frame }) => {
  const f = frame - 1350;
  const titleScale = spring({ frame: f, fps: 30, config: { damping: 10 } });
  const ctaOpacity = interpolate(f, [60, 100, 380, 420], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ctaPulse = f > 100 ? 1 + Math.sin((f - 100) * 0.1) * 0.05 : 1;

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at center, #0a2a1a 0%, ${COLORS.bg} 70%)`,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ textAlign: "center", transform: `scale(${titleScale})` }}>
        <div style={{ fontSize: 100, marginBottom: 30 }}>🌍</div>
        <div style={{ fontSize: 100, fontWeight: 900, color: COLORS.white, fontFamily: FONT.display, lineHeight: 1.1 }}>
          信任的 AI
        </div>
        <div style={{ fontSize: 100, fontWeight: 900, color: COLORS.green, fontFamily: FONT.display, lineHeight: 1.1, textShadow: `0 0 40px ${COLORS.green}` }}>
          从开源开始
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 380,
          opacity: ctaOpacity,
          transform: `scale(${ctaPulse})`,
        }}
      >
        <div
          style={{
            background: COLORS.green,
            color: "#000",
            padding: "28px 60px",
            borderRadius: 24,
            fontSize: 44,
            fontWeight: 900,
            fontFamily: FONT.display,
            textAlign: "center",
            boxShadow: `0 0 60px ${COLORS.green}88`,
            lineHeight: 1.4,
          }}
        >
          github.com/lm203688/<br />agent-trust-protocol
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const AgentTrustStory: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, width, height }}>
      {/* BGM - Fanfare for Space (史诗叙事风) */}
      <Audio
        src={staticFile("audio/Fanfare for Space.mp3")}
        volume={(f) => {
          if (f < 45) return Math.min(0.8, (f / 45) * 0.8); // 1.5秒淡入
          if (f > durationInFrames - 45) {
            return Math.max(0, 0.8 * (1 - (f - (durationInFrames - 45)) / 45));
          }
          return 0.8;
        }}
      />
      {frame < 360 && <Scene1Contrast frame={frame} />}
      {frame >= 360 && frame < 900 && <Scene2Idea frame={frame} />}
      {frame >= 900 && frame < 1350 && <Scene3Action frame={frame} />}
      {frame >= 1350 && <Scene4CTA frame={frame} />}

      {/* 字幕 */}
      {frame < 360 && <Caption text="别人融了 $33M 做闭源" frame={frame} fadeIn={30} hold={140} fadeOut={360} size={64} color={COLORS.gold} />}
      {frame >= 360 && frame < 900 && <Caption text="我们做了一件不一样的事" frame={frame} fadeIn={390} hold={200} fadeOut={900} size={64} color={COLORS.cyan} />}
      {frame >= 900 && frame < 1350 && <Caption text="开放、免费、欢迎共建" frame={frame} fadeIn={930} hold={200} fadeOut={1350} size={64} color={COLORS.green} />}
      {frame >= 1350 && <Caption text="你的参与，决定它的未来" frame={frame} fadeIn={1380} hold={200} fadeOut={1800} size={64} color={COLORS.green} />}

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
            width: `${(frame / (60 * 30)) * 100}%`,
            height: "100%",
            background: `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.green})`,
            boxShadow: `0 0 12px ${COLORS.gold}`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
