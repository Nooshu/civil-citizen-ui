import {Dashboard} from 'models/dashboard/dashboard';
import {DashboardTaskList} from 'models/dashboard/taskList/dashboardTaskList';

describe('Dashboard', () => {
  it('should retain supplied task list items', () => {
    const items = [{} as DashboardTaskList];
    expect(new Dashboard(items).items).toBe(items);
  });

  it('should default to an empty list when items are absent', () => {
    const dashboard = new Dashboard(undefined as unknown as DashboardTaskList[]);
    expect(dashboard.items).toEqual([]);
  });
});
