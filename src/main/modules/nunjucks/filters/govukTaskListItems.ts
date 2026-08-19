import {Task} from 'models/taskList/task';
import {TaskStatus} from 'models/taskList/TaskStatus';
import {DashboardTask} from 'models/dashboard/taskList/dashboardTask';

export interface GovukTaskListItem {
  title: {text?: string; html?: string};
  href?: string;
  hint?: {text: string};
  classes: string;
  status: {
    tag: {
      text: string;
      classes: string;
    };
  };
}

/**
 * Maps claim/response {@link Task} rows to official govukTaskList `items`.
 *
 * @param tasks - Section tasks from the journey task-list builders
 * @param translate - Nunjucks `t()` (i18next)
 * @returns Items for `govukTaskList({ items })`
 * @remarks
 * Adds `app-task-list__item` so existing Codecept locators still match.
 * Omits `href` when the task cannot be started or has no URL.
 */
export function toGovukTaskListItems(
  tasks: Task[] | undefined,
  translate: (key: string) => string,
): GovukTaskListItem[] {
  if (!tasks?.length) {
    return [];
  }
  return tasks.map((task) => {
    const canLink = Boolean(task.url)
      && task.status !== TaskStatus.NOT_AVAILABLE_YET
      && task.status !== TaskStatus.DONE_NO_URL;
    const tagClasses = task.statusColor
      || (task.status === TaskStatus.INCOMPLETE ? 'govuk-tag--grey' : '');
    const item: GovukTaskListItem = {
      title: {text: translate(task.description)},
      classes: 'app-task-list__item',
      status: {
        tag: {
          text: translate('PAGES.TASK_LIST.' + task.status),
          classes: tagClasses,
        },
      },
    };
    if (canLink) {
      item.href = task.url;
    }
    return item;
  });
}

/**
 * Maps CCD dashboard {@link DashboardTask} rows to official govukTaskList `items`.
 *
 * @param tasks - Tasks already interpolated with HTML names
 * @param lang - Active language (`cy` or English)
 * @returns Items for `govukTaskList({ items })`
 * @remarks
 * Task names are HTML (often already containing `govuk-link`). Do not set `href`
 * or the Design System would wrap a second link around the name.
 */
export function toDashboardGovukTaskListItems(
  tasks: DashboardTask[] | undefined,
  lang: string,
): GovukTaskListItem[] {
  if (!tasks?.length) {
    return [];
  }
  const welsh = lang === 'cy';
  return tasks.map((task) => {
    const hintText = welsh ? task.hintTextCy : task.hintTextEn;
    const item: GovukTaskListItem = {
      title: {html: (welsh ? task.taskNameCy : task.taskNameEn) || ''},
      classes: 'app-task-list__item',
      status: {
        tag: {
          text: (welsh ? task.statusCy : task.statusEn) || '',
          classes: task.statusColour || '',
        },
      },
    };
    if (hintText) {
      item.hint = {text: hintText};
    }
    return item;
  });
}
