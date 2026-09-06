import React, { useEffect, useState } from 'react';
import { FileText, Shield, Loader2 } from 'lucide-react';
import { AuditLog } from '../../types';
import { getAuditLogs } from '../../firebase/services';
import { formatDateTime } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

export const AdminAuditLogs: React.FC = () => {
  const { role } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const data = await getAuditLogs();
        setLogs(data);
      } catch (err) {
        console.warn('Audit logs load error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  if (role !== 'super_admin') {
    return (
      <div className="bg-white p-8 rounded-3xl border border-gold-200 text-center space-y-3">
        <Shield className="w-10 h-10 text-rose-600 mx-auto" />
        <h2 className="text-xl font-serif font-bold text-burgundy">Super Admin Access Only</h2>
        <p className="text-xs text-charcoal-muted">
          Only Super Administrators can review full system activity audit logs.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gold-200/60 shadow-sm">
        <div>
          <h1 className="text-2xl font-serif font-bold text-burgundy">System Activity & Audit Logs</h1>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Security audit trail tracking staff actions, product changes, order status updates, and settings modifications.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gold-200/60 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-charcoal-muted">
            <Loader2 className="w-8 h-8 text-gold animate-spin mx-auto mb-2" />
            <p>Loading activity logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-xs text-charcoal-muted">No audit activity logged yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-ivory text-burgundy font-bold uppercase tracking-wider border-b border-gold-200">
                <tr>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">Staff User</th>
                  <th className="p-3.5">Action</th>
                  <th className="p-3.5">Target Module</th>
                  <th className="p-3.5">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-sans">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-ivory/50 transition-colors">
                    <td className="p-3.5 font-mono text-gray-500 whitespace-nowrap">
                      {formatDateTime(log.createdAt)}
                    </td>
                    <td className="p-3.5 font-bold text-burgundy">
                      {log.performedBy?.name || log.performedBy?.email || 'System'}
                    </td>
                    <td className="p-3.5">
                      <span className="bg-burgundy/10 text-burgundy font-mono font-bold text-[10px] uppercase px-2 py-0.5 rounded">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3.5 font-medium text-charcoal">{log.targetCollection}</td>
                    <td className="p-3.5 text-gray-600 font-mono text-[11px]">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
