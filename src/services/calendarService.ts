import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useDeadlinesStore } from '../stores/deadlinesStore';

export async function exportCalendarIcs(): Promise<void> {
  const deadlines = useDeadlinesStore.getState().deadlines.filter((d) => !d.completed);
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Nexara//EN',
  ];

  for (const d of deadlines) {
    const due = new Date(d.dueAt);
    const stamp = due.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    lines.push(
      'BEGIN:VEVENT',
      `UID:${d.id}@Nexara.app`,
      `DTSTART:${stamp}`,
      `DTEND:${stamp}`,
      `SUMMARY:${d.title}`,
      `DESCRIPTION:Priority: ${d.priority}`,
      'END:VEVENT',
    );
  }

  lines.push('END:VCALENDAR');
  const path = `${FileSystem.cacheDirectory ?? FileSystem.documentDirectory}Nexara.ics`;
  await FileSystem.writeAsStringAsync(path, lines.join('\r\n'));
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(path, { mimeType: 'text/calendar', dialogTitle: 'Export to Calendar' });
  }
}
