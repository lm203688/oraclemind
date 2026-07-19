'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Share2, Copy, Check, X, Link2 } from 'lucide-react';

interface ShareDialogProps {
  simulationId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareDialog({ simulationId, open, onOpenChange }: ShareDialogProps) {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setShareUrl(`${window.location.origin}/share/${simulationId}`);
    }
  }, [simulationId]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // 降级方案
      const textarea = document.createElement('textarea');
      textarea.value = shareUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => onOpenChange(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-xl border border-[oklch(0.70_0.12_180/20%)] bg-[oklch(0.13_0.005_200)] p-5 shadow-2xl"
          >
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Share2 className="size-4 text-[oklch(0.70_0.12_180)]" />
                <span className="text-sm font-semibold text-foreground">分享推演报告</span>
              </div>
              <button
                onClick={() => onOpenChange(false)}
                className="text-[oklch(0.45_0.015_200)] transition-colors hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* 说明 */}
            <p className="mb-3 text-[11px] leading-relaxed text-[oklch(0.55_0.015_200)]">
              生成公开链接，任何人都能查看这份推演报告（无需登录）。链接永久有效。
            </p>

            {/* 链接框 */}
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-[oklch(0.70_0.12_180/20%)] bg-[oklch(0.16_0.008_200)] p-2.5">
              <Link2 className="size-3.5 shrink-0 text-[oklch(0.55_0.015_200)]" />
              <input
                readOnly
                value={shareUrl}
                className="flex-1 bg-transparent text-[11px] font-mono text-[oklch(0.75_0.01_200)] outline-none"
              />
              <Button
                size="sm"
                onClick={handleCopy}
                className="h-7 gap-1 bg-[oklch(0.70_0.12_180)] px-2.5 text-[10px] text-[oklch(0.13_0.005_200)] hover:bg-[oklch(0.75_0.14_180)]"
              >
                {copied ? (
                  <>
                    <Check className="size-3" />
                    已复制
                  </>
                ) : (
                  <>
                    <Copy className="size-3" />
                    复制
                  </>
                )}
              </Button>
            </div>

            {/* 预览提示 */}
            <div className="rounded border border-[oklch(0.70_0.12_180/12%)] bg-[oklch(0.16_0.008_200/60%)] p-2.5">
              <p className="text-[10px] text-[oklch(0.50_0.015_200)]">
                📋 分享页面包含：推演问题、综合建议、5×5交叉验证矩阵、三情景路径、Agent推演轨迹
              </p>
            </div>

            {/* 打开预览 */}
            <a
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-[oklch(0.70_0.12_180/25%)] py-2 text-[11px] font-mono text-[oklch(0.70_0.12_180)] transition-all hover:bg-[oklch(0.70_0.12_180/8%)]"
            >
              <Link2 className="size-3" />
              在新窗口预览
            </a>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
