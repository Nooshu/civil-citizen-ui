import {GenericForm} from 'form/models/genericForm';
import {
  HearingSupport,
  Support,
  SupportType,
} from 'models/generalApplication/hearingSupport';

describe('HearingSupport', () => {
  it('should create support entries for selected and unselected options', () => {
    const support = new HearingSupport(
      [
        SupportType.STEP_FREE_ACCESS,
        SupportType.SIGN_LANGUAGE_INTERPRETER,
        SupportType.LANGUAGE_INTERPRETER,
        SupportType.OTHER_SUPPORT,
      ],
      'BSL',
      'Welsh',
      'Quiet room',
    );

    expect(support.stepFreeAccess.selected).toBe(true);
    expect(support.hearingLoop.selected).toBe(false);
    expect(support.signLanguageInterpreter.content).toBe('BSL');
    expect(support.languageInterpreter.content).toBe('Welsh');
    expect(support.otherSupport.content).toBe('Quiet room');
  });

  it('should convert arrays, single values and empty values to support arrays', () => {
    const selected = [SupportType.HEARING_LOOP];
    expect(HearingSupport.convertToArray(selected)).toBe(selected);
    expect(HearingSupport.convertToArray(SupportType.OTHER_SUPPORT)).toEqual([
      SupportType.OTHER_SUPPORT,
    ]);
    expect(HearingSupport.convertToArray(undefined as unknown as string)).toEqual([]);
  });

  it.each([
    [
      SupportType.SIGN_LANGUAGE_INTERPRETER,
      'ERRORS.GENERAL_APPLICATION.MISSING_SIGN_LANGUAGE',
    ],
    [
      SupportType.LANGUAGE_INTERPRETER,
      'ERRORS.GENERAL_APPLICATION.MISSING_LANGUAGE',
    ],
    [SupportType.OTHER_SUPPORT, 'ERRORS.GENERAL_APPLICATION.MISSING_OTHER'],
  ])('should require content for selected %s support', async (sourceName, message) => {
    const form = new GenericForm(new Support(sourceName, true));
    await form.validate();
    expect(form.errorFor('content')).toBe(message);
  });

  it('should not require content for unselected support', async () => {
    const form = new GenericForm(new Support(SupportType.HEARING_LOOP, false));
    await form.validate();
    expect(form.hasErrors()).toBe(false);
  });

  it('should use no custom message for support without detailed content', async () => {
    const form = new GenericForm(new Support(SupportType.STEP_FREE_ACCESS, true));
    await form.validate();
    expect(form.hasErrors()).toBe(true);
  });
});
