'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GraphNode {
  id: string;
  name: string;
  nodeType: string;
  centrality: number;
  community?: number | null;
  attributes?: Record<string, any>;
}

export interface GraphEdge {
  fromNodeId: string;
  toNodeId: string;
  relationType: string;
  weight: number;
}

interface NetworkGraphViewProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  height?: number;
  onNodeClick?: (node: GraphNode) => void;
  selectedNodeId?: string;
}

// ---------------------------------------------------------------------------
// 节点类型配色（按nodeType区分）
// ---------------------------------------------------------------------------

const NODE_TYPE_CONFIG: Record<string, { color: string; label: string; icon: string }> = {
  person:       { color: 'oklch(0.70 0.12 180)', label: '人物',   icon: '人' },
  goal:         { color: 'oklch(0.70 0.14 145)', label: '目标',   icon: '目' },
  pressure:     { color: 'oklch(0.65 0.18 25)',  label: '压力',   icon: '压' },
  resource:     { color: 'oklch(0.65 0.10 50)',  label: '资源',   icon: '资' },
  belief:       { color: 'oklch(0.60 0.10 280)', label: '信念',   icon: '信' },
  event:        { color: 'oklch(0.78 0.14 85)',  label: '事件',   icon: '事' },
  institution:  { color: 'oklch(0.55 0.10 230)', label: '机构',   icon: '构' },
  force:        { color: 'oklch(0.62 0.14 350)', label: '外力',   icon: '力' },
};

const RELATION_LABELS: Record<string, string> = {
  influence_of: '影响',
  opposes: '反对',
  supports: '支持',
  employs: '雇佣',
  depends_on: '依赖',
  conflicts_with: '冲突',
  allied_with: '结盟',
  part_of: '属于',
  causes: '导致',
  fears: '畏惧',
};

// ---------------------------------------------------------------------------
// 简化力导向布局算法（不依赖d3，纯TS实现）
// ---------------------------------------------------------------------------

interface PositionedNode extends GraphNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

function runForceLayout(
  nodes: GraphNode[],
  edges: GraphEdge[],
  width: number,
  height: number,
  iterations: number = 200,
): PositionedNode[] {
  if (nodes.length === 0) return [];

  // 初始化：圆周分布
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * 0.35;

  const positioned: PositionedNode[] = nodes.map((node, i) => {
    const angle = (i / nodes.length) * Math.PI * 2;
    return {
      ...node,
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius,
      vx: 0,
      vy: 0,
    };
  });

  const nodeMap = new Map(positioned.map(n => [n.id, n]));

  // 力导向参数
  const repulsion = 8000;       // 节点间排斥力
  const attraction = 0.05;      // 边的吸引力
  const centering = 0.01;       // 向中心的引力
  const damping = 0.85;         // 阻尼

  for (let iter = 0; iter < iterations; iter++) {
    // 1. 节点间排斥力（库仑力）
    for (let i = 0; i < positioned.length; i++) {
      for (let j = i + 1; j < positioned.length; j++) {
        const a = positioned[i];
        const b = positioned[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = repulsion / (dist * dist);
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        a.vx += fx;
        a.vy += fy;
        b.vx -= fx;
        b.vy -= fy;
      }
    }

    // 2. 边的吸引力（弹簧力）
    for (const edge of edges) {
      const a = nodeMap.get(edge.fromNodeId);
      const b = nodeMap.get(edge.toNodeId);
      if (!a || !b) continue;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const force = attraction * dist * edge.weight;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      a.vx += fx;
      a.vy += fy;
      b.vx -= fx;
      b.vy -= fy;
    }

    // 3. 中心引力 + 速度衰减 + 位置更新
    for (const node of positioned) {
      node.vx += (cx - node.x) * centering;
      node.vy += (cy - node.y) * centering;
      node.vx *= damping;
      node.vy *= damping;
      node.x += node.vx;
      node.y += node.vy;

      // 边界约束
      const padding = 40;
      node.x = Math.max(padding, Math.min(width - padding, node.x));
      node.y = Math.max(padding, Math.min(height - padding, node.y));
    }
  }

  return positioned;
}

// ---------------------------------------------------------------------------
// 主组件
// ---------------------------------------------------------------------------

export function NetworkGraphView({
  nodes,
  edges,
  height = 400,
  onNodeClick,
  selectedNodeId,
}: NetworkGraphViewProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [containerWidth, setContainerWidth] = useState(800);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [showLabels, setShowLabels] = useState(true);

  // 响应式宽度
  useEffect(() => {
    const updateWidth = () => {
      if (svgRef.current?.parentElement) {
        setContainerWidth(svgRef.current.parentElement.offsetWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // 力导向布局
  const positionedNodes = useMemo(() => {
    return runForceLayout(nodes, edges, containerWidth, height, 250);
  }, [nodes, edges, containerWidth, height]);

  const nodeMap = useMemo(() => {
    return new Map(positionedNodes.map(n => [n.id, n]));
  }, [positionedNodes]);

  // 计算节点大小（基于中心度）
  const maxCentrality = Math.max(...nodes.map(n => n.centrality ?? 0), 0.1);
  const getNodeRadius = (centrality: number) => {
    return 12 + (centrality / maxCentrality) * 18; // 12-30px
  };

  return (
    <div className="relative w-full">
      {/* 控制条 */}
      <div className="mb-2 flex items-center justify-between">
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-[oklch(0.50_0.015_200)]">
          <span>{nodes.length} 节点 · {edges.length} 边</span>
        </div>
        <button
          onClick={() => setShowLabels(!showLabels)}
          className="rounded border border-[oklch(0.70_0.12_180/15%)] px-2 py-0.5 text-[10px] font-mono text-[oklch(0.55_0.015_200)] transition-colors hover:border-[oklch(0.70_0.12_180/30%)] hover:text-[oklch(0.70_0.12_180)]"
        >
          {showLabels ? '隐藏标签' : '显示标签'}
        </button>
      </div>

      {/* SVG图谱 */}
      <div className="relative overflow-hidden rounded-lg border border-[oklch(0.70_0.12_180/10%)] bg-[oklch(0.11_0.005_200/60%)]">
        <svg
          ref={svgRef}
          width={containerWidth}
          height={height}
          className="block"
        >
          {/* 网格背景 */}
          <defs>
            <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path
                d="M 32 0 L 0 0 0 32"
                fill="none"
                stroke="oklch(0.70 0.12 180 / 4%)"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width={containerWidth} height={height} fill="url(#grid)" />

          {/* 边 */}
          <g>
            {edges.map((edge, i) => {
              const from = nodeMap.get(edge.fromNodeId);
              const to = nodeMap.get(edge.toNodeId);
              if (!from || !to) return null;

              const isHighlighted =
                hoveredNode?.id === edge.fromNodeId ||
                hoveredNode?.id === edge.toNodeId ||
                selectedNodeId === edge.fromNodeId ||
                selectedNodeId === edge.toNodeId;

              return (
                <g key={i}>
                  <line
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke={isHighlighted ? 'oklch(0.70 0.12 180 / 60%)' : 'oklch(0.70 0.12 180 / 15%)'}
                    strokeWidth={isHighlighted ? 1.5 : 1}
                    strokeDasharray={edge.relationType === 'conflicts_with' || edge.relationType === 'opposes' ? '4 2' : 'none'}
                  />
                  {/* 边的箭头 */}
                  <ArrowMarker
                    from={from}
                    to={to}
                    color={isHighlighted ? 'oklch(0.70 0.12 180 / 60%)' : 'oklch(0.70 0.12 180 / 25%)'}
                  />
                </g>
              );
            })}
          </g>

          {/* 节点 */}
          <g>
            {positionedNodes.map((node) => {
              const config = NODE_TYPE_CONFIG[node.nodeType] ?? NODE_TYPE_CONFIG.event;
              const radius = getNodeRadius(node.centrality ?? 0);
              const isHovered = hoveredNode?.id === node.id;
              const isSelected = selectedNodeId === node.id;
              const isHighlighted = isHovered || isSelected;

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  style={{ cursor: onNodeClick ? 'pointer' : 'default' }}
                  onMouseEnter={() => setHoveredNode(node)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => onNodeClick?.(node)}
                >
                  {/* 外圈光晕（hover时显示） */}
                  {isHighlighted && (
                    <circle
                      r={radius + 6}
                      fill="none"
                      stroke={config.color}
                      strokeWidth="1"
                      opacity="0.4"
                    />
                  )}

                  {/* 主节点圆 */}
                  <motion.circle
                    initial={{ r: 0 }}
                    animate={{ r: radius }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    fill={`${config.color.replace('oklch(', 'oklch(').replace(')', ' / 25%)')}`}
                    stroke={config.color}
                    strokeWidth={isSelected ? 2 : 1.5}
                  />

                  {/* 节点类型图标（中心字） */}
                  <text
                    textAnchor="middle"
                    dy="0.35em"
                    fontSize={radius * 0.6}
                    fill={config.color}
                    fontWeight="bold"
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    {config.icon}
                  </text>

                  {/* 节点名称标签 */}
                  {showLabels && (
                    <text
                      textAnchor="middle"
                      y={radius + 14}
                      fontSize="10"
                      fill={isHighlighted ? 'oklch(0.85 0.01 200)' : 'oklch(0.60 0.01 200)'}
                      style={{ pointerEvents: 'none', userSelect: 'none' }}
                    >
                      {node.name.length > 8 ? node.name.slice(0, 7) + '…' : node.name}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* 悬浮提示卡片 */}
        {hoveredNode && (
          <div
            className="pointer-events-none absolute z-10 max-w-[200px] rounded border border-[oklch(0.70_0.12_180/25%)] bg-[oklch(0.13_0.005_200/95%)] p-2 text-[10px] backdrop-blur-sm"
            style={{
              left: Math.min((nodeMap.get(hoveredNode.id)?.x ?? 0) + 15, containerWidth - 210),
              top: Math.max((nodeMap.get(hoveredNode.id)?.y ?? 0) - 50, 5),
            }}
          >
            <div className="mb-0.5 flex items-center gap-1.5">
              <span
                className="size-2 rounded-full"
                style={{ background: NODE_TYPE_CONFIG[hoveredNode.nodeType]?.color ?? '#888' }}
              />
              <span className="font-semibold text-[oklch(0.85_0.01_200)]">{hoveredNode.name}</span>
            </div>
            <div className="font-mono text-[oklch(0.50_0.015_200)]">
              类型: {NODE_TYPE_CONFIG[hoveredNode.nodeType]?.label ?? hoveredNode.nodeType}
            </div>
            <div className="font-mono text-[oklch(0.50_0.015_200)]">
              中心度: {((hoveredNode.centrality ?? 0) * 100).toFixed(0)}%
            </div>
            {hoveredNode.community !== undefined && hoveredNode.community !== null && (
              <div className="font-mono text-[oklch(0.50_0.015_200)]">
                阵营: #{hoveredNode.community + 1}
              </div>
            )}
            {hoveredNode.attributes?.description && (
              <div className="mt-1 text-[oklch(0.55_0.01_200)]">
                {String(hoveredNode.attributes.description).slice(0, 80)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 图例 */}
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-mono">
        {Object.entries(NODE_TYPE_CONFIG).map(([type, config]) => {
          const hasType = nodes.some(n => n.nodeType === type);
          if (!hasType) return null;
          return (
            <span key={type} className="flex items-center gap-1 text-[oklch(0.55_0.015_200)]">
              <span
                className="size-2.5 rounded-full"
                style={{ background: config.color }}
              />
              {config.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 箭头标记
// ---------------------------------------------------------------------------

function ArrowMarker({
  from,
  to,
  color,
}: {
  from: { x: number; y: number };
  to: { x: number; y: number };
  color: string;
}) {
  // 计算箭头位置（在to节点边缘）
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  const radius = 15; // 大致节点半径
  const arrowX = to.x - (dx / dist) * radius;
  const arrowY = to.y - (dy / dist) * radius;

  // 箭头方向
  const angle = Math.atan2(dy, dx);
  const arrowSize = 5;
  const x1 = arrowX - arrowSize * Math.cos(angle - Math.PI / 6);
  const y1 = arrowY - arrowSize * Math.sin(angle - Math.PI / 6);
  const x2 = arrowX - arrowSize * Math.cos(angle + Math.PI / 6);
  const y2 = arrowY - arrowSize * Math.sin(angle + Math.PI / 6);

  return (
    <polygon
      points={`${arrowX},${arrowY} ${x1},${y1} ${x2},${y2}`}
      fill={color}
    />
  );
}
