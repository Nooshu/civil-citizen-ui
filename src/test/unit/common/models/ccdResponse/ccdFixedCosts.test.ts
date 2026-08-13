import {toCCDFixedCost} from 'models/ccdResponse/ccdFixedCosts';
import {FixedCosts} from 'form/models/claimDetails';

describe('toCCDFixedCost', () => {
  it('returns undefined when fixed costs are missing', () => {
    expect(toCCDFixedCost(undefined)).toBeUndefined();
    expect(toCCDFixedCost(null as unknown as FixedCosts)).toBeUndefined();
  });

  it('maps fixed cost amount and claim fixed costs flag', () => {
    const fixedCost: FixedCosts = {
      fixedCostAmount: '40',
      claimFixedCosts: 'Yes',
    };

    expect(toCCDFixedCost(fixedCost)).toEqual({
      fixedCostAmount: '40',
      claimFixedCosts: 'Yes',
    });
  });
});
