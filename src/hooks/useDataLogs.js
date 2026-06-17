import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useActivityLogs(userId) {
  const [logs,    setLogs]    = useState([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    setLogs(data ?? []);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetch(); }, [fetch]);

  const add = async (entry) => {
    await supabase.from('activity_logs').insert({ ...entry, user_id: userId });
    fetch();
  };

  const remove = async (id) => {
    await supabase.from('activity_logs').delete().eq('id', id);
    fetch();
  };

  const todayLogs = () => {
    const today = new Date().toISOString().split('T')[0];
    return logs.filter(l => l.date === today);
  };

  return { logs, loading, add, remove, todayLogs };
}

export function useWeightLogs(userId) {
  const [weights, setWeights] = useState([]);

  const fetch = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from('weight_logs')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: true });
    setWeights(data ?? []);
  }, [userId]);

  useEffect(() => { fetch(); }, [fetch]);

  const add = async (entry) => {
    await supabase.from('weight_logs').insert({ ...entry, user_id: userId });
    fetch();
  };

  const latest = weights.at(-1)?.weight ?? null;

  return { weights, add, latest };
}
