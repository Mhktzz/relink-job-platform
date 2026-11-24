import { useState } from "react";
import cashierPhoto from "../../assets/cashier.jpg";
import technicianPhoto from "../../assets/technician.jpg";
import Logo from "../common/Logo.jsx";
import Icon from "../common/Icon.jsx";
import { supabase } from "../../lib/supabaseClient.js";
import "./AuthPage.css";

function AuthPage({ mode, role }) {
  const [message, setMessage] = useState(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get("idle_timeout") === "true") {
        return "Sesi Anda telah berakhir otomatis karena tidak ada aktivitas selama lebih dari 10 menit demi keamanan akun.";
      }
      return "";
    } catch {
      return "";
    }
  });
  const [messageType, setMessageType] = useState(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      return searchParams.get("idle_timeout") === "true" ? "error" : "info";
    } catch {
      return "info";
    }
  }); // 'info' | 'error' | 'success'
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
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const isSignup = mode === "signup";
  const isResetMode = mode === "reset-password";
  const isWorker = role === "pekerja";
  const roleName = isWorker ? "Mitra Pekerja" : "Perusahaan / UMKM";
  const homeHref = isWorker ? "/pekerja" : "/";
  const artTitle = isWorker
    ? "Kerja dekat. Reputasi bertumbuh."
    : "Temukan bantuan lokal untuk bisnismu.";
  const artDescription = isWorker
    ? "Pilih tugas sesuai keahlian dan bangun reputasi dari hasil kerja nyata."
    : "Hubungkan kebutuhan usahamu dengan pekerja lokal terverifikasi tanpa ijazah formal.";

  // Kriteria Validasi Kata Sandi Real-Time
  const passwordCriteria = {
    minLength: password.length >= 8,
    upperLower: /[a-z]/.test(password) && /[A-Z]/.test(password),
    number: /\d/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  };

  const isPasswordCriteriaMet =
    passwordCriteria.minLength &&
    passwordCriteria.upperLower &&
    passwordCriteria.number &&
    passwordCriteria.symbol;

  // Render Indikator Kriteria Kata Sandi
  const renderPasswordCriteria = () => (
    <div className="auth-password-criteria" aria-label="Ketentuan kata sandi">
      <div
        className={`auth-criteria-item ${
          passwordCriteria.minLength ? "is-met" : ""
        }`}
      >
        <span className="auth-criteria-circle">
          {passwordCriteria.minLength && <Icon name="check" size={9} />}
        </span>
        <span>Minimal 8 karakter</span>
      </div>

      <div
        className={`auth-criteria-item ${
          passwordCriteria.upperLower ? "is-met" : ""
        }`}
      >
        <span className="auth-criteria-circle">
          {passwordCriteria.upperLower && <Icon name="check" size={9} />}
        </span>
        <span>Huruf Besar &amp; Kecil</span>
      </div>

      <div
        className={`auth-criteria-item ${
          passwordCriteria.number ? "is-met" : ""
        }`}
      >
        <span className="auth-criteria-circle">
          {passwordCriteria.number && <Icon name="check" size={9} />}
        </span>
        <span>Angka</span>
      </div>

      <div
        className={`auth-criteria-item ${
          passwordCriteria.symbol ? "is-met" : ""
        }`}
      >
        <span className="auth-criteria-circle">
          {passwordCriteria.symbol && <Icon name="check" size={9} />}
        </span>
        <span>Simbol (@, #, !)</span>
      </div>
    </div>
  );

  // Handler Submit Login / Register
  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    setIsLoading(true);

    try {
      if (isSignup) {
        // 1. Validasi Password
        if (!isPasswordCriteriaMet) {
          setMessage("Kata sandi harus memenuhi semua kriteria: minimal 8 karakter, huruf besar & kecil, angka, dan simbol (@, #, !).");
          setMessageType("error");
          setIsLoading(false);
          return;
        }

        if (password !== passwordConfirm) {
          setMessage("Konfirmasi kata sandi belum cocok.");
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
        setMessage(
          isWorker
            ? "Akun Pekerja berhasil dibuat! Mengalihkan ke dashboard..."
            : "Akun UMKM berhasil dibuat! Mengalihkan ke dashboard..."
        );
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
        let fullName = data.user?.user_metadata?.full_name || (isWorker ? "Dimas Prasetyo" : "Pemilik UMKM");
        let userRole = isWorker ? "mitra" : "klien";

        if (userId) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, business_name, role")
            .eq("id", userId)
            .single();

          if (profile) {
            if (profile.business_name) businessName = profile.business_name;
            if (profile.full_name) fullName = profile.full_name;
            if (profile.role) userRole = profile.role;
          }

          localStorage.setItem(
            "relink_user",
            JSON.stringify({
              id: userId,
              email: data.user.email,
              full_name: fullName,
              business_name: userRole === "mitra" ? "Mitra Mandiri" : businessName,
              role: userRole,
            })
          );
        }

        const isUserWorker = userRole === "mitra" || userRole === "pekerja" || isWorker;
        setMessageType("success");
        setMessage(
          isUserWorker
            ? "Login berhasil! Membuka dashboard Pekerja..."
            : "Login berhasil! Membuka dashboard UMKM..."
        );
        setTimeout(() => {
          window.location.href = isUserWorker ? "/pekerja" : "/dashboard";
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

  // Handler Masuk Cepat Akun Demo Pekerja (Dimas Prasetyo)
  function handleWorkerDemoLogin() {
    localStorage.setItem(
      "relink_user",
      JSON.stringify({
        id: "w-1",
        email: "dimas.prasetyo@relink.id",
        full_name: "Dimas Prasetyo",
        business_name: "Mitra Mandiri",
        role: "mitra",
        tier: "Tier 1",
        trust_score: 98,
      })
    );
    setMessage("Masuk sebagai Dimas Prasetyo (Demo Mitra Tier 1)...");
    setMessageType("success");
    setTimeout(() => {
      window.location.href = "/pekerja";
    }, 600);
  }

  // Handler Kirim Tautan Lupa Kata Sandi
  async function handleForgotPasswordSubmit(e) {
    e.preventDefault();
    if (!resetEmail.trim()) {
      setMessage("Silakan masukkan email Anda.");
      setMessageType("error");
      return;
    }
    setIsLoading(true);
    setMessage("");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        resetEmail.trim(),
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

      if (error) {
        setMessage(`Gagal mengirim pemulihan: ${error.message}`);
        setMessageType("error");
      } else {
        setMessage(
          `Tautan pemulihan kata sandi telah dikirim ke ${resetEmail.trim()}! Silakan periksa kotak masuk atau spam email Anda.`
        );
        setMessageType("success");
      }
    } catch (err) {
      console.error("[Forgot Password Error]", err);
      setMessage("Terjadi kendala koneksi ke server. Silakan coba kembali.");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  }

  // Handler Simpan Kata Sandi Baru (Reset Password)
  async function handleResetPasswordSubmit(e) {
    e.preventDefault();
    if (!isPasswordCriteriaMet) {
      setMessage("Kata sandi baru harus memenuhi semua kriteria: minimal 8 karakter, huruf besar & kecil, angka, dan simbol (@, #, !).");
      setMessageType("error");
      return;
    }
    if (password !== passwordConfirm) {
      setMessage("Konfirmasi kata sandi belum cocok.");
      setMessageType("error");
      return;
    }
    setIsLoading(true);
    setMessage("");

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        setMessage(`Gagal menyetel kata sandi: ${error.message}`);
        setMessageType("error");
      } else {
        setMessage("Kata sandi baru berhasil disimpan! Mengalihkan ke halaman masuk...");
        setMessageType("success");
        setTimeout(() => {
          window.location.href = isWorker ? "/masuk?peran=pekerja" : "/masuk?peran=umkm";
        }, 1400);
      }
    } catch (err) {
      console.error("[Reset Password Error]", err);
      setMessage("Terjadi kendala saat memperbarui kata sandi.");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
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
            {isResetMode ? (
              <>
                <h1 id="auth-title">Buat Kata Sandi Baru</h1>
                <p className="auth-description">
                  Masukkan kata sandi baru untuk mengamankan akun bisnis Relink Anda.
                </p>

                <form className="auth-form" onSubmit={handleResetPasswordSubmit}>
                  <label className="auth-field">
                    <span>Kata Sandi Baru</span>
                    <div className="auth-password-input-wrap">
                      <input
                        autoComplete="new-password"
                        minLength={8}
                        name="new-password"
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimal 8 karakter"
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
                    {renderPasswordCriteria()}
                  </label>

                  <label className="auth-field">
                    <span>Konfirmasi Kata Sandi Baru</span>
                    <div className="auth-password-input-wrap">
                      <input
                        autoComplete="new-password"
                        minLength={6}
                        name="confirm-new-password"
                        onChange={(e) => setPasswordConfirm(e.target.value)}
                        placeholder="Ulangi kata sandi baru"
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
                    {isLoading ? "Menyimpan..." : "Simpan Kata Sandi Baru"}
                  </button>

                  <a
                    className="btn-auth-demo"
                    href={isWorker ? "/masuk?peran=pekerja" : "/masuk?peran=umkm"}
                    style={{
                      textAlign: "center",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      textDecoration: "none",
                    }}
                  >
                    &larr; Batalkan & Kembali ke Masuk
                  </a>
                </form>
              </>
            ) : isForgotPassword ? (
              <>
                <h1 id="auth-title">Atur Ulang Kata Sandi</h1>
                <p className="auth-description">
                  Masukkan email akun terdaftar Anda. Kami akan mengirimkan tautan pemulihan kata sandi ke kotak masuk Anda.
                </p>

                <form className="auth-form" onSubmit={handleForgotPasswordSubmit}>
                  <label className="auth-field">
                    <span>Email Akun Terdaftar</span>
                    <input
                      autoComplete="email"
                      name="reset-email"
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="nama@emailbisnis.com"
                      required
                      type="email"
                      value={resetEmail}
                    />
                  </label>

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
                    {isLoading ? "Mengirim Tautan..." : "Kirim Tautan Pemulihan"}
                  </button>

                  <button
                    className="btn-auth-demo"
                    onClick={() => {
                      setIsForgotPassword(false);
                      setMessage("");
                    }}
                    type="button"
                  >
                    &larr; Kembali ke Halaman Masuk
                  </button>
                </form>
              </>
            ) : (
              <>
                <h1 id="auth-title">
                  {isSignup ? `Daftar Akun ${roleName}` : `Masuk ke ${roleName}`}
                </h1>
                <p className="auth-description">
                  {isSignup
                    ? isWorker
                      ? "Daftar akun Mitra Pekerja untuk mulai mencari peluang tugas lokal sesuai keahlian."
                      : "Buat akun Perusahaan / UMKM untuk mulai memposting tugas dan merekrut pekerja lokal tanpa repot."
                    : isWorker
                    ? "Masuk ke akun Mitra Pekerja Relink."
                    : "Masuk ke dashboard Perusahaan / UMKM dan kelola operasional tokomu."}
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
                    <div className="auth-field-header-row">
                      <span>Kata Sandi</span>
                      {!isSignup && (
                        <button
                          className="auth-forgot-link"
                          onClick={() => {
                            setIsForgotPassword(true);
                            setResetEmail(email);
                            setMessage("");
                          }}
                          tabIndex={-1}
                          type="button"
                        >
                          Lupa kata sandi?
                        </button>
                      )}
                    </div>
                    <div className="auth-password-input-wrap">
                      <input
                        autoComplete={isSignup ? "new-password" : "current-password"}
                        minLength={isSignup ? 8 : 6}
                        name="password"
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={
                          isSignup ? "Minimal 8 karakter" : "Masukkan kata sandi"
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
                    {isSignup && renderPasswordCriteria()}
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
                      isWorker ? "Daftar Akun Mitra Pekerja" : "Daftar Akun UMKM"
                    ) : (
                      "Masuk ke Dashboard"
                    )}
                  </button>

                  {/* Tombol Akses Cepat Demo */}
                  <div className="auth-demo-divider">
                    <span>ATAU COBA LANGSUNG</span>
                  </div>
                  {isWorker ? (
                    <button
                      className="btn-auth-demo"
                      onClick={handleWorkerDemoLogin}
                      type="button"
                    >
                      Masuk Cepat Demo Mitra (Dimas Prasetyo) &rarr;
                    </button>
                  ) : (
                    <button
                      className="btn-auth-demo"
                      onClick={handleDemoLogin}
                      type="button"
                    >
                      Masuk Cepat Demo (Toko Kue Bu Rina) &rarr;
                    </button>
                  )}
                </form>

                <p className="auth-switch">
                  {isSignup ? "Sudah punya akun bisnis?" : "Belum mendaftarkan usaha Anda?"}{" "}
                  <a href={`/${isSignup ? "masuk" : "daftar"}?peran=${role}`}>
                    {isSignup ? "Masuk sekarang" : "Daftar gratis di sini"}
                  </a>
                </p>
              </>
            )}
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
