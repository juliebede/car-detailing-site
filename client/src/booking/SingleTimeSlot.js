import React from 'react';

export default function SingleTimeSlot({ start, end }) {
  const formattedStart = Number(start) % 1 === 0.5 ? `${Number(start) - 0.5}:30` : `${Number(start)}:00`;
  const formattedEnd = Number(end) % 1 === 0.5 ? `${Number(end) - 0.5}:30` : `${Number(end)}:00`;
  return (
    <button>
      {formattedStart} to {formattedEnd}
    </button>
  )
}