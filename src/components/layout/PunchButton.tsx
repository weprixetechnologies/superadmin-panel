"use client";

import React, { useState, useEffect } from 'react';
import { Fingerprint, LogOut } from 'lucide-react';
import api from '@/utils/axiosInstance';

export default function PunchButton() {
  const [loading, setLoading] = useState(false);
  const [isPunchedIn, setIsPunchedIn] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await api.get(`/attendance/me?from_date=${today}&to_date=${today}`);
      const records = res.data?.data || [];
      if (records.length > 0) {
        const todayRecord = records[0];
        if (todayRecord.punch_in_at && !todayRecord.punch_out_at) {
          setIsPunchedIn(true);
        } else {
          setIsPunchedIn(false);
        }
      }
    } catch (error) {
      console.error('Failed to check punch status', error);
    }
  };

  const handlePunch = async () => {
    try {
      setLoading(true);
      if (isPunchedIn) {
        await api.post('/attendance/punch-out');
        alert('Punched out successfully');
        setIsPunchedIn(false);
      } else {
        await api.post('/attendance/punch-in');
        alert('Punched in successfully');
        setIsPunchedIn(true);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to record punch');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePunch}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
        isPunchedIn 
          ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200' 
          : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-600/20'
      } disabled:opacity-50`}
    >
      {isPunchedIn ? <LogOut className="w-4 h-4" /> : <Fingerprint className="w-4 h-4" />}
      {loading ? 'Processing...' : isPunchedIn ? 'Punch Out' : 'Punch In'}
    </button>
  );
}
