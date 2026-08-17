import {changeLabel} from 'common/utils/checkYourAnswer/changeButton';

jest.mock('../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('changeButton', () => {
  it('should return change button translation key for language', () => {
    expect(changeLabel('en')).toEqual('COMMON.BUTTONS.CHANGE');
  });

  it('should return change button translation key for welsh', () => {
    expect(changeLabel('cy')).toEqual('COMMON.BUTTONS.CHANGE');
  });
});
