export function formatDate(dateStr, locale = 'en-US') {
    const date = new Date(dateStr);
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
  
  export function formatTime(dateStr, locale = 'en-US') {
    const date = new Date(dateStr);
    return date.toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  