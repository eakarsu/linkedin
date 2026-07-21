import dns from 'node:dns/promises';
import net from 'node:net';
import type { PrismaClient } from '@prisma/client';
import type { SalesDeliveryAdapter } from './governed-sales';
import { SalesWorkflowError } from './governed-sales';

function tokenEnvironmentName(reference: string): string {
  if (!/^[A-Za-z0-9_-]{1,80}$/.test(reference)) {
    throw new SalesWorkflowError(500, 'INVALID_CONNECTOR_CONFIG', 'Connector credential reference is invalid');
  }
  return `SALES_CONNECTOR_TOKEN_${reference.toUpperCase().replace(/-/g, '_')}`;
}

function privateAddress(address: string): boolean {
  if (net.isIP(address) === 4) {
    const parts = address.split('.').map(Number);
    return parts[0] === 10 || parts[0] === 127 || parts[0] === 0
      || (parts[0] === 169 && parts[1] === 254)
      || (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31)
      || (parts[0] === 192 && parts[1] === 168);
  }
  const normalized = address.toLowerCase();
  return normalized === '::1' || normalized === '::' || normalized.startsWith('fc')
    || normalized.startsWith('fd') || normalized.startsWith('fe8') || normalized.startsWith('fe9')
    || normalized.startsWith('fea') || normalized.startsWith('feb');
}

async function safeEndpoint(value: string): Promise<URL> {
  let endpoint: URL;
  try {
    endpoint = new URL(value);
  } catch {
    throw new SalesWorkflowError(500, 'INVALID_CONNECTOR_CONFIG', 'Connector endpoint is invalid');
  }
  if (endpoint.protocol !== 'https:' || endpoint.username || endpoint.password || endpoint.hash) {
    throw new SalesWorkflowError(500, 'INVALID_CONNECTOR_CONFIG', 'Connector endpoint must be credential-free HTTPS');
  }
  if (net.isIP(endpoint.hostname) || endpoint.hostname === 'localhost' || endpoint.hostname.endsWith('.local')) {
    throw new SalesWorkflowError(500, 'CONNECTOR_NETWORK_DENIED', 'Connector endpoints cannot use local hosts');
  }
  const addresses = await dns.lookup(endpoint.hostname, { all: true });
  if (!addresses.length || addresses.some((entry) => privateAddress(entry.address))) {
    throw new SalesWorkflowError(500, 'CONNECTOR_NETWORK_DENIED', 'Connector endpoint resolved to a private network');
  }
  return endpoint;
}

export function createSalesConnectorAdapter(
  db: PrismaClient,
  options: { fetch?: typeof fetch; timeoutMs?: number; maxResponseBytes?: number } = {},
): SalesDeliveryAdapter {
  const fetchImplementation = options.fetch ?? globalThis.fetch;
  const timeoutMs = options.timeoutMs ?? 8_000;
  const maxResponseBytes = options.maxResponseBytes ?? 128 * 1024;
  return {
    async deliver(input) {
      const connector = await db.salesConnector.findFirst({
        where: { workspaceId: input.workspaceId, kind: input.connectorKind, enabled: true },
        orderBy: { createdAt: 'asc' },
      });
      if (!connector) {
        throw Object.assign(new Error(`No enabled ${input.connectorKind} connector`), { retryable: false });
      }
      const endpoint = await safeEndpoint(connector.endpoint);
      const token = process.env[tokenEnvironmentName(connector.credentialReference)];
      if (!token || token.length < 24) {
        throw Object.assign(new Error('Connector credential is unavailable'), { retryable: false });
      }
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      let response: Response;
      try {
        response = await fetchImplementation(endpoint, {
          method: 'POST',
          redirect: 'error',
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Idempotency-Key': input.idempotencyKey,
            'X-Sales-Event': input.eventType,
          },
          body: JSON.stringify(input.payload),
        });
      } catch {
        throw Object.assign(new Error('Connector request failed'), {
          retryable: true,
        });
      } finally {
        clearTimeout(timer);
      }
      const contentLength = Number(response.headers.get('content-length') ?? 0);
      if (contentLength > maxResponseBytes) {
        throw Object.assign(new Error('Connector response is too large'), { retryable: false });
      }
      const responseText = await response.text();
      if (Buffer.byteLength(responseText) > maxResponseBytes) {
        throw Object.assign(new Error('Connector response is too large'), { retryable: false });
      }
      if (!response.ok) {
        throw Object.assign(new Error(`Connector returned HTTP ${response.status}`), {
          retryable: response.status === 408 || response.status === 429 || response.status >= 500,
        });
      }
      let body: unknown;
      try {
        body = JSON.parse(responseText);
      } catch {
        throw Object.assign(new Error('Connector returned invalid JSON'), { retryable: false });
      }
      const record = body as Record<string, unknown>;
      const providerEventId = typeof record.eventId === 'string' ? record.eventId
        : typeof record.id === 'string' ? record.id : '';
      if (!providerEventId || providerEventId.length > 200) {
        throw Object.assign(new Error('Connector response lacks an event identifier'), { retryable: false });
      }
      const providerMessageId = typeof record.messageId === 'string' ? record.messageId : undefined;
      return { provider: connector.provider, providerEventId, providerMessageId };
    },
  };
}

export { tokenEnvironmentName };
