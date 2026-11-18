import { useState } from "react";
import cashierPhoto from "../../assets/cashier.jpg";
import technicianPhoto from "../../assets/technician.jpg";
import Logo from "../common/Logo.jsx";
import Icon from "../common/Icon.jsx";
import { supabase } from "../../lib/supabaseClient.js";
import "./AuthPage.css";

function AuthPage({ mode, role }) {
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info"); // 'info' | 'error' | 'success'
  const [isLoading, setIsLoading] = useState(false);

  // Form Fields State
  const [name, setName] = useState("");
  const [business, setBusiness] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const isSignup = mode === "signup";
  const isWorker = role === "pekerja";
  const roleName = isWorker ? "Pencari Kerja" : "UMKM";
  const homeHref = isWorker ? "/pekerja" : "/";
  const artTitle = isWorker
    ? "Kerja dekat. Reputasi bertumbuh."
    : "Temukan bantuan lokal untuk bisnismu.";
  const artDescription = isWorker
    ? "Pilih tugas sesuai keahlian dan bangun reputasi dari hasil kerja nyata."
    : "Hubungkan kebutuhan usahamu dengan pekerja lokal terverifikasi tanpa ijazah formal.";

  // Handler Submit Login / Register
  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setIsLoading(true);

    try {
      if (isSignup) {
        // 1. Validasi Password
        if (password !== passwordConfirm) {
          setMessage("Konfirmasi kata sandi belum cocok.");
          setMessageType("error");
          setIsLoading(false);
          return;
        }

        if (password.length < 6) {
          setMessage("Kata sandi minimal 6 karakter.");
          setMessageType("error");
          setIsLoading(false);
          return;
        }

        // 2. Pendaftaran via Supabase Auth
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
          options: {
            data: {
              full_name: name.trim(),
              business_name: !isWorker ? business.trim() : null,
              phone: phone.trim(),
              role: isWorker ? "mitra" : "klien",
            },
          },
        });

        if (error) {
          setMessage(`Gagal mendaftar: ${error.message}`);
          setMessageType("error");
          setIsLoading(false);
          return;
        }

        // 3. Simpan Profil ke Tabel Profiles
        const userId = data.user?.id;
        if (userId) {
          await supabase.from("profiles").upsert([
            {
              id: userId,
              full_name: name.trim(),
              business_name: !isWorker ? business.trim() : null,
              phone: phone.trim(),
              role: isWorker ? "mitra" : "klien",
              tier: "Tier 1",
              trust_score: 98,
              is_verified: true,
            },
          ]);

          // Simpan session info lokal untuk kemudahan akses
          localStorage.setItem(
            "relink_user",
            JSON.stringify({
              id: userId,
              email: email.trim(),
              full_name: name.trim(),
              business_name: !isWorker ? business.trim() : "Mitra Mandiri",
              role: isWorker ? "mitra" : "klien",
            })
          );
        }

        setMessageType("success");
        setMessage("Akun UMKM berhasil dibuat! Mengalihkan ke dashboard...");
        setTimeout(() => {
          window.location.href = isWorker ? "/pekerja" : "/dashboard";
        }, 1200);
      } else {
        // PROSES LOGIN
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        });

        if (error) {
          setMessage("Email atau kata sandi yang Anda masukkan tidak sesuai.");
          setMessageType("error");
          setIsLoading(false);
          return;
        }

        // Ambil data profil dari database
        const userId = data.user?.id;
        let businessName = "Toko Kue Bu Rina";
        let fullName = data.user?.user_metadata?.full_name || "Pemilik UMKM";

        if (userId) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, business_name, role")
            .eq("id", userId)
            .single();

          if (profile) {
            if (profile.business_name) businessName = profile.business_name;
            if (profile.full_name) fullName = profile.full_name;
          }

          localStorage.setItem(
            "relink_user",
            JSON.stringify({
              id: userId,
              email: data.user.email,
              full_name: fullName,
              business_name: businessName,
              role: isWorker ? "mitra" : "klien",
            })
          );
        }

        setMessageType("success");
        setMessage("Login berhasil! Membuka dashboard UMKM...");
        setTimeout(() => {
          window.location.href = isWorker ? "/pekerja" : "/dashboard";
        }, 800);
      }
    } catch (err) {
      console.error("[Relink Auth Error]", err);
      setMessage("Terjadi kendala koneksi ke server. Silakan coba kembali.");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  }

  // Handler Masuk Cepat Akun Demo UMKM (Toko Kue Bu Rina)
  function handleDemoLogin() {
    localStorage.setItem(
      "relink_user",
      JSON.stringify({
        id: "a1111111-1111-1111-1111-111111111111",
        email: "burina@tokokue.id",
        full_name: "Bu Rina",
        business_name: "Toko Kue Bu Rina",
        role: "klien",
      })
    );
    setMessage("Masuk sebagai Toko Kue Bu Rina (Demo)...");
    setMessageType("success");
    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 600);
  }

  return (
    <main className="auth-page">
      <div className="auth-frame">
        <section aria-labelledby="auth-title" className="auth-panel">
          <header className="auth-header">
            <Logo dark href={homeHref} />
            <a className="auth-back-link" href={homeHref}>
              &larr; Kembali ke Beranda
            </a>
          </header>

          <div className="auth-content">
            <h1 id="auth-title">
              {isSignup ? `Daftar Akun ${roleName}` : `Masuk ke ${roleName}`}
            </h1>
            <p className="auth-description">
              {isSignup
                ? `Buat akun ${roleName} untuk mulai memposting tugas dan merekrut pekerja lokal tanpa repot.`
                : `Masuk ke dashboard ${roleName} dan kelola operasional tokomu.`}
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
                Perusahaan / UMKM
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
                Mitra Pekerja
              </a>
            </nav>

            <form className="auth-form" onSubmit={handleSubmit}>
              {isSignup && (
                <label className="auth-field">
                  <span>
                    {isWorker ? "Nama Lengkap" : "Nama Pemilik Usaha"}
                  </span>
                  <input
                    autoComplete="name"
                    name="name"
                    onChange={(e) => setName(e.target.value)}
                    placeholder={
                      isWorker ? "Nama sesuai KTP" : "Contoh: Ibu Rina Wati"
                    }
                    required
                    type="text"
                    value={name}
                  />
                </label>
              )}

              {isSignup && !isWorker && (
                <label className="auth-field">
                  <span>Nama Toko / Perusahaan</span>
                  <input
                    autoComplete="organization"
                    name="business"
                    onChange={(e) => setBusiness(e.target.value)}
                    placeholder="Contoh: Toko Kue Bu Rina"
                    required
                    type="text"
                    value={business}
                  />
                </label>
              )}

              {isSignup && (
                <label className="auth-field">
                  <span>Nomor WhatsApp / HP Aktif</span>
                  <input
                    autoComplete="tel"
                    name="phone"
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    required
                    type="tel"
                    value={phone}
                  />
                </label>
              )}

              <label className="auth-field">
                <span>Email Akun</span>
                <input
                  autoComplete="email"
                  name="email"
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@emailbisnis.com"
                  required
                  type="email"
                  value={email}
                />
              </label>

              <label className="auth-field">
                <span>Kata Sandi</span>
                <div className="auth-password-input-wrap">
                  <input
                    autoComplete={isSignup ? "new-password" : "current-password"}
                    minLength={6}
                    name="password"
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={
                      isSignup ? "Minimal 6 karakter" : "Masukkan kata sandi"
                    }
                    required
                    type={showPassword ? "text" : "password"}
                    value={password}
                  />
                  <button
                    aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                    className="btn-toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    type="button"
                  >
                    <Icon name={showPassword ? "eye-off" : "eye"} size={18} />
                  </button>
                </div>
              </label>

              {isSignup && (
                <label className="auth-field">
                  <span>Konfirmasi Kata Sandi</span>
                  <div className="auth-password-input-wrap">
                    <input
                      autoComplete="new-password"
                      minLength={6}
                      name="password-confirm"
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                      placeholder="Ulangi kata sandi Anda"
                      required
                      type={showPasswordConfirm ? "text" : "password"}
                      value={passwordConfirm}
                    />
                    <button
                      aria-label={
                        showPasswordConfirm
                          ? "Sembunyikan konfirmasi kata sandi"
                          : "Tampilkan konfirmasi kata sandi"
                      }
                      className="btn-toggle-password"
                      onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                      tabIndex={-1}
                      type="button"
                    >
                      <Icon
                        name={showPasswordConfirm ? "eye-off" : "eye"}
                        size={18}
                      />
                    </button>
                  </div>
                </label>
              )}

              {message && (
                <div
                  aria-live="polite"
                  className={`auth-message auth-message--${messageType}`}
                  role="status"
                >
                  {message}
                </div>
              )}

              <button
                className="auth-submit"
                disabled={isLoading}
                type="submit"
              >
                {isLoading ? (
                  "Memproses..."
                ) : isSignup ? (
                  "Daftar Akun UMKM"
                ) : (
                  "Masuk ke Dashboard"
                )}
              </button>

              {/* Tombol Akses Cepat Demo UMKM */}
              {!isWorker && (
                <>
                  <div className="auth-demo-divider">
                    <span>ATAU COBA LANGSUNG</span>
                  </div>
                  <button
                    className="btn-auth-demo"
                    onClick={handleDemoLogin}
                    type="button"
                  >
                    Masuk Cepat Demo (Toko Kue Bu Rina) &rarr;
                  </button>
                </>
              )}
            </form>

            <p className="auth-switch">
              {isSignup ? "Sudah punya akun bisnis?" : "Belum mendaftarkan usaha Anda?"}{" "}
              <a href={`/${isSignup ? "masuk" : "daftar"}?peran=${role}`}>
                {isSignup ? "Masuk sekarang" : "Daftar gratis di sini"}
              </a>
            </p>
          </div>

          <p className="auth-legal">
            Dilindungi oleh Sistem Escrow & Garansi 100% Relink.
          </p>
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
              {isWorker ? "UNTUK MITRA PEKERJA" : "PORTAL PERUSAHAAN & UMKM"}
            </span>
            <h2>{artTitle}</h2>
            <p>{artDescription}</p>
            <div className="auth-art__promise">
              <span aria-hidden="true" className="auth-art__dot" />
              {isWorker
                ? "Peluang kerja lokal, reputasi nyata"
                : "Mitra siap kerja instan dalam radius 1–5 km"}
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
