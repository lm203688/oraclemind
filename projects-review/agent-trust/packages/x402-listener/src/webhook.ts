import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { transactionStore } from '@agent-trust/core';
import { normaliseX402Event, type X402PaymentEvent } from './normaliser.js';

const PORT = Number(process.env['LISTENER_PORT'] ?? 4402);
const WEBHOOK_SECRET = process.env['X402_WEBHOOK_SECRET'];

/**
 * Read and parse a JSON request body.
 */
async function readJson(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk: Buffer) => { data += chunk.toString(); });
    req.on('end', () => {
      try { resolve(JSON.parse(data)); }
      catch (e) { reject(e); }
    });
    req.on('error', reject);
  });
}

/**
 * Minimal HMAC-SHA256 signature check.
 * The gateway sends X-X402-Signature: sha256=<hex>
 */
async function verifySignature(
  body: string,
  signature: string | undefined,
  secret: string
): Promise<boolean> {
  if (!signature) return false;
  const { createHmac } = await import('node:crypto');
  const expected = 'sha256=' + createHmac('sha256', secret).update(body).digest('hex');
  return expected === signature;
}

/**
 * HTTP webhook listener for x402 payment events.
 *
 * Configure your x402 gateway to POST events to:
 *   http://your-server:4402/webhook/x402
 *
 * Optionally set X402_WEBHOOK_SECRET for signature verification.
 */
export function startWebhookListener(): void {
  const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
    if (req.method === 'GET' && req.url === '/health') {
      const stats = transactionStore.stats();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', ...stats }));
      return;
    }

    if (req.method === 'POST' && req.url === '/webhook/x402') {
      let rawBody = '';
      req.on('data', (c: Buffer) => { rawBody += c.toString(); });

      await new Promise<void>((resolve) => req.on('end', resolve));

      // Signature verification if secret is configured
      if (WEBHOOK_SECRET) {
        const sig = req.headers['x-x402-signature'] as string | undefined;
        const valid = await verifySignature(rawBody, sig, WEBHOOK_SECRET);
        if (!valid) {
          res.writeHead(401);
          res.end(JSON.stringify({ error: 'Invalid signature' }));
          return;
        }
      }

      let event: X402PaymentEvent;
      try {
        event = JSON.parse(rawBody) as X402PaymentEvent;
      } catch {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
        return;
      }

      const record = normaliseX402Event(event);
      transactionStore.add(record);

      console.log(
        `[x402 listener] Recorded tx ${record.id} — provider: ${record.providerDid} status: ${record.status}`
      );

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ received: true, transactionId: record.id }));
      return;
    }

    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
  });

  server.listen(PORT, () => {
    console.log(`[x402 listener] Webhook server listening on port ${PORT}`);
    console.log(`  Health check: http://localhost:${PORT}/health`);
    console.log(`  Webhook URL:  http://your-server:${PORT}/webhook/x402`);
  });
}
