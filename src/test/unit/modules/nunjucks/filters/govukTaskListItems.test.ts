import {TaskItem} from 'models/taskList/task';
import {TaskStatus} from 'models/taskList/TaskStatus';
import {DashboardTask} from 'models/dashboard/taskList/dashboardTask';
import {toDashboardGovukTaskListItems, toGovukTaskListItems} from 'modules/nunjucks/filters/govukTaskListItems';

describe('toGovukTaskListItems', () => {
  const translate = (key: string) => key;

  it('omits href when the task cannot be started', () => {
    const tasks = [
      new TaskItem('PAGES.TASK.ONE', '/one', TaskStatus.INCOMPLETE),
      new TaskItem('PAGES.TASK.TWO', '/two', TaskStatus.NOT_AVAILABLE_YET),
    ];
    const items = toGovukTaskListItems(tasks, translate);
    expect(items[0].href).toBe('/one');
    expect(items[0].status.tag.classes).toBe('govuk-tag--grey');
    expect(items[1].href).toBeUndefined();
  });

  it('returns an empty array when there are no tasks', () => {
    expect(toGovukTaskListItems(undefined, translate)).toEqual([]);
  });
});

describe('toDashboardGovukTaskListItems', () => {
  it('uses Welsh copy and hint when lang is cy', () => {
    const task = new DashboardTask(
      '1',
      '<a class="govuk-link" href="/en">English</a>',
      '<a class="govuk-link" href="/cy">Cymraeg</a>',
      'Complete',
      'Wedi’i gwblhau',
      'govuk-tag--green',
      'Hint EN',
      'Hint CY',
    );
    const [item] = toDashboardGovukTaskListItems([task], 'cy');
    expect(item.title.html).toContain('Cymraeg');
    expect(item.href).toBeUndefined();
    expect(item.hint?.text).toBe('Hint CY');
    expect(item.status.tag.text).toBe('Wedi’i gwblhau');
  });
});
