import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  FileSearch,
  ShieldCheck,
  Download,
  AlertTriangle,
  Lock,
  Search,
  Filter,
  CheckCircle,
  Clock,
  ShieldAlert
} from 'lucide-react';

export const AuditorPanel: React.FC = () => {
  const { auditLogs, currentUser } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterTarget, setFilterTarget] = useState<string>('all');
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const filteredLogs = auditLogs.filter(log => {
    const matchSearch =
      log.actorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.targetId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchSeverity = filterSeverity === 'all' || log.severity === filterSeverity;
    const matchTarget = filterTarget === 'all' || log.targetType === filterTarget;

    return matchSearch && matchSeverity && matchTarget;
  });

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `hizlisepet_audit_trail_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setExportNotice('Denetim kayıtları JSON formatında başarıyla dışa aktarıldı.');
    setTimeout(() => setExportNotice(null), 3000);
  };

  const handleExportCsv = () => {
    const headers = ['ID', 'Timestamp', 'Actor ID', 'Actor Name', 'Role', 'Action', 'Target Type', 'Target ID', 'Details', 'IP Address', 'Severity'];
    const rows = auditLogs.map(l => [
      l.id,
      l.timestamp,
      l.actorId,
      `"${l.actorName}"`,
      l.actorRole,
      l.action,
      l.targetType,
      l.targetId,
      `"${l.details.replace(/"/g, '""')}"`,
      l.ipAddress,
      l.severity
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `hizlisepet_denetim_raporu_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();

    setExportNotice('Denetim raporu CSV formatında başarıyla dışa aktarıldı.');
    setTimeout(() => setExportNotice(null), 3000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col text-slate-800">
      {/* Header */}
      <div className="p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center font-bold">
            <FileSearch className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">Bağımsız Denetim & Uyumluluk Masası (Audit Trail)</h2>
              <span className="text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded font-mono font-bold border border-teal-500/30">
                SALT OKUNUR (IMMUTABLE)
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Denetçi: {currentUser.name} ({currentUser.role}) · Kayıtlar silinemez, düzenlenemez
            </p>
          </div>
        </div>

        {/* Export Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold border border-slate-700"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV İndir</span>
          </button>
          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold"
          >
            <Download className="w-3.5 h-3.5" />
            <span>JSON İhracı</span>
          </button>
        </div>
      </div>

      {exportNotice && (
        <div className="p-3 bg-teal-50 text-teal-800 border-b border-teal-200 text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-teal-600" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Role Authority Indicator Strip */}
      <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-slate-500" />
          <span>
            <b>Denetim Yetki Matrisi:</b> Market/Kurye Onaylama: <b className="text-red-600">YASAK</b> · İade/Komisyon Değiştirme: <b className="text-red-600">YASAK</b> · Kayıt Silme: <b className="text-red-600">İMKANSIZ</b>
          </span>
        </div>
        <div className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
          SHA-256 İmzalı Log Blokları Aktif
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs bg-white">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="İşlem, kullanıcı, açıklama veya ID ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-teal-500 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-semibold">Önem:</span>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white outline-none focus:border-teal-500 font-medium"
            >
              <option value="all">Tümü</option>
              <option value="info">Bilgi (Normal)</option>
              <option value="warning">Uyarı</option>
              <option value="security_alert">Güvenlik Alarmı</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-semibold">Hedef Türü:</span>
            <select
              value={filterTarget}
              onChange={(e) => setFilterTarget(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white outline-none focus:border-teal-500 font-medium"
            >
              <option value="all">Tümü</option>
              <option value="store">Market İşlemleri</option>
              <option value="courier">Kurye İşlemleri</option>
              <option value="order">Sipariş & İade</option>
              <option value="commission">Komisyon</option>
              <option value="security">Güvenlik & Erişim</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="p-4 flex-1 overflow-y-auto min-h-[460px]">
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-100 text-slate-600 uppercase font-bold text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Zaman</th>
                <th className="py-2.5 px-3">İşlemi Yapan Hesap</th>
                <th className="py-2.5 px-3">Eylem (Action)</th>
                <th className="py-2.5 px-3">Hedef & Detay</th>
                <th className="py-2.5 px-3">IP Adresi</th>
                <th className="py-2.5 px-3 text-right">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                    {log.timestamp}
                  </td>

                  <td className="py-2.5 px-3">
                    <div className="font-bold text-slate-900 font-sans">{log.actorName}</div>
                    <span className="text-[10px] text-slate-400 uppercase">
                      {log.actorRole}
                    </span>
                  </td>

                  <td className="py-2.5 px-3 font-bold text-teal-800">
                    {log.action}
                  </td>

                  <td className="py-2.5 px-3 font-sans max-w-xs">
                    <div className="text-slate-800">{log.details}</div>
                    <span className="text-[10px] font-mono text-slate-400">
                      ID: {log.targetId} ({log.targetType})
                    </span>
                  </td>

                  <td className="py-2.5 px-3 text-slate-500">
                    {log.ipAddress}
                  </td>

                  <td className="py-2.5 px-3 text-right">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.severity === 'security_alert'
                          ? 'bg-red-100 text-red-800 border border-red-300'
                          : log.severity === 'warning'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {log.severity === 'security_alert' ? 'ALARM' : log.severity === 'warning' ? 'UYARI' : 'BİLGİ'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
