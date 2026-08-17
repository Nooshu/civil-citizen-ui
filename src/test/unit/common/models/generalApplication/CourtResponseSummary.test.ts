import {summaryRow} from 'models/summaryList/summaryList';
import {CourtResponseSummaryList, ResponseButton} from 'models/generalApplication/CourtResponseSummary';

describe('CourtResponseSummaryList', () => {
  it('should assign rows, response date and button', () => {
    const rows = [summaryRow('Decision', 'Granted')];
    const date = new Date('2024-01-01');
    const button = new ResponseButton('Respond', '/respond');

    const summary = new CourtResponseSummaryList(rows, date, button);

    expect(summary.rows).toBe(rows);
    expect(summary.responseDateTime).toBe(date);
    expect(summary.responseButton).toBe(button);
  });

  it('should allow construction with rows only', () => {
    const summary = new CourtResponseSummaryList([]);

    expect(summary.rows).toEqual([]);
    expect(summary.responseDateTime).toBeUndefined();
    expect(summary.responseButton).toBeUndefined();
  });
});

describe('ResponseButton', () => {
  it('should assign title and href', () => {
    const button = new ResponseButton('View', '/view');

    expect(button.title).toBe('View');
    expect(button.href).toBe('/view');
  });
});
