export function formatRelativeTime(date: Date) {
    const now = new Date();
    const seconds = Math.round((date.getTime() - now.getTime()) / 1000);
  
    const rtf = new Intl.RelativeTimeFormat(undefined, { style: 'short', numeric: 'auto' });
  
    if (Math.abs(seconds) < 60) {
      return rtf.format(seconds, 'seconds');
    }
  
    const minutes = Math.round(seconds / 60);
    if (Math.abs(minutes) < 60) {
      return rtf.format(minutes, 'minutes');
    }
  
    const hours = Math.round(minutes / 60);
    if (Math.abs(hours) < 24) {
      return rtf.format(hours, 'hours');
    }
  
    const days = Math.round(hours / 24);
    if (Math.abs(days) < 30) {
      return rtf.format(days, 'days');
    }
  
    const months = Math.round(days / 30);
    if (Math.abs(months) < 12) {
      return rtf.format(months, 'months');
    }
  
    const years = Math.round(months / 12);
    return rtf.format(years, 'years');
  }
