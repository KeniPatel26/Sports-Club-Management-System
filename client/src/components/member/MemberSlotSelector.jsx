import React, { useState } from 'react';
import { Calendar, Clock, Check, ArrowLeft, ArrowRight, ShieldCheck, Zap, AlertCircle } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Loader from '../ui/Loader';
import Badge from '../ui/Badge';

export const MemberSlotSelector = ({
  selectedCourt,
  selectedDate,
  onDateChange,
  slots = [],
  loading = false,
  selectedSlotTime,
  onSelectSlot,
  onBack,
  onContinue,
}) => {
  const [timeOfDayFilter, setTimeOfDayFilter] = useState('ALL');

  const getQuickDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 5; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const dayLabel = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dates.push({ iso, label: dayLabel, dateStr });
    }
    return dates;
  };

  const quickDates = getQuickDates();

  // STRICT REQUIREMENT: Only show AVAILABLE slots in the grid (no booked or unavailable slots)
  const availableOnlySlots = slots.filter((s) => s.available);

  // Optional time-of-day filtering
  const filteredAvailableSlots = availableOnlySlots.filter((slot) => {
    const hour = parseInt(slot.time.split(':')[0], 10);
    if (timeOfDayFilter === 'MORNING') return hour < 12;
    if (timeOfDayFilter === 'AFTERNOON') return hour >= 12 && hour < 17;
    if (timeOfDayFilter === 'EVENING') return hour >= 17;
    return true;
  });

  return (
    <Card>
      <Card.Header style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Card.Title>{selectedCourt ? selectedCourt.name : 'Pick Session Timeslot'}</Card.Title>
            {selectedCourt && <Badge variant="info">{selectedCourt.type}</Badge>}
          </div>
          <Card.Description>Only showing currently available open slots. Select any date to view slots.</Card.Description>
        </div>

        {/* Date Selector: Quick Pills + Native Calendar Picker for Any Date */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          {quickDates.map((item) => {
            const isActive = selectedDate === item.iso;
            return (
              <button
                key={item.iso}
                type="button"
                onClick={() => onDateChange(item.iso)}
                style={{
                  padding: '0.4rem 0.8rem',
                  borderRadius: 'var(--radius-md)',
                  border: isActive ? '1px solid var(--secondary)' : '1px solid var(--border-color)',
                  backgroundColor: isActive ? 'var(--secondary)' : 'var(--bg-card)',
                  color: isActive ? '#FFFFFF' : 'var(--text-main)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                }}
              >
                {item.label} ({item.dateStr})
              </button>
            );
          })}

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', position: 'relative' }}>
            <input
              type="date"
              id="court-date-picker"
              value={selectedDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => onDateChange(e.target.value)}
              style={{
                padding: '0.4rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--bg-input)',
                color: 'var(--color-text-primary)',
                fontSize: '0.825rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            />
          </div>
        </div>
      </Card.Header>

      <Card.Content>
        {/* Time of Day Filter Pills */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
            marginBottom: '1.25rem',
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: '0.85rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Filter Time:</span>
            {[
              { id: 'ALL', label: 'All Slots' },
              { id: 'MORNING', label: 'Morning (6 AM - 12 PM)' },
              { id: 'AFTERNOON', label: 'Afternoon (12 PM - 5 PM)' },
              { id: 'EVENING', label: 'Evening (5 PM - 10 PM)' },
            ].map((period) => (
              <button
                key={period.id}
                type="button"
                onClick={() => setTimeOfDayFilter(period.id)}
                style={{
                  padding: '0.3rem 0.65rem',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid',
                  borderColor: timeOfDayFilter === period.id ? 'var(--primary)' : 'var(--border-color)',
                  backgroundColor: timeOfDayFilter === period.id ? 'var(--primary-light)' : 'var(--bg-card)',
                  color: timeOfDayFilter === period.id ? 'var(--primary)' : 'var(--text-muted)',
                  fontSize: '0.775rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                }}
              >
                {period.label}
              </button>
            ))}
          </div>

          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {filteredAvailableSlots.length} Available Slots Open
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '3.5rem 0' }}>
            <Loader text="Loading live available court timetable..." />
          </div>
        ) : filteredAvailableSlots.length === 0 ? (
          <div
            style={{
              padding: '3rem 1.5rem',
              textAlign: 'center',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-lg)',
              border: '1px dashed var(--border-color)',
            }}
          >
            <AlertCircle size={36} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem auto' }} />
            <h4 style={{ margin: '0 0 0.4rem 0', fontWeight: 700, color: 'var(--color-primary)' }}>
              No Available Slots for {selectedDate}
            </h4>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              All slots on this date are fully reserved. Please pick another date or choose a different court.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
              gap: '0.75rem',
              marginBottom: '1.5rem',
            }}
          >
            {filteredAvailableSlots.map((slot) => {
              const isSelected = selectedSlotTime === slot.time;
              const [h, m] = slot.time.split(':').map(Number);
              const endH = (h + 1).toString().padStart(2, '0');
              const endStr = `${endH}:${m === 0 ? '00' : m}`;

              return (
                <div
                  key={slot.time}
                  onClick={() => onSelectSlot(slot.time)}
                  style={{
                    padding: '0.85rem 0.6rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: isSelected ? 'var(--color-primary)' : 'var(--court-available-bg)',
                    border: isSelected
                      ? '2px solid var(--color-primary)'
                      : '1px solid rgba(168, 192, 172, 0.5)',
                    color: isSelected ? '#FFFFFF' : 'var(--court-available-text)',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'var(--transition)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.4rem',
                    boxShadow: isSelected ? 'var(--shadow-md)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={14} color={isSelected ? '#FFFFFF' : 'var(--court-available-text)'} />
                    <span style={{ fontWeight: 800, fontSize: '1rem' }}>{slot.time}</span>
                  </div>

                  <span
                    style={{
                      fontSize: '0.725rem',
                      opacity: 0.9,
                      fontWeight: 500,
                    }}
                  >
                    to {endStr} (60m)
                  </span>

                  <div
                    style={{
                      marginTop: '0.2rem',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : 'rgba(82, 118, 91, 0.15)',
                      color: isSelected ? '#FFFFFF' : 'var(--court-available-text)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                    }}
                  >
                    {isSelected ? (
                      <>
                        <Check size={11} /> Selected Slot
                      </>
                    ) : (
                      'Available'
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Step Navigation Actions */}
        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Button variant="outline" onClick={onBack}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <ArrowLeft size={16} /> Back to Courts
            </span>
          </Button>

          <Button
            variant="primary"
            disabled={!selectedSlotTime || filteredAvailableSlots.length === 0}
            onClick={onContinue}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              Review & Submit Booking <ArrowRight size={16} />
            </span>
          </Button>
        </div>
      </Card.Content>
    </Card>
  );
};

export default MemberSlotSelector;
