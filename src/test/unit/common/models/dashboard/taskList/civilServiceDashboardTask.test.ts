import {CivilServiceDashboardTask} from 'models/dashboard/taskList/civilServiceDashboardTask';
import {DashboardTaskStatus} from 'models/dashboard/taskList/dashboardTaskStatus';

describe('CivilServiceDashboardTask', () => {
  it('should assign all constructor fields', () => {
    const task = new CivilServiceDashboardTask(
      'task-1',
      'Category EN',
      'Category CY',
      'Task EN',
      'Task CY',
      DashboardTaskStatus.ACTION_NEEDED,
      'Angen gweithredu',
      'Hint EN',
      'Hint CY',
    );

    expect(task.id).toBe('task-1');
    expect(task.categoryEn).toBe('Category EN');
    expect(task.categoryCy).toBe('Category CY');
    expect(task.taskNameEn).toBe('Task EN');
    expect(task.taskNameCy).toBe('Task CY');
    expect(task.currentStatusEn).toBe(DashboardTaskStatus.ACTION_NEEDED);
    expect(task.currentStatusCy).toBe('Angen gweithredu');
    expect(task.hintTextEn).toBe('Hint EN');
    expect(task.hintTextCy).toBe('Hint CY');
  });
});
