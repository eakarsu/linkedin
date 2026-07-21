import assert from 'node:assert/strict';
import test from 'node:test';
import { assertSalesTransition, SalesWorkflowError, salesSha256, stableJson } from '../lib/governed-sales';
import { tokenEnvironmentName } from '../lib/sales-connectors';

test('sales lifecycle accepts only explicit transitions', () => {
  assert.equal(assertSalesTransition('NEW', 'QUALIFIED'), true);
  assert.throws(() => assertSalesTransition('NEW', 'CONVERTED'), (error: unknown) => {
    assert.ok(error instanceof SalesWorkflowError);
    assert.equal(error.code, 'INVALID_LIFECYCLE_TRANSITION');
    return true;
  });
});

test('canonical evidence and credential references are deterministic', () => {
  assert.equal(stableJson({ b: 2, a: 1 }), stableJson({ a: 1, b: 2 }));
  assert.equal(salesSha256({ b: 2, a: 1 }), salesSha256({ a: 1, b: 2 }));
  assert.equal(tokenEnvironmentName('mail-provider'), 'SALES_CONNECTOR_TOKEN_MAIL_PROVIDER');
  assert.throws(() => tokenEnvironmentName('bad reference!'), /invalid/);
});
