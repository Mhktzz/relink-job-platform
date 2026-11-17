import { useState } from "react";
import cashierPhoto from "../assets/cashier.jpg";
import technicianPhoto from "../assets/technician.jpg";
import Logo from "./Logo.jsx";
import "./AuthPage.css";

function AuthPage({ mode, role }) {
  const [message, setMessage] = useState("");
  const isSignup = mode === "signup";
  const isWorker = role === "pekerja";
  const roleName = isWorker ? "Pencari Kerja" : "UMKM";
  const homeHref = isWorker ? "/pekerja" : "/";
  const artTitle = isWorker
    ? "Kerja dekat. Reputasi bertumbuh."
    : "Temukan bantuan lokal untuk bisnismu.";
  const artDescription = isWorker
    ? "Pilih tugas sesuai keahlian dan bangun reputasi dari hasil kerja nyata."
    : "Hubungkan kebutuhan usahamu dengan pekerja lokal yang tepat.";

  function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    if (
      isSignup &&
      formData.get("password") !== formData.get("password-confirm")
    ) {
      setMessage("Konfirmasi kata sandi belum cocok.");
      return;
    }

    setMessage("Formulir ini belum terhubung ke sistem autentikasi.");
  }

  return (
    <main className="auth-page">
      <div className="auth-frame">
        <section aria-labelledby="auth-title" className="auth-panel">
          <header className="auth-header">
            <Logo dark href={homeHref} />
            <a className="auth-back-link" href={homeHref}>
              Kembali
            </a>
          </header>

          <div className="auth-content">
            <h1 id="auth-title">
              {isSignup ? "Mulai bersama Relink" : "Selamat datang kembali"}
            </h1>
            <p className="auth-description">
              {isSignup
                ? `Buat akun ${roleName} untuk mulai menggunakan Relink.`
                : `Masuk ke akun ${roleName} dan lanjutkan aktivitasmu.`}
            </p>

            <nav aria-label="Pilih jenis akun" className="auth-role-switch">
              <a
                aria-current={!isWorker ? "page" : undefined}
                className={
                  !isWorker
                    ? "auth-role-switch__link is-active"
                    : "auth-role-switch__link"
                }
                href={`/${isSignup ? "daftar" : "masuk"}?peran=umkm`}
              >
                UMKM
              </a>
              <a
                aria-current={isWorker ? "page" : undefined}
                className={
                  isWorker
                    ? "auth-role-switch__link is-active"
                    : "auth-role-switch__link"
                }
                href={`/${isSignup ? "daftar" : "masuk"}?peran=pekerja`}
              >
                Pencari Kerja
              </a>
            </nav>

            <form className="auth-form" onSubmit={handleSubmit}>
              {isSignup && (
                <label className="auth-field">
                  <span>
                    {isWorker ? "Nama lengkap" : "Nama pemilik usaha"}
                  </span>
                  <input
                    autoComplete="name"
                    name="name"
                    placeholder={
                      isWorker ? "Nama sesuai identitas" : "cth: Budi Santoso"
                    }
                    required
                  />
                </label>
              )}
              {isSignup && !isWorker && (
                <label className="auth-field">
                  <span>Nama usaha</span>
                  <input
                    autoComplete="organization"
                    name="business"
                    placeholder="cth: Warung Berkah"
                    required
                  />
                </label>
              )}
              <label className="auth-field">
                <span>Email</span>
                <input
                  autoComplete="email"
                  name="email"
                  placeholder="john@example.com"
                  required
                  type="email"
                />
              </label>
              <label className="auth-field">
                <span>Kata sandi</span>
                <input
                  autoComplete={isSignup ? "new-password" : "current-password"}
                  minLength={isSignup ? 8 : undefined}
                  name="password"
                  placeholder={
                    isSignup ? "Minimal 8 karakter" : "Masukkan kata sandi"
                  }
                  required
                  type="password"
                />
              </label>
              {isSignup && (
                <label className="auth-field">
                  <span>Konfirmasi kata sandi</span>
                  <input
                    autoComplete="new-password"
                    minLength={8}
                    name="password-confirm"
                    placeholder="Ulangi kata sandi"
                    required
                    type="password"
                  />
                </label>
              )}

              <button className="auth-submit" type="submit">
                {isSignup ? "Buat Akun" : "Masuk"}
              </button>
              {message && (
                <p aria-live="polite" className="auth-message" role="status">
                  {message}
                </p>
              )}
            </form>

            <p className="auth-switch">
              {isSignup ? "Sudah punya akun?" : "Belum punya akun?"}{" "}
              <a href={`/${isSignup ? "masuk" : "daftar"}?peran=${role}`}>
                {isSignup ? "Masuk" : "Daftar sekarang"}
              </a>
            </p>
          </div>

          <p className="auth-legal">Aman, dekat, dan tumbuh bersama Relink.</p>
        </section>

        <aside
          aria-label={`Tentang Relink untuk ${roleName}`}
          className="auth-art"
        >
          <img
            alt=""
            aria-hidden="true"
            className="auth-art__photo"
            src={isWorker ? technicianPhoto : cashierPhoto}
          />
          <div aria-hidden="true" className="auth-art__overlay" />
          <div className="auth-art__content">
            <span className="auth-art__badge">
              {isWorker ? "UNTUK PEKERJA" : "UNTUK UMKM"}
            </span>
            <h2>{artTitle}</h2>
            <p>{artDescription}</p>
            <div className="auth-art__promise">
              <span aria-hidden="true" className="auth-art__dot" />
              {isWorker
                ? "Peluang lokal, reputasi nyata"
                : "Mitra lokal, kerja lebih mudah"}
            </div>
          </div>
          <div
            aria-hidden="true"
            className="auth-art__orb auth-art__orb--one"
          />
          <div
            aria-hidden="true"
            className="auth-art__orb auth-art__orb--two"
          />
        </aside>
      </div>
    </main>
  );
}

export default AuthPage;
