import {Claim} from 'models/claim';
import {getClaimTimeline} from 'services/features/common/claimTimelineService';

describe('claimTimelineService', () => {
  it('should return empty array when timelineOfEvents is missing', () => {
    expect(getClaimTimeline(new Claim(), 'en')).toEqual([]);
  });

  it('should map timeline events with formatted dates', () => {
    const claim = new Claim();
    claim.timelineOfEvents = [
      {
        value: {
          timelineDate: '2020-02-01',
          timelineDescription: 'event one',
        },
      },
      {
        value: {
          timelineDate: '2021-03-15',
          timelineDescription: 'event two',
        },
      },
    ] as Claim['timelineOfEvents'];

    const result = getClaimTimeline(claim, 'en');

    expect(result).toHaveLength(2);
    expect(result[0].timelineDescription).toBe('event one');
    expect(result[1].timelineDescription).toBe('event two');
    expect(result[0].timelineDate).toContain('2020');
    expect(result[1].timelineDate).toContain('2021');
  });
});
