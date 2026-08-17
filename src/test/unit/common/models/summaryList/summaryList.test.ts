import {
  summaryRow,
  summaryRowWithTextValue,
  systemHtmlRow,
  userTextRow,
  CSS_CLASS_SUMMARY_LIST_KEY,
} from 'models/summaryList/summaryList';

describe('summaryList helpers', () => {
  describe('summaryRow', () => {
    it('should build a row with html value and no actions', () => {
      expect(summaryRow('Key', '<b>Value</b>')).toEqual({
        key: {text: 'Key'},
        value: {html: '<b>Value</b>'},
      });
    });

    it('should add actions with accessibility text when href is provided', () => {
      expect(summaryRow('Key', 'Value', '/change', 'Change', 'hidden')).toEqual({
        key: {text: 'Key'},
        value: {html: 'Value'},
        actions: {
          items: [
            {
              href: '/change',
              text: 'Change',
              visuallyHiddenText: 'Key (hidden)',
            },
          ],
        },
      });
    });

    it('should use key alone for visually hidden text when hiddenText is omitted', () => {
      const row = summaryRow('Amount', '£10', '/edit', 'Edit');

      expect(row.actions.items[0].visuallyHiddenText).toBe('Amount');
    });
  });

  describe('summaryRowWithTextValue', () => {
    it('should set value as text rather than html', () => {
      expect(summaryRowWithTextValue('Key', '<script>x</script>')).toEqual({
        key: {text: 'Key'},
        value: {text: '<script>x</script>'},
      });
    });

    it('should include actions when href is provided', () => {
      const row = summaryRowWithTextValue('Name', 'Alice', '/name', 'Change', 'details');

      expect(row.actions.items[0]).toEqual({
        href: '/name',
        text: 'Change',
        visuallyHiddenText: 'Name (details)',
      });
    });
  });

  describe('convenience helpers', () => {
    it('userTextRow should delegate to summaryRowWithTextValue', () => {
      expect(userTextRow('Key', 'User text', '/x', 'Change')).toEqual(
        summaryRowWithTextValue('Key', 'User text', '/x', 'Change'),
      );
    });

    it('systemHtmlRow should delegate to summaryRow', () => {
      expect(systemHtmlRow('Key', '<p>Safe</p>', '/x', 'Change')).toEqual(
        summaryRow('Key', '<p>Safe</p>', '/x', 'Change'),
      );
    });
  });

  it('should export summary list key css class constant', () => {
    expect(CSS_CLASS_SUMMARY_LIST_KEY).toBe('govuk-summary-list__key');
  });
});
