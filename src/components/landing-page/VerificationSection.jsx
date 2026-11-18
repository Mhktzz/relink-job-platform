import iconList from "../../assets/figma/verification-icon-list.svg";
import iconPlay from "../../assets/figma/verification-icon-play.svg";
import iconCamera from "../../assets/figma/verification-icon-camera.svg";
import iconUsers from "../../assets/figma/verification-icon-users.svg";

const methods = [
  {
    icon: iconList,
    title: "Tes skenario praktis",
    description: "Kuis berbasis kasus lapangan sesuai keahlian.",
  },
  {
    icon: iconPlay,
    title: "Video unjuk kerja",
    description: "Rekam 15–30 detik saat kamu mempraktikkan keahlian.",
  },
  {
    icon: iconCamera,
    title: "Kamera terverifikasi",
    description: "Foto hasil kerja ber-watermark GPS dan waktu otomatis.",
  },
  {
    icon: iconUsers,
    title: "Rekomendasi lokal",
    description: "Pelanggan lama menjamin kamu lewat kode OTP singkat.",
  },
];

function VerificationSection() {
  return (
    <section
      aria-labelledby="verification-title"
      className="verification-section"
      id="verifikasi"
    >
      <div className="section-wrap verification-layout">
        <div className="verification-copy">
          <h2 id="verification-title">
            Tidak hanya bukti akademis.
            <br />
            Namun juga keterampilan.
          </h2>
          <p>
            Lulusan manapun dengan jam terbang tinggi tetap bisa dipercaya.
            Relink memverifikasi keahlian tidak hanya melalui sertifikat, tetapi
            juga lewat bukti nyata.
          </p>
          <a className="button button--outline-dark" href="#cara-kerja">
            Pelajari alur verifikasi
          </a>
        </div>
        <div className="verification-grid">
          {methods.map((method) => (
            <article className="verification-card" key={method.title}>
              <span className="verification-card__icon">
                <img alt="" height="28" src={method.icon} width="28" />
              </span>
              <div>
                <h3>{method.title}</h3>
                <p>{method.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default VerificationSection;
