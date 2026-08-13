import {summaryRow} from 'models/summaryList/summaryList';
import {summarySection} from 'models/summaryList/summarySections';

describe('summarySection', () => {
  it('should build a section with title and rows', () => {
    const rows = [summaryRow('A', '1'), summaryRow('B', '2')];

    expect(summarySection({title: 'Details', summaryRows: rows})).toEqual({
      title: 'Details',
      summaryList: {
        rows,
      },
    });
  });

  it('should include classes when provided', () => {
    expect(summarySection({
      title: 'Section',
      classes: 'govuk-!-margin-bottom-0',
      summaryRows: [],
    })).toEqual({
      title: 'Section',
      summaryList: {
        classes: 'govuk-!-margin-bottom-0',
        rows: [],
      },
    });
  });

  it('should omit classes when not provided', () => {
    const section = summarySection({title: 'Empty', summaryRows: []});

    expect(section.summaryList).not.toHaveProperty('classes');
  });
});
