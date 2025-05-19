import React from 'react';
import { useNotifications } from '@/context/NotificationContext';
import { NotificationCenter } from './NotificationCenter';

export default function NotificationBell() {
  return (
    <NotificationCenter />
  );
}