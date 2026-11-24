import Icon from '../../common/Icon.jsx'

function PostingTugasView({
  setCurrentMenu,
  handleCreateTask,
  newTaskTitle,
  setNewTaskTitle,
  newTaskCategory,
  setNewTaskCategory,
  newTaskWorkersNeeded,
  setNewTaskWorkersNeeded,
  setNewTaskIsTandem,
  selectedTierLevel,
  setSelectedTierLevel,
  newTaskChecklist,
  removeChecklistItem,
  newChecklistInput,
  setNewChecklistInput,
  addChecklistItem,
  estimatedBudget,
}) {
  return (
    <main className="dashboard-content-flow">
      <div className="content-heading-bar">
        <div>
          <h1>Smart Task Posting</h1>
          <p>Formulir posting kebutuhan UMKM dengan penyesuaian tier dan opsi Paket Tandem.</p>
        </div>
      </div>

      <div className="task-posting-layout">
        <form className="task-posting-form" onSubmit={handleCreateTask}>
          <div className="form-group">
            <label htmlFor="task-title">Judul Kebutuhan Pekerjaan</label>
            <input
              id="task-title"
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Contoh: Packing 150 Boks Kue / Perbaikan Mesin Kasir Toko"
              required
              type="text"
              value={newTaskTitle}
            />
            <small className="form-help">Tulis ringkas kebutuhan Anda agar mitra langsung memahami.</small>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="task-category">Kategori Bidang</label>
              <select
                id="task-category"
                onChange={(e) => setNewTaskCategory(e.target.value)}
                value={newTaskCategory}
              >
                <option value="operasional">Operasional Toko & Packing</option>
                <option value="teknis">Teknis, Mesin Kasir & Perangkat</option>
                <option value="administrasi">Administrasi & Input Stok</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="task-workers">Jumlah Pekerja Dibutuhkan</label>
              <input
                id="task-workers"
                max="10"
                min="1"
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10) || 1
                  setNewTaskWorkersNeeded(val)
                  if (val >= 2) {
                    setNewTaskIsTandem(true)
                  } else {
                    setNewTaskIsTandem(false)
                  }
                }}
                type="number"
                value={newTaskWorkersNeeded}
              />
            </div>
          </div>

          {newTaskWorkersNeeded >= 2 && (
            <div className="tandem-callout">
              <div className="tandem-callout__top">
                <Icon name="users" size={20} />
                <div>
                  <strong>Paket Tandem Otomatis Aktif (1 Lead + {newTaskWorkersNeeded - 1} Anggota)</strong>
                  <p>1 Mitra Tier 3 (Pro) bertindak sebagai Quality Lead mendampingi pekerja Tier 1. Lebih hemat dan hasil terkontrol!</p>
                </div>
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Pilihan Tingkat Kualifikasi Mitra (Auto-Leveling)</label>
            <div className="tier-selector-grid">
              <button
                className={`tier-option-card${selectedTierLevel === 'tier_1' ? ' tier-option-card--selected' : ''}`}
                onClick={() => setSelectedTierLevel('tier_1')}
                type="button"
              >
                <span className="badge-tag-discount">HEMAT 45%</span>
                <h4>Tier 1 (Basic)</h4>
                <p>Tugas standar & operasional. Dilindungi Garansi 100% Relink.</p>
                <strong>Mulai Rp35.000/tugas</strong>
              </button>

              <button
                className={`tier-option-card${selectedTierLevel === 'tier_2' ? ' tier-option-card--selected' : ''}`}
                onClick={() => setSelectedTierLevel('tier_2')}
                type="button"
              >
                <h4>Tier 2 (Terverifikasi)</h4>
                <p>Tugas teknis menengah. Rekam jejak rating ≥ 4.8.</p>
                <strong>Mulai Rp45.000/tugas</strong>
              </button>

              <button
                className={`tier-option-card${selectedTierLevel === 'tier_3' ? ' tier-option-card--selected' : ''}`}
                onClick={() => setSelectedTierLevel('tier_3')}
                type="button"
              >
                <h4>Tier 3 (Pro)</h4>
                <p>Keahlian tinggi & problem-solving teknis kompleks.</p>
                <strong>Mulai Rp60.000/tugas</strong>
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Checklist Kriteria Serah Terima (Acceptance Criteria)</label>
            <div className="checklist-builder">
              {newTaskChecklist.map((item, idx) => (
                <div className="checklist-item-row" key={idx}>
                  <span>✓ {item}</span>
                  <button
                    className="btn-remove-check"
                    onClick={() => removeChecklistItem(idx)}
                    title="Hapus kriteria"
                    type="button"
                  >
                    ✕
                  </button>
                </div>
              ))}

              <div className="add-checklist-row">
                <input
                  onChange={(e) => setNewChecklistInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addChecklistItem()
                    }
                  }}
                  placeholder="Tambah kriteria hasil kerja..."
                  type="text"
                  value={newChecklistInput}
                />
                <button className="button button--outline-dark button--sm" onClick={addChecklistItem} type="button">
                  Tambah
                </button>
              </div>
            </div>
          </div>

          <div className="form-submit-row">
            <button className="button button--pink button--lg" type="submit">
              Setor ke Escrow (Rp{estimatedBudget.toLocaleString('id-ID')}) & Posting
            </button>
          </div>
        </form>

        <aside className="task-posting-summary">
          <div className="summary-card">
            <h3>Rangkuman Biaya & Proteksi</h3>
            <div className="summary-row">
              <span>Estimasi Biaya Jasa:</span>
              <strong>Rp{estimatedBudget.toLocaleString('id-ID')}</strong>
            </div>
            <div className="summary-row">
              <span>Biaya Layanan Escrow:</span>
              <span>Rp2.500</span>
            </div>
            <div className="summary-divider" />
            <div className="summary-row summary-row--total">
              <span>Total Deposit Escrow:</span>
              <strong>Rp{(estimatedBudget + 2500).toLocaleString('id-ID')}</strong>
            </div>

            <div className="guarantee-box">
              <div className="guarantee-box__title">
                <Icon name="shield" size={18} />
                <strong>Garansi Kepuasan 100%</strong>
              </div>
              <p>
                Jika hasil kerja tidak sesuai checklist, Anda berhak mendapatkan refund penuh
                atau pekerja pengganti Tier 3 gratis.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  )
}

export default PostingTugasView
