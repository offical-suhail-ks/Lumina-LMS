import api from './api';

export const listCalendarEvents = async () => {
  try {
    const response = await api.get('/calendar/events');
    return response.data;
  } catch (error) {
    console.error('Error listing calendar events:', error);
    // Return empty array if table doesn't exist yet
    if (error.response?.status === 500) {
      return [];
    }
    throw error;
  }
};

export const getCalendarEventsByDate = async (date) => {
  try {
    const response = await api.get(`/calendar/events/${date}`);
    return response.data;
  } catch (error) {
    console.error('Error getting calendar events by date:', error);
    if (error.response?.status === 500) {
      return [];
    }
    throw error;
  }
};

export const createCalendarEvent = async (event) => {
  try {
    console.log('Sending event to API:', event);
    const response = await api.post('/calendar/events', event);
    console.log('API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating calendar event:', error);
    console.error('Error response:', error.response?.data);
    throw error;
  }
};

export const deleteCalendarEvent = async (eventId) => {
  try {
    const response = await api.delete(`/calendar/events/${eventId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    throw error;
  }
};

