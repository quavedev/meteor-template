import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('quave:unblock loads after authentication packages', async function () {
  const packages = await readFile('.meteor/packages', 'utf8');
  const accountsPackageIndex = packages.indexOf(
    'quave:accounts-passwordless-react'
  );
  const unblockPackageIndex = packages.indexOf('quave:unblock@1.0.0');

  assert.notEqual(accountsPackageIndex, -1, 'expected the authentication package');
  assert.ok(
    unblockPackageIndex > accountsPackageIndex,
    'quave:unblock must load after authentication packages'
  );
});
