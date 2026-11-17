import wrenchIcon from "../assets/figma/icon-wrench.svg";
import shieldIcon from "../assets/figma/icon-shield-mint.svg";
import tierDot from "../assets/figma/tier-dot.svg";
import zapIcon from "../assets/figma/icon-zap.svg";
import cashierPhoto from "../assets/cashier.jpg";
import technicianPhoto from "../assets/technician.jpg";

function WorkerShowcase({ workerPage = false }) {
  return (
    <div className={`hero-visual${workerPage ? " hero-visual--worker" : ""}`}>
      <div aria-hidden="true" className="hero-visual__glow" />
      <div className="hero-photo">
        <img
          alt={
            workerPage
              ? "Teknisi sedang bekerja"
              : "Pekerja sedang menyelesaikan pekerjaan dengan laptop"
          }
          src={workerPage ? technicianPhoto : cashierPhoto}
        />
      </div>
      {!workerPage && (
        <>
          <article className="job-card job-card--task">
            <div className="job-card__heading">
              <span className="job-card__icon job-card__icon--pink">
                <img alt="" height="22" src={wrenchIcon} width="22" />
              </span>
              <span className="job-card__title">
                <strong>Teknisi mesin kasir</strong>
                <small>Purwokerto Selatan · Hari ini</small>
              </span>
            </div>
            <div className="job-card__footer">
              <strong>Rp350.000/kasir</strong>
              <span className="job-card__tier">
                <img alt="" height="12" src={tierDot} width="12" />
                Tier 3
              </span>
            </div>
          </article>
          <div className="job-card job-card--instant">
            <span className="job-card__icon job-card__icon--mint">
              <img alt="" height="18" src={zapIcon} width="18" />
            </span>
            <span>
              <strong>Siap kerja instan</strong>
              <small>0,8 km dari lokasimu</small>
            </span>
          </div>
          <div className="job-card job-card--escrow">
            <span className="job-card__icon job-card__icon--mint">
              <img alt="" height="22" src={shieldIcon} width="22" />
            </span>
            <span>
              <strong>Bayaran aman</strong>
              <small>Dana ditahan di escrow</small>
            </span>
          </div>
        </>
      )}
    </div>
  );
}

export default WorkerShowcase;
