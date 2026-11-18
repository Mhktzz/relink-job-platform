import Icon from '../../common/Icon.jsx'

function KanbanView({
  searchQuery,
  setSearchQuery,
  setCurrentMenu,
  currentTasks,
  dueWeekTasks,
  overdueTasks,
  setSelectedProofTask,
  setShowProofModal,
}) {
  return (
    <main className="dashboard-content-flow">
      <div className="content-heading-bar">
        <div>
          <h1>Kanban Tugas & Serah Terima</h1>
          <p>Pantau tahapan pengerjaan tugas mikro, verifikasi bukti GPS, dan konfirmasi serah terima.</p>
        </div>
        <div className="kanban-action-bar">
          <div className="task-search-pill">
            <Icon name="search" size={14} />
            <input
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search task in kanban..."
              type="text"
              value={searchQuery}
            />
          </div>
          <button
            className="btn-create-pill"
            onClick={() => setCurrentMenu('new_task')}
            type="button"
          >
            <Icon name="plus" size={14} />
            <span>Posting Tugas Baru</span>
          </button>
        </div>
      </div>

      {/* 3-COLUMN KANBAN BOARD */}
      <div className="task-columns-grid">
        {/* Kolom 1: Current Task */}
        <div className="kanban-column">
          <div className="kanban-column__header">
            <div className="column-title">
              <strong>Current Task</strong>
              <span className="column-counter">{currentTasks.length}</span>
            </div>
            <button
              aria-label="Tambah tugas"
              className="btn-column-add"
              onClick={() => setCurrentMenu('new_task')}
              type="button"
            >
              +
            </button>
          </div>

          <div className="kanban-card-stack">
            {currentTasks.map((task) => (
              <article className="kanban-card" key={task.id}>
                <div className="kanban-card__top">
                  <span className="card-code-pill">{task.code}</span>
                  <span className="card-status-pill">{task.statusBadge}</span>
                </div>
                <h3 className="kanban-card__title">{task.title}</h3>
                <p className="kanban-card__desc">{task.description}</p>

                <div className="kanban-card__meta">
                  <span className={`priority-tag priority-tag--${task.priority.toLowerCase()}`}>
                    {task.priority}
                  </span>
                  <span className="card-date">{task.dateRange}</span>
                </div>

                <div className="kanban-card__footer">
                  <div className="worker-mini">
                    <img alt="" className="worker-mini-avatar" src={task.workerPhoto} />
                    <span>{task.workerName}</span>
                  </div>
                  <span className="budget-tag">Rp{task.budget.toLocaleString('id-ID')}</span>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Kolom 2: Tasks Due / Review Bukti */}
        <div className="kanban-column">
          <div className="kanban-column__header">
            <div className="column-title">
              <strong>Tasks Due This Week</strong>
              <span className="column-counter">{dueWeekTasks.length}</span>
            </div>
            <button
              aria-label="Tambah tugas"
              className="btn-column-add"
              onClick={() => setCurrentMenu('new_task')}
              type="button"
            >
              +
            </button>
          </div>

          <div className="kanban-card-stack">
            {dueWeekTasks.map((task) => (
              <article
                className={`kanban-card${task.proofData ? ' kanban-card--needs-approval' : ''}`}
                key={task.id}
              >
                <div className="kanban-card__top">
                  <span className="card-code-pill">{task.code}</span>
                  <span className="card-status-pill card-status-pill--warn">{task.statusBadge}</span>
                </div>
                <h3 className="kanban-card__title">{task.title}</h3>
                <p className="kanban-card__desc">{task.description}</p>

                <div className="kanban-card__meta">
                  <span className={`priority-tag priority-tag--${task.priority.toLowerCase()}`}>
                    {task.priority}
                  </span>
                  <span className="card-date">{task.dateRange}</span>
                </div>

                {task.proofData ? (
                  <div className="card-approval-box">
                    <div className="gps-watermark-snippet">
                      <Icon name="pin" size={12} />
                      <small>GPS Terverifikasi: {task.proofData.gpsLocation}</small>
                    </div>
                    <button
                      className="btn-review-proof"
                      onClick={() => {
                        setSelectedProofTask(task)
                        setShowProofModal(true)
                      }}
                      type="button"
                    >
                      Periksa Bukti & Tanda Tangan
                    </button>
                  </div>
                ) : (
                  <div className="kanban-card__footer">
                    <div className="worker-mini">
                      <img alt="" className="worker-mini-avatar" src={task.workerPhoto} />
                      <span>{task.workerName}</span>
                    </div>
                    <span className="budget-tag">Rp{task.budget.toLocaleString('id-ID')}</span>
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>

        {/* Kolom 3: Completed & Overdue */}
        <div className="kanban-column">
          <div className="kanban-column__header">
            <div className="column-title">
              <strong>Completed & Overdue</strong>
              <span className="column-counter">{overdueTasks.length}</span>
            </div>
            <button
              aria-label="Tambah tugas"
              className="btn-column-add"
              onClick={() => setCurrentMenu('new_task')}
              type="button"
            >
              +
            </button>
          </div>

          <div className="kanban-card-stack">
            {overdueTasks.map((task) => (
              <article className="kanban-card kanban-card--done" key={task.id}>
                <div className="kanban-card__top">
                  <span className="card-code-pill">{task.code}</span>
                  <span className="card-status-pill card-status-pill--success">
                    {task.statusBadge}
                  </span>
                </div>
                <h3 className="kanban-card__title">{task.title}</h3>
                <p className="kanban-card__desc">{task.description}</p>

                <div className="kanban-card__meta">
                  <span className="priority-tag priority-tag--low">Completed</span>
                  <span className="card-date">{task.dateRange}</span>
                </div>

                <div className="kanban-card__footer">
                  <div className="worker-mini">
                    <img alt="" className="worker-mini-avatar" src={task.workerPhoto} />
                    <span>{task.workerName}</span>
                  </div>
                  <span className="budget-tag budget-tag--released">
                    Rp{task.budget.toLocaleString('id-ID')} (Cair)
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}

export default KanbanView
