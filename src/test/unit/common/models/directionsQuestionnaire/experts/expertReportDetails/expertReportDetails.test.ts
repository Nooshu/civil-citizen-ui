import {ExpertReportDetails} from 'common/models/directionsQuestionnaire/experts/expertReportDetails/expertReportDetails';
import {ReportDetail} from 'common/models/directionsQuestionnaire/experts/expertReportDetails/reportDetail';
import {YesNo} from 'form/models/yesNo';
import {GenericForm} from 'common/form/models/genericForm';

describe('ExpertReportDetails', () => {
  it('constructs with claimant flag, option and report details', () => {
    const details = [new ReportDetail('Dr Smith', '2023', '1', '15')];
    const model = new ExpertReportDetails(true, YesNo.YES, details);

    expect(model.isClaimant).toBe(true);
    expect(model.option).toBe(YesNo.YES);
    expect(model.reportDetails).toEqual(details);
  });

  it('removeEmptyReportDetails filters blank rows', () => {
    const model = new ExpertReportDetails(false, YesNo.YES, [
      new ReportDetail('Dr Smith', '2023', '1', '15'),
      new ReportDetail('', '', '', ''),
    ]);

    const filtered = ExpertReportDetails.removeEmptyReportDetails(model);

    expect(filtered.reportDetails).toHaveLength(1);
    expect(filtered.reportDetails![0].expertName).toBe('Dr Smith');
    expect(filtered.option).toBe(YesNo.YES);
  });

  it('removeEmptyReportDetails tolerates missing reportDetails', () => {
    const model = new ExpertReportDetails(false, YesNo.NO);

    const filtered = ExpertReportDetails.removeEmptyReportDetails(model);

    expect(filtered.reportDetails).toBeUndefined();
  });

  it('requires report details for defendant when option is yes', async () => {
    const model = new ExpertReportDetails(false, YesNo.YES, [new ReportDetail('', '', '', '')]);
    const form = new GenericForm(model);

    await form.validate();

    expect(form.hasErrors()).toBe(true);
  });

  it('does not require report details for claimant when option is yes', async () => {
    const model = new ExpertReportDetails(true, YesNo.YES, []);
    const form = new GenericForm(model);

    await form.validate();

    expect(form.errorFor('reportDetails')).toBeUndefined();
  });
});
