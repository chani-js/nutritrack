import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useFoodLogs(userId) {
  const [logs,    setLogs]    = useState([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data } = await supabase
      .from('food_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    setLogs(data ?? []);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetch(); }, [fetch]);

  const add = async (entry) => {
    await supabase.from('food_logs').insert({ ...entry, user_id: userId });
    fetch();
  };

  const addMany = async (entries) => {
    await supabase.from('food_logs').insert(entries.map(e => ({ ...e, user_id: userId })));
    fetch();
  };

  const remove = async (id) => {
    await supabase.from('food_logs').delete().eq('id', id);
    fetch();
  };

  const todayLogs = () => {
    const today = new Date().toISOString().split('T')[0];
    return logs.filter(l => l.date === today);
  };

  return { logs, loading, add, addMany, remove, todayLogs, refresh: fetch };
}
