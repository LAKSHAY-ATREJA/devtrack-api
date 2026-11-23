const { canonicalize, hashPayload } = require('../src/utils/idempotency');

describe('idempotency payload hashing', () => {
  it('is stable across object key order', () => {
    const first = { company: 'Atlassian', metadata: { b: 2, a: 1 } };
    const second = { metadata: { a: 1, b: 2 }, company: 'Atlassian' };

    expect(hashPayload(first)).toBe(hashPayload(second));
  });

  it('changes when the request meaning changes', () => {
    expect(hashPayload({ company: 'Atlassian' })).not.toBe(
      hashPayload({ company: 'Canva' })
    );
  });

  it('removes undefined fields while preserving array order', () => {
    expect(canonicalize({ ignored: undefined, values: [2, 1] })).toEqual({
      values: [2, 1],
    });
  });
});
