import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Database, Table as TableIcon, Code, Play, AlertTriangle, Plus, Trash2, Pencil, X, HardDrive, Server, Layers, BarChart3, RefreshCw, ChevronLeft, ChevronRight, Save } from 'lucide-react';
import { DatabaseDB } from '../../utils/storage';

interface Stats {
  totalTables: number;
  totalRows: number;
  dbSizeMB: string;
  activeConnections: number;
  connectionDetails: any[];
  tableStats: { table: string; rows: number }[];
}

export default function AdminDatabase() {
  const [tables, setTables] = useState<string[]>([]);
  const [activeTable, setActiveTable] = useState<string | null>(null);
  const [schema, setSchema] = useState<any[]>([]);
  const [tableData, setTableData] = useState<any[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(25);
  const [stats, setStats] = useState<Stats | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRowData, setNewRowData] = useState<Record<string, string>>({});
  const [addLoading, setAddLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editRow, setEditRow] = useState<any>(null);
  const [editData, setEditData] = useState<Record<string, string>>({});
  const [editLoading, setEditLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [queryResult, setQueryResult] = useState<any>(null);
  const [queryError, setQueryError] = useState('');
  const [queryLoading, setQueryLoading] = useState(false);
  const [showQueryRunner, setShowQueryRunner] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [showConnectionsModal, setShowConnectionsModal] = useState(false);
  const [showTablesModal, setShowTablesModal] = useState(false);
  const [viewRow, setViewRow] = useState<any>(null);

  useEffect(() => { loadTables(); loadStats(); }, []);

  useEffect(() => {
    if (showAddModal || editRow || showConnectionsModal || showTablesModal || viewRow) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [showAddModal, editRow, showConnectionsModal, showTablesModal, viewRow]);

  const loadStats = async () => { try { setStats(await DatabaseDB.getStats()); } catch (e) { console.error(e); } };

  const loadTables = async () => {
    try {
      const data = await DatabaseDB.getTables();
      setTables(data);
      if (data.length > 0) selectTable(data[0]);
    } catch (e) { console.error(e); }
  };

  const selectTable = async (t: string) => {
    setActiveTable(t); setCurrentPage(1); setEditRow(null); setDeleteId(null);
    setSchema(await DatabaseDB.getSchema(t));
    await loadTableData(t, 1);
  };

  const loadTableData = async (t: string, page: number) => {
    setDataLoading(true);
    try { const r = await DatabaseDB.getData(t, page, pageSize); setTableData(r.rows || []); setTotalRows(r.total || 0); setCurrentPage(page); }
    catch (e) { console.error(e); } finally { setDataLoading(false); }
  };

  const handleDelete = async (id: number) => {
    if (!activeTable) return;
    try { await DatabaseDB.deleteRow(activeTable, id); await loadTableData(activeTable, currentPage); loadStats(); setDeleteId(null); }
    catch (e) { console.error(e); }
  };

  const openAddModal = () => {
    const defaults: Record<string, string> = {};
    schema.forEach(col => {
      if (col.Extra === 'auto_increment' || col.Extra?.includes('DEFAULT_GENERATED')) return;
      defaults[col.Field] = '';
    });
    setNewRowData(defaults); setShowAddModal(true);
  };

  const handleAddRow = async () => {
    if (!activeTable) return;
    setAddLoading(true);
    try {
      const filtered: Record<string, any> = {};
      Object.entries(newRowData).forEach(([k, v]) => { if (v !== '') filtered[k] = v; });
      await DatabaseDB.insertRow(activeTable, filtered);
      setShowAddModal(false); await loadTableData(activeTable, 1); loadStats();
    } catch (e) { console.error(e); alert('Failed to insert row.'); }
    finally { setAddLoading(false); }
  };

  const openEditModal = (row: any) => {
    const data: Record<string, string> = {};
    schema.forEach(col => {
      if (col.Extra === 'auto_increment') return;
      data[col.Field] = row[col.Field] !== null && row[col.Field] !== undefined ? String(row[col.Field]) : '';
    });
    setEditData(data); setEditRow(row);
  };

  const handleEditRow = async () => {
    if (!activeTable || !editRow) return;
    setEditLoading(true);
    try {
      const changes: Record<string, any> = {};
      Object.entries(editData).forEach(([k, v]) => { changes[k] = v === '' ? null : v; });
      await DatabaseDB.updateRow(activeTable, editRow.id, changes);
      setEditRow(null); await loadTableData(activeTable, currentPage); loadStats();
    } catch (e) { console.error(e); alert('Failed to update row.'); }
    finally { setEditLoading(false); }
  };

  const handleRunQuery = async () => {
    if (!query.trim()) return;
    setQueryLoading(true); setQueryError(''); setQueryResult(null);
    try {
      const data = await DatabaseDB.executeQuery(query);
      setQueryResult(data.result);
      if (activeTable) loadTableData(activeTable, currentPage); loadStats();
    } catch (e: any) { setQueryError(e.message || 'Error'); }
    finally { setQueryLoading(false); }
  };

  const totalPages = Math.ceil(totalRows / pageSize);
  const truncate = (val: any, max = 45) => {
    if (val === null || val === undefined) return null;
    const s = String(val);
    return s.length > max ? s.substring(0, max) + '…' : s;
  };

  // Build field editor used in both Add and Edit modals
  const renderFieldEditor = (fields: Record<string, string>, setFields: (fn: (prev: Record<string, string>) => Record<string, string>) => void) => (
    <div className="flex-1 overflow-y-auto p-5 space-y-3">
      {Object.keys(fields).map(field => {
        const col = schema.find(c => c.Field === field);
        const isTextArea = col?.Type?.includes('text') || col?.Type?.includes('longtext');
        return (
          <div key={field}>
            <label className="flex items-center gap-2 text-xs text-white/50 mb-1">
              <span className="font-bold text-white/70">{field}</span>
              <span className="text-[10px] text-white/25 font-mono">{col?.Type}</span>
            </label>
            {isTextArea ? (
              <textarea value={fields[field]} onChange={e => setFields(p => ({ ...p, [field]: e.target.value }))} placeholder={`Enter ${field}...`}
                className="w-full h-20 bg-black/50 border border-white/10 rounded-xl p-3 text-sm text-white/80 focus:border-gold/50 focus:ring-1 focus:ring-gold/50 outline-none resize-none transition-all" />
            ) : (
              <input type="text" value={fields[field]} onChange={e => setFields(p => ({ ...p, [field]: e.target.value }))} placeholder={`Enter ${field}...`}
                className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm text-white/80 focus:border-gold/50 focus:ring-1 focus:ring-gold/50 outline-none transition-all" />
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Database className="w-6 h-6 text-gold" /> Database Manager
        </h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowQueryRunner(!showQueryRunner)}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all border ${showQueryRunner ? 'bg-gold/10 text-gold border-gold/20' : 'bg-white/5 text-white/50 border-white/10 hover:text-white hover:bg-white/10'}`}>
            <Code className="w-3.5 h-3.5" /> SQL Console
          </button>
          <button onClick={() => { loadStats(); if (activeTable) loadTableData(activeTable, currentPage); }}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 text-xs font-bold rounded-lg transition-all">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards & Animated Storage */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Animated Storage Card */}
          <div className="glass-card rounded-2xl p-6 lg:col-span-2 relative overflow-hidden">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />
            
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                  <HardDrive className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Database Storage</h3>
                  <p className="text-white/50 text-xs">Capacity and current usage</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-white">{stats.dbSizeMB} <span className="text-sm text-white/50">MB</span></p>
                <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Used of 5120 MB</p>
              </div>
            </div>

            <div className="relative h-4 bg-white/5 rounded-full overflow-hidden mb-2 z-10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(1, (parseFloat(stats.dbSizeMB) / 5120) * 100)}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full"
              />
            </div>
            <div className="flex justify-between text-[10px] text-white/40 font-mono z-10 relative">
              <span>0 MB</span>
              <span>{(parseFloat(stats.dbSizeMB) / 5120 * 100).toFixed(2)}% Used</span>
              <span>5.0 GB</span>
            </div>
          </div>

          {/* Other Stats Grid */}
          <div className="grid grid-cols-2 gap-4 lg:col-span-1">
            <div onClick={() => setShowTablesModal(true)} className="glass-card rounded-2xl p-5 flex flex-col justify-center cursor-pointer hover:bg-white/5 hover:border-white/20 transition-all group">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform"><Layers className="w-4 h-4 text-blue-400" /></div>
                <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold group-hover:text-blue-400/70 transition-colors">Tables</p>
              </div>
              <p className="text-2xl font-black text-white">{stats.totalTables}</p>
            </div>
            <div onClick={() => setShowTablesModal(true)} className="glass-card rounded-2xl p-5 flex flex-col justify-center cursor-pointer hover:bg-white/5 hover:border-white/20 transition-all group">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-xl bg-green-500/10 flex items-center justify-center group-hover:scale-110 transition-transform"><BarChart3 className="w-4 h-4 text-green-400" /></div>
                <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold group-hover:text-green-400/70 transition-colors">Rows</p>
              </div>
              <p className="text-2xl font-black text-white">{stats.totalRows.toLocaleString()}</p>
            </div>
            <div onClick={() => setShowConnectionsModal(true)} className="glass-card rounded-2xl p-5 col-span-2 flex justify-between items-center cursor-pointer hover:bg-white/5 hover:border-white/20 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gold/10 flex items-center justify-center"><Server className="w-4 h-4 text-gold" /></div>
                <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Connections</p>
              </div>
              <p className="text-xl font-black text-white">{stats.activeConnections}</p>
            </div>
          </div>
        </div>
      )}

      {/* Per-table row count bar */}
      {stats && (
        <div className="glass-card rounded-2xl p-5">
          <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-3">Rows Per Table</p>
          <div className="space-y-2">
            {stats.tableStats.map(ts => {
              const pct = stats.totalRows > 0 ? (ts.rows / stats.totalRows) * 100 : 0;
              return (
                <div key={ts.table} className="flex items-center gap-3">
                  <span className="text-xs text-white/60 w-28 truncate font-mono">{ts.table}</span>
                  <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-gold-dark to-gold rounded-full transition-all" style={{ width: `${Math.max(pct, 1)}%` }} />
                  </div>
                  <span className="text-xs text-white/40 w-12 text-right font-mono">{ts.rows}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SQL Query Runner (Collapsible) */}
      {showQueryRunner && (
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-sm font-black text-white/50 uppercase tracking-widest mb-4 flex items-center gap-2"><Code className="w-4 h-4" /> Execute SQL Query</h2>
          <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl mb-4 flex gap-3 text-red-400">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed"><strong>Warning:</strong> Full write access to production database.</p>
          </div>
          <textarea value={query} onChange={e => setQuery(e.target.value)} placeholder="SELECT * FROM projects LIMIT 10;"
            className="w-full h-28 bg-black/50 border border-white/10 rounded-xl p-4 text-sm font-mono text-white/80 focus:border-gold/50 outline-none resize-none mb-3" />
          <div className="flex justify-end">
            <button onClick={handleRunQuery} disabled={queryLoading || !query.trim()}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-gold-dark to-gold text-black text-sm font-bold rounded-lg disabled:opacity-50 transition-all">
              {queryLoading ? <span className="animate-spin w-4 h-4 border-2 border-black/20 border-t-black rounded-full" /> : <Play className="w-4 h-4" />} Run Query
            </button>
          </div>
          {queryError && <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-mono">{queryError}</div>}
          {queryResult && (
            <div className="mt-4 border border-white/10 rounded-xl overflow-hidden bg-black/40">
              <div className="p-4 overflow-x-auto max-h-64 overflow-y-auto">
                {Array.isArray(queryResult) && queryResult.length > 0 ? (
                  <table className="text-left text-xs"><thead><tr>
                    {Object.keys(queryResult[0]).map(k => <th key={k} className="p-2 border-b border-white/10 text-white/50">{k}</th>)}
                  </tr></thead><tbody>
                    {queryResult.map((row: any, i: number) => <tr key={i} className="hover:bg-white/5">
                      {Object.values(row).map((v: any, j: number) => <td key={j} className="p-2 border-b border-white/5 text-white/80">{v === null ? <span className="text-white/20">NULL</span> : String(v)}</td>)}
                    </tr>)}
                  </tbody></table>
                ) : <p className="text-white/40 text-xs font-mono">{JSON.stringify(queryResult, null, 2)}</p>}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Sidebar */}
        <div className="glass-card rounded-2xl p-4 lg:col-span-1">
          <h2 className="text-sm font-black text-white/50 uppercase tracking-widest mb-4 flex items-center gap-2"><TableIcon className="w-4 h-4" /> Tables</h2>
          <div className="space-y-1.5">
            {tables.map(table => (
              <button key={table} onClick={() => selectTable(table)}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all ${activeTable === table ? 'bg-gold/10 text-gold font-bold border border-gold/20' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}>
                <span className="flex items-center justify-between">
                  {table}
                  <span className="text-[10px] text-white/25">{stats?.tableStats?.find(s => s.table === table)?.rows ?? ''}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-4 space-y-5">
          {activeTable && (
            <>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="text-lg font-bold text-white">{activeTable}</h2>
                  <p className="text-[11px] text-white/30">{totalRows} rows · Page {currentPage}/{totalPages || 1}</p>
                </div>
                <button onClick={openAddModal}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-500 text-white text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-green-500/20 transition-all active:scale-95">
                  <Plus className="w-4 h-4" /> Add Row
                </button>
              </div>

              {/* Schema (collapsible) */}
              <details className="glass-card rounded-2xl overflow-hidden">
                <summary className="cursor-pointer px-5 py-3 text-[11px] uppercase tracking-widest text-white/40 font-bold hover:text-white/60">Schema — {schema.length} columns</summary>
                <div className="overflow-x-auto border-t border-white/5">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-white/5 text-white/40 text-[10px] uppercase tracking-wider">
                      <tr><th className="p-3">Field</th><th className="p-3">Type</th><th className="p-3">Null</th><th className="p-3">Key</th><th className="p-3">Default</th><th className="p-3">Extra</th></tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {schema.map((col, i) => (
                        <tr key={i}><td className="p-3 text-white font-mono">{col.Field}</td><td className="p-3 text-white/60 font-mono">{col.Type}</td><td className="p-3 text-white/60">{col.Null}</td><td className="p-3 text-white/60">{col.Key}</td><td className="p-3 text-white/60">{col.Default === null ? 'NULL' : col.Default}</td><td className="p-3 text-white/60">{col.Extra}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>

              {/* Table Data */}
              <div className="glass-card rounded-2xl overflow-hidden">
                <div className="overflow-x-auto" style={{ maxHeight: '65vh' }}>
                  {dataLoading ? (
                    <div className="flex items-center justify-center py-20"><span className="animate-spin w-6 h-6 border-2 border-gold/20 border-t-gold rounded-full" /></div>
                  ) : tableData.length === 0 ? (
                    <div className="py-20 text-center text-white/30 text-sm">No data in this table</div>
                  ) : (
                    <table className="w-full text-left text-xs border-collapse" style={{ tableLayout: 'auto' }}>
                      <thead className="bg-black/90 backdrop-blur-md text-[10px] uppercase tracking-wider text-white/40 sticky top-0 z-20">
                        <tr>
                          {Object.keys(tableData[0]).map(key => (
                            <th key={key} className="p-3 font-medium border-b border-white/10 whitespace-nowrap">{key}</th>
                          ))}
                          <th className="p-3 font-medium border-b border-white/10 text-center whitespace-nowrap sticky right-0 bg-[#0d0d0d]">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.04]">
                        {tableData.map((row: any, i: number) => (
                          <tr key={i} onClick={() => setViewRow(row)} className="hover:bg-white/[0.03] group cursor-pointer transition-colors">
                            {Object.values(row).map((val: any, j: number) => (
                              <td key={j} className="p-3 text-white/75 align-top" style={{ maxWidth: '400px', minWidth: '120px' }}
                                title={val !== null ? String(val) : 'NULL'}>
                                {val === null ? (
                                  <span className="text-white/20 italic">NULL</span>
                                ) : (
                                  <div className="line-clamp-2 leading-relaxed whitespace-normal break-words">{String(val)}</div>
                                )}
                              </td>
                            ))}
                            <td className="p-3 sticky right-0 bg-[#0d0d0d]" onClick={e => e.stopPropagation()}>
                              {deleteId === row.id ? (
                                <span className="flex items-center gap-1 justify-center">
                                  <button onClick={() => handleDelete(row.id)} className="px-2.5 py-1 bg-red-500 text-white text-[10px] font-bold rounded-lg">Yes</button>
                                  <button onClick={() => setDeleteId(null)} className="px-2.5 py-1 bg-white/10 text-white/50 text-[10px] font-bold rounded-lg">No</button>
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => openEditModal(row)} className="p-1.5 text-white/30 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all" title="Edit">
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                  <button onClick={() => setDeleteId(row.id)} className="p-1.5 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all" title="Delete">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-5 py-3 border-t border-white/5">
                    <p className="text-[11px] text-white/30">Showing {((currentPage - 1) * pageSize) + 1}–{Math.min(currentPage * pageSize, totalRows)} of {totalRows}</p>
                    <div className="flex items-center gap-1">
                      <button onClick={() => activeTable && loadTableData(activeTable, currentPage - 1)} disabled={currentPage <= 1}
                        className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-30 transition-all"><ChevronLeft className="w-4 h-4" /></button>
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        let page: number;
                        if (totalPages <= 5) page = i + 1;
                        else if (currentPage <= 3) page = i + 1;
                        else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
                        else page = currentPage - 2 + i;
                        return (
                          <button key={page} onClick={() => activeTable && loadTableData(activeTable, page)}
                            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${currentPage === page ? 'bg-gold/20 text-gold' : 'text-white/40 hover:bg-white/10'}`}>{page}</button>
                        );
                      })}
                      <button onClick={() => activeTable && loadTableData(activeTable, currentPage + 1)} disabled={currentPage >= totalPages}
                        className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-30 transition-all"><ChevronRight className="w-4 h-4" /></button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Add Row Modal */}
      {showAddModal && activeTable && (
        <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
          <div className="glass-card rounded-2xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h3 className="text-sm font-bold text-white flex items-center gap-2"><Plus className="w-4 h-4 text-green-400" /> Add Row to <span className="text-gold">{activeTable}</span></h3>
              <button onClick={() => setShowAddModal(false)} className="p-1.5 text-white/30 hover:text-white rounded-lg hover:bg-white/10"><X className="w-4 h-4" /></button>
            </div>
            {renderFieldEditor(newRowData, setNewRowData)}
            <div className="p-5 border-t border-white/10 flex justify-end gap-3">
              <button onClick={() => setShowAddModal(false)} className="px-5 py-2.5 text-sm text-white/40 bg-white/5 hover:bg-white/10 rounded-xl font-bold transition-all">Cancel</button>
              <button onClick={handleAddRow} disabled={addLoading}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-500 text-white text-sm font-bold rounded-xl disabled:opacity-50 transition-all">
                {addLoading ? <span className="animate-spin w-4 h-4 border-2 border-white/20 border-t-white rounded-full" /> : <Plus className="w-4 h-4" />} Insert Row
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Row Modal */}
      {editRow && activeTable && (
        <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4" onClick={() => setEditRow(null)}>
          <div className="glass-card rounded-2xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h3 className="text-sm font-bold text-white flex items-center gap-2"><Pencil className="w-4 h-4 text-blue-400" /> Edit Row #{editRow.id} in <span className="text-gold">{activeTable}</span></h3>
              <button onClick={() => setEditRow(null)} className="p-1.5 text-white/30 hover:text-white rounded-lg hover:bg-white/10"><X className="w-4 h-4" /></button>
            </div>
            {renderFieldEditor(editData, setEditData)}
            <div className="p-5 border-t border-white/10 flex justify-end gap-3">
              <button onClick={() => setEditRow(null)} className="px-5 py-2.5 text-sm text-white/40 bg-white/5 hover:bg-white/10 rounded-xl font-bold transition-all">Cancel</button>
              <button onClick={handleEditRow} disabled={editLoading}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-bold rounded-xl disabled:opacity-50 transition-all">
                {editLoading ? <span className="animate-spin w-4 h-4 border-2 border-white/20 border-t-white rounded-full" /> : <Save className="w-4 h-4" />} Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Connections Modal */}
      {showConnectionsModal && stats && (
        <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4" onClick={() => setShowConnectionsModal(false)}>
          <div className="glass-card rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Server className="w-4 h-4 text-gold" /> Active Database Connections
              </h3>
              <button onClick={() => setShowConnectionsModal(false)} className="p-1.5 text-white/30 hover:text-white rounded-lg hover:bg-white/10 transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-x-auto overflow-y-auto p-5">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-black/90 backdrop-blur-md text-[10px] uppercase tracking-wider text-white/40 sticky top-0 z-20">
                  <tr>
                    <th className="p-3 font-medium border-b border-white/10">ID</th>
                    <th className="p-3 font-medium border-b border-white/10">User</th>
                    <th className="p-3 font-medium border-b border-white/10">Host</th>
                    <th className="p-3 font-medium border-b border-white/10">DB</th>
                    <th className="p-3 font-medium border-b border-white/10">Command</th>
                    <th className="p-3 font-medium border-b border-white/10">Time (s)</th>
                    <th className="p-3 font-medium border-b border-white/10">State</th>
                    <th className="p-3 font-medium border-b border-white/10">Info</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {stats.connectionDetails?.map((conn: any, i: number) => (
                    <tr key={i} className="hover:bg-white/[0.03]">
                      <td className="p-3 text-white/75">{conn.ID}</td>
                      <td className="p-3 text-white/75">{conn.USER}</td>
                      <td className="p-3 text-white/75">{conn.HOST}</td>
                      <td className="p-3 text-white/75">{conn.DB || '-'}</td>
                      <td className="p-3 text-white/75">{conn.COMMAND}</td>
                      <td className="p-3 text-white/75">{conn.TIME}</td>
                      <td className="p-3 text-white/75">{conn.STATE || '-'}</td>
                      <td className="p-3 text-white/50 font-mono truncate max-w-xs" title={conn.INFO}>{conn.INFO ? truncate(conn.INFO, 50) : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!stats.connectionDetails?.length && (
                <div className="py-10 text-center text-white/30 text-sm">No connection details available.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tables Overview Modal */}
      {showTablesModal && stats && (
        <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4" onClick={() => setShowTablesModal(false)}>
          <div className="glass-card rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400" /> Database Tables Overview
              </h3>
              <button onClick={() => setShowTablesModal(false)} className="p-1.5 text-white/30 hover:text-white rounded-lg hover:bg-white/10 transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-x-auto overflow-y-auto p-5">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-black/90 backdrop-blur-md text-[10px] uppercase tracking-wider text-white/40 sticky top-0 z-20">
                  <tr>
                    <th className="p-3 font-medium border-b border-white/10">Table Name</th>
                    <th className="p-3 font-medium border-b border-white/10 text-right">Row Count</th>
                    <th className="p-3 font-medium border-b border-white/10 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {stats.tableStats?.map((ts: any, i: number) => (
                    <tr key={i} className="hover:bg-white/[0.03]">
                      <td className="p-3 text-white font-mono">{ts.table}</td>
                      <td className="p-3 text-white/75 text-right font-mono">{ts.rows.toLocaleString()} rows</td>
                      <td className="p-3 text-right">
                        <button onClick={() => { selectTable(ts.table); setShowTablesModal(false); }} className="px-3 py-1.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg text-xs font-bold transition-all">
                          View Data
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!stats.tableStats?.length && (
                <div className="py-10 text-center text-white/30 text-sm">No tables found.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* View Row Full Details Modal */}
      {viewRow && activeTable && (
        <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setViewRow(null)}>
          <div className="glass-card rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-gold" /> Row Details — {activeTable}
              </h3>
              <button onClick={() => setViewRow(null)} className="p-1.5 text-white/30 hover:text-white rounded-lg hover:bg-white/10 transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-x-hidden overflow-y-auto p-5 space-y-4">
              {Object.entries(viewRow).map(([key, val]: [string, any]) => (
                <div key={key} className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-2">{key}</p>
                  {val === null ? (
                    <p className="text-white/20 italic text-sm">NULL</p>
                  ) : (
                    <p className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap break-words">{String(val)}</p>
                  )}
                </div>
              ))}
            </div>
            <div className="p-5 border-t border-white/10 flex justify-end">
              <button onClick={() => setViewRow(null)} className="px-5 py-2.5 text-sm text-white/70 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-all">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
