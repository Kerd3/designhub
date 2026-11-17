import { useCallback, useEffect, useMemo, useState } from 'react';
import { inquiryService } from '@/services/inquiryService.js';
import { taskService } from '@/services/taskService.js';
import { dashboardService } from '@/services/dashboardService.js';
import { daysUntil, relativeDue } from '@/utils/format.js';

const READ_KEY = 'designhub.notifications.read';

function loadRead() {
  try {
    return new Set(JSON.parse(window.localStorage.getItem(READ_KEY) ?? '[]'));
  } catch {
    return new Set();
  }
}

/**
 * Notifications derived from live data, filtered by the user's notification
 * preferences: new inquiries, tasks due within three days (or overdue) and
 * recent activity. Read state is remembered per browser.
 */
export function useNotifications(preferences, refreshKey) {
  const [raw, setRaw] = useState({ inquiries: [], tasks: [], activities: [] });
  const [status, setStatus] = useState('loading');
  const [read, setRead] = useState(loadRead);

  useEffect(() => {
    const controller = new AbortController();
    const opts = { signal: controller.signal };
    Promise.all([inquiryService.list(opts), taskService.list(opts), dashboardService.getActivity(opts)])
      .then(([inquiries, tasks, activities]) => {
        setRaw({ inquiries, tasks, activities });
        setStatus('success');
      })
      .catch((error) => {
        if (error.name !== 'AbortError') setStatus('error');
      });
    return () => controller.abort();
  }, [refreshKey]);

  const items = useMemo(() => {
    const list = [];
    if (preferences.inquiries) {
      raw.inquiries.filter((i) => i.status === 'new').forEach((i) =>
        list.push({ id: `inq-${i.id}`, kind: 'inquiry', title: `New inquiry from ${i.company || i.name}`, detail: i.projectType, at: i.submittedAt, to: `/workspace/inquiries?open=${i.id}` }),
      );
    }
    if (preferences.taskDue) {
      raw.tasks.filter((t) => t.status !== 'completed' && daysUntil(t.dueDate) <= 3).forEach((t) =>
        list.push({ id: `task-${t.id}-${t.dueDate}`, kind: 'task', title: t.title, detail: relativeDue(t.dueDate), at: `${t.dueDate}T09:00:00`, to: `/workspace/tasks?open=${t.id}` }),
      );
    }
    if (preferences.activity) {
      // Skip activity about records already listed above, so nothing appears twice.
      const listed = new Set(list.map((item) => item.id.split('-').slice(1, 3).join('-')));
      raw.activities.filter((a) => !listed.has(a.entityId)).slice(0, 5).forEach((a) =>
        list.push({ id: `act-${a.id}`, kind: 'activity', title: a.message, detail: a.actor, at: a.at, to: null }),
      );
    }
    return list
      .sort((a, b) => String(b.at).localeCompare(String(a.at)))
      // Only actionable items (inquiries, due tasks) count as unread; activity is context.
      .map((item) => ({ ...item, unread: item.kind !== 'activity' && !read.has(item.id) }));
  }, [raw, preferences, read]);

  const markAllRead = useCallback(() => {
    setRead((prev) => {
      const next = new Set([...prev, ...items.map((i) => i.id)]);
      try {
        window.localStorage.setItem(READ_KEY, JSON.stringify([...next]));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, [items]);

  return { items, status, unreadCount: items.filter((i) => i.unread).length, markAllRead };
}
