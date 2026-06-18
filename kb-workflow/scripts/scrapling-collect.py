#!/usr/bin/env python3
"""
Scrapling-based data collection script for KB workflow.
Uses Scrapling's adaptive parsing and anti-bot bypass for robust web scraping.

Usage:
  python3 scrapling-collect.py scrape <url> [--mode stealthy] [-o output.json]
  python3 scrapling-collect.py adaptive <url> <selector> [--mode stealthy] [-o output.json]
  python3 scrapling-collect.py batch <urls_file> [--mode stealthy] [--delay 2] [-o output.json]
  python3 scrapling-collect.py spider <start_url> <pattern> [--depth 3] [-o output.json]

Modes:
  basic    - Fetcher: simple HTTP requests
  stealthy - StealthyFetcher: bypasses anti-bot (Cloudflare, DataDome, etc.)
  dynamic  - DynamicFetcher: handles JS-rendered pages (needs browser)
"""

import json
import sys
import time
import argparse
from datetime import datetime, timezone


def get_fetcher(mode="stealthy"):
    """Get the appropriate Scrapling fetcher based on mode."""
    from scrapling import Fetcher, StealthyFetcher, DynamicFetcher
    if mode == "basic":
        return Fetcher
    elif mode == "dynamic":
        return DynamicFetcher
    else:
        return StealthyFetcher


def _fetch(FetcherClass, url, **kwargs):
    """Unified fetch call — handles API differences between fetcher types."""
    # StealthyFetcher/DynamicFetcher use .fetch(), Fetcher uses .get()
    if hasattr(FetcherClass, 'fetch') and not hasattr(FetcherClass, 'get'):
        return FetcherClass.fetch(url, **kwargs)
    else:
        return FetcherClass.get(url, **kwargs)


def scrape_page(url, mode="stealthy", wait_selector=None, timeout=30):
    """Scrape a single page using Scrapling with adaptive parsing."""
    FetcherClass = get_fetcher(mode)

    try:
        kwargs = {}
        if mode == "dynamic":
            kwargs["headless"] = True
            if wait_selector:
                kwargs["wait_selector"] = wait_selector

        page = _fetch(FetcherClass, url, **kwargs)

        title = None
        try:
            title = page.css("title::text").get()
        except Exception:
            pass

        content = ""
        try:
            content = page.get_all_text()
        except Exception:
            content = str(page.text)[:50000] if hasattr(page, 'text') else ""

        html = None
        try:
            html = str(page.html)[:200000]
        except Exception:
            pass

        return {
            "success": True,
            "url": url,
            "status": page.status,
            "content": content,
            "html": html,
            "title": title,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        return {
            "success": False,
            "url": url,
            "error": str(e),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }


def scrape_with_adaptive(url, selector, mode="stealthy"):
    """Scrape using Scrapling's adaptive element tracking.
    If the website structure changes, adaptive=True will try to find elements
    by structure similarity instead of exact selector match.
    """
    FetcherClass = get_fetcher(mode)
    try:
        page = _fetch(FetcherClass, url)
        # First try exact selector with auto_save for future adaptive matching
        elements = page.css(selector, auto_save=True)
        if not elements:
            # Fall back to adaptive mode — finds elements by structural similarity
            elements = page.css(selector, adaptive=True)

        results = []
        for el in elements[:100]:
            text = ""
            try:
                text = el.get_all_text()
            except Exception:
                text = str(el.text) if hasattr(el, 'text') else ""

            html = None
            try:
                html = str(el.html)
            except Exception:
                pass

            results.append({"text": text, "html": html})

        return {
            "success": True,
            "url": url,
            "selector": selector,
            "count": len(results),
            "elements": results,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        return {
            "success": False,
            "url": url,
            "selector": selector,
            "error": str(e),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }


def batch_scrape(urls, mode="stealthy", delay=2, output_file=None):
    """Scrape multiple URLs with rate limiting."""
    results = []

    for i, url in enumerate(urls):
        print(f"[{i+1}/{len(urls)}] Scraping: {url}", file=sys.stderr)
        result = scrape_page(url, mode=mode)
        results.append(result)

        if result["success"]:
            print(f"  ✓ Status: {result.get('status', 'N/A')}, Content: {len(result.get('content',''))} chars", file=sys.stderr)
        else:
            print(f"  ✗ Error: {result.get('error', 'Unknown')}", file=sys.stderr)

        if i < len(urls) - 1:
            time.sleep(delay)

    if output_file:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        print(f"\nResults saved to {output_file}", file=sys.stderr)

    return results


def spider_crawl(start_url, url_pattern, mode="stealthy", max_depth=3, output_file=None):
    """Crawl using Scrapling's built-in Spider framework."""
    from scrapling.spiders import Spider, Response

    collected = []

    class KBSpider(Spider):
        name = "kb_collector"
        start_urls = [start_url]

        def parse(self, response: Response):
            # Extract links matching pattern
            links = response.css(f'a[href*="{url_pattern}"]')
            for link in links:
                href = link.attrib.get('href', '')
                if href:
                    yield {"url": href, "text": link.get_all_text()}

            # Follow pagination or sub-pages
            next_links = response.css('a.next::attr(href)').getall()
            for next_url in next_links:
                yield response.follow(next_url, self.parse)

    try:
        spider = KBSpider()
        spider.start()
        collected = list(spider.parse(type('R', (), {'css': lambda s: [], 'follow': lambda *a: None})()))
    except Exception as e:
        # Fallback: manual crawl
        print(f"Spider fallback: {e}", file=sys.stderr)
        visited = set()
        to_visit = [start_url]
        depth = 0

        while to_visit and depth < max_depth:
            next_batch = []
            for url in to_visit:
                if url in visited:
                    continue
                visited.add(url)
                result = scrape_page(url, mode=mode)
                if result["success"]:
                    collected.append(result)
                    # Simple link extraction
                    try:
                        page = get_fetcher(mode)
                        page_result = _fetch(page, url)
                        links = page_result.css(f'a[href*="{url_pattern}"]')
                        for link in links:
                            href = link.attrib.get('href', '')
                            if href and href not in visited:
                                next_batch.append(href)
                    except Exception:
                        pass
                time.sleep(1)
            to_visit = next_batch
            depth += 1

    if output_file:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(collected, f, ensure_ascii=False, indent=2)
        print(f"\nResults saved to {output_file}", file=sys.stderr)

    return collected


def main():
    parser = argparse.ArgumentParser(
        description="Scrapling-based KB data collector",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Scrape a single page (stealth mode)
  python3 scrapling-collect.py scrape https://example.com -o result.json

  # Scrape with JS rendering
  python3 scrapling-collect.py scrape https://example.com --mode dynamic -o result.json

  # Adaptive element extraction
  python3 scrapling-collect.py adaptive https://news.site.com '.article-title' -o titles.json

  # Batch scrape from URL list
  python3 scrapling-collect.py batch urls.json --delay 3 -o results.json
        """
    )
    subparsers = parser.add_subparsers(dest="command", help="Command to run")

    # Single page scrape
    scrape_cmd = subparsers.add_parser("scrape", help="Scrape a single page")
    scrape_cmd.add_argument("url", help="URL to scrape")
    scrape_cmd.add_argument("--mode", choices=["basic", "stealthy", "dynamic"], default="stealthy")
    scrape_cmd.add_argument("--output", "-o", help="Output JSON file")

    # Adaptive scrape
    adapt_cmd = subparsers.add_parser("adaptive", help="Scrape with adaptive element tracking")
    adapt_cmd.add_argument("url", help="URL to scrape")
    adapt_cmd.add_argument("selector", help="CSS selector for target elements")
    adapt_cmd.add_argument("--mode", choices=["basic", "stealthy", "dynamic"], default="stealthy")
    adapt_cmd.add_argument("--output", "-o", help="Output JSON file")

    # Batch scrape
    batch_cmd = subparsers.add_parser("batch", help="Batch scrape multiple URLs")
    batch_cmd.add_argument("urls_file", help="JSON file containing URL list")
    batch_cmd.add_argument("--mode", choices=["basic", "stealthy", "dynamic"], default="stealthy")
    batch_cmd.add_argument("--delay", type=float, default=2, help="Delay between requests (seconds)")
    batch_cmd.add_argument("--output", "-o", help="Output JSON file")

    # Spider crawl
    spider_cmd = subparsers.add_parser("spider", help="Spider crawl from start URL")
    spider_cmd.add_argument("start_url", help="Starting URL")
    spider_cmd.add_argument("pattern", help="URL pattern to follow")
    spider_cmd.add_argument("--depth", type=int, default=3, help="Max crawl depth")
    spider_cmd.add_argument("--mode", choices=["basic", "stealthy", "dynamic"], default="stealthy")
    spider_cmd.add_argument("--output", "-o", help="Output JSON file")

    args = parser.parse_args()

    if args.command == "scrape":
        result = scrape_page(args.url, mode=args.mode)
        output = json.dumps(result, ensure_ascii=False, indent=2)
        if args.output:
            with open(args.output, 'w', encoding='utf-8') as f:
                f.write(output)
            print(f"Saved to {args.output}", file=sys.stderr)
        else:
            print(output)

    elif args.command == "adaptive":
        result = scrape_with_adaptive(args.url, args.selector, mode=args.mode)
        output = json.dumps(result, ensure_ascii=False, indent=2)
        if args.output:
            with open(args.output, 'w', encoding='utf-8') as f:
                f.write(output)
            print(f"Saved to {args.output}", file=sys.stderr)
        else:
            print(output)

    elif args.command == "batch":
        with open(args.urls_file, 'r') as f:
            urls = json.load(f)
        batch_scrape(urls, mode=args.mode, delay=args.delay, output_file=args.output)

    elif args.command == "spider":
        spider_crawl(args.start_url, args.pattern, mode=args.mode, max_depth=args.depth, output_file=args.output)

    else:
        parser.print_help()


if __name__ == "__main__":
    main()
