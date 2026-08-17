import {YesNo} from 'form/models/yesNo';
import {GaResponse} from 'models/generalApplication/response/gaResponse';
import {HearingArrangement} from 'models/generalApplication/hearingArrangement';
import {HearingContactDetails} from 'models/generalApplication/hearingContactDetails';
import {UploadGAFiles} from 'models/generalApplication/uploadGAFiles';

describe('GaResponse', () => {
  it('should assign provided constructor values', () => {
    const hearingArrangement = {option: 'inPerson'} as HearingArrangement;
    const hearingContactDetails = {telephoneNumber: '07700900000'} as HearingContactDetails;
    const upload = new UploadGAFiles();

    const response = new GaResponse(
      hearingArrangement,
      hearingContactDetails,
      YesNo.YES,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      YesNo.YES,
      upload,
      YesNo.NO,
    );

    expect(response.hearingArrangement).toBe(hearingArrangement);
    expect(response.hearingContactDetails).toBe(hearingContactDetails);
    expect(response.agreeToOrder).toBe(YesNo.YES);
    expect(response.wantToUploadDocuments).toBe(YesNo.YES);
    expect(response.uploadEvidenceDocuments).toEqual([upload]);
    expect(response.hasUnavailableDatesHearing).toBe(YesNo.NO);
  });

  it('should default uploadEvidenceDocuments to empty array when omitted', () => {
    const response = new GaResponse();

    expect(response.uploadEvidenceDocuments).toEqual([]);
    expect(response.hearingArrangement).toBeUndefined();
    expect(response.agreeToOrder).toBeUndefined();
  });
});
