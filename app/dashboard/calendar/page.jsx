'use client';

import { useState } from 'react';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2024, 4, 1)); // May 2024

  const events = [
    { date: 5, title: 'Field visit', color: 'green' },
    { date: 5, title: 'Training', color: 'amber' },
    { date: 10, title: 'Budget review', color: 'blue' },
    { date: 15, title: 'Donor meeting', color: 'green' },
    { date: 18, title: 'Report due', color: 'red' },
    { date: 22, title: 'Team meeting', color: 'amber' },
  ];

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
    const daysInPrevMonth = getDaysInMonth(prevMonth);
    
    const days = [];
    
    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        day: daysInPrevMonth - i,
        isCurrentMonth: false,
        date: new Date(prevMonth.getFullYear(), prevMonth.getMonth(), daysInPrevMonth - i),
      });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(currentDate.getFullYear(), currentDate.getMonth(), i),
      });
    }
    
    // Next month days
    const remainingDays = 42 - days.length; // 6 rows × 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i),
      });
    }
    
    return days;
  };

  const getEventsForDay = (day) => {
    return events.filter(e => e.date === day);
  };

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const monthYear = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const days = generateCalendarDays();

  return (
    <>
      <div className="page-header">
        <h1>Calendar</h1>
        <p>View and manage all your events and deadlines.</p>
      </div>

      <div className="cal-grid">
        <div className="cal-main">
          <div className="cal-header">
            <div style={{ fontSize: 16, fontWeight: 600, color: '#111827' }}>{monthYear}</div>
            <div className="cal-nav">
              <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}>
                ← Prev
              </button>
              <button onClick={() => setCurrentDate(new Date())}>
                Today
              </button>
              <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}>
                Next →
              </button>
            </div>
          </div>

          <div className="cal-days-head">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          <div className="cal-days">
            {days.map((day, idx) => (
              <div
                key={idx}
                className={`cal-day ${day.isCurrentMonth ? '' : 'other-month'} ${isToday(day.date) ? 'today' : ''}`}
              >
                <div className="cal-day-num">{day.day}</div>
                {day.isCurrentMonth && getEventsForDay(day.day).map((event, i) => (
                  <div key={i} className={`cal-event ${event.color}`}>
                    {event.title}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="upcoming-events">
          <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 12 }}>
            Upcoming Events
          </div>
          {events.map((event, idx) => (
            <div key={idx} className="event-item">
              <div className={`event-dot`} style={{ background: event.color === 'green' ? '#1a6b3c' : event.color === 'amber' ? '#f59e0b' : event.color === 'blue' ? '#3b82f6' : '#ef4444' }} />
              <div className="event-body">
                <div className="ev-title">{event.title}</div>
                <div className="ev-date">May {event.date}, 2024</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
