import {Bundle} from 'models/caseProgression/bundles/bundle';
import {getMockDocument} from '../../../../../utils/mockDocument';

describe('Bundle', () => {
  const document = getMockDocument();
  const createdOn = new Date('2023-02-01T00:00:00.000Z');
  const hearingDate = new Date('2023-03-15T00:00:00.000Z');

  it('stores dates when provided and formats them', () => {
    const bundle = new Bundle('Trial bundle', document, createdOn, hearingDate);

    expect(bundle.title).toBe('Trial bundle');
    expect(bundle.stitchedDocument).toBe(document);
    expect(bundle.getFormattedCreatedOn).toMatch(/\d{1,2} \w+ \d{4}/);
    expect(bundle.getFormattedHearingDate).toMatch(/\d{1,2} \w+ \d{4}/);
  });

  it('returns undefined formatters when dates are missing', () => {
    const bundle = new Bundle('Empty bundle');

    expect(bundle.createdOn).toBeNull();
    expect(bundle.bundleHearingDate).toBeNull();
    expect(bundle.getFormattedCreatedOn).toBeUndefined();
    expect(bundle.getFormattedHearingDate).toBeUndefined();
  });
});
