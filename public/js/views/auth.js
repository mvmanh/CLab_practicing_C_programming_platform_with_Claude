import { api } from '../api.js';
import { html, render, $, toast } from '../util.js';
import { state, navigate, setUser } from '../app.js';

export default async function authView({ app, variant, query }) {
  const isLogin = variant === 'login';
  const next = query.get('next') || '/';
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/';
  if (state.user) { navigate(safeNext, { replace: true }); return; }

  if (!isLogin && !state.config.allowRegistration) {
    render(app, html`<div class="auth-wrap"><div class="card auth-card center">
      <h1>Đăng ký đang tắt</h1><p class="muted">Vui lòng liên hệ giảng viên để được cấp tài khoản.</p>
      <a class="btn btn-primary" href="/login" data-link>Đăng nhập</a></div></div>`);
    return;
  }

  render(app, html`
    <div class="auth-wrap">
      <div class="card auth-card">
        <h1>${isLogin ? 'Đăng nhập' : 'Tạo tài khoản'}</h1>
        <p class="muted" style="margin-top:-6px">${isLogin ? 'Tiếp tục hành trình luyện tập lập trình C của bạn.' : 'Miễn phí — bắt đầu luyện tập ngay.'}</p>
        <form class="form" id="auth-form" novalidate>
          <div id="auth-err" class="form-error hidden"></div>
          <div class="field">
            <label for="username">Tên đăng nhập</label>
            <input class="input" id="username" name="username" autocomplete="username" required minlength="3" maxlength="32" autofocus>
          </div>
          ${isLogin ? '' : html`
          <div class="field">
            <label for="displayName">Họ và tên (hiển thị)</label>
            <input class="input" id="displayName" name="displayName" maxlength="60" placeholder="VD: Nguyễn Văn An">
          </div>`}
          <div class="field">
            <label for="password">Mật khẩu</label>
            <input class="input" id="password" name="password" type="password" autocomplete="${isLogin ? 'current-password' : 'new-password'}" required minlength="6">
          </div>
          ${isLogin ? '' : html`
          <div class="field">
            <label for="password2">Nhập lại mật khẩu</label>
            <input class="input" id="password2" name="password2" type="password" autocomplete="new-password" required>
          </div>`}
          <button class="btn btn-primary btn-lg" type="submit" id="auth-submit">${isLogin ? 'Đăng nhập' : 'Đăng ký'}</button>
        </form>
        <p class="small muted center" style="margin-bottom:0;margin-top:16px">
          ${isLogin
            ? (state.config.allowRegistration ? html`Chưa có tài khoản? <a href="/register${safeNext !== '/' ? '?next=' + encodeURIComponent(safeNext) : ''}" data-link>Đăng ký</a>` : 'Liên hệ giảng viên nếu bạn chưa có tài khoản.')
            : html`Đã có tài khoản? <a href="/login" data-link>Đăng nhập</a>`}
        </p>
      </div>
    </div>`);

  const form = $('#auth-form');
  const err = $('#auth-err');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    err.classList.add('hidden');
    const data = Object.fromEntries(new FormData(form));
    if (!isLogin && data.password !== data.password2) {
      err.textContent = 'Mật khẩu nhập lại không khớp.';
      err.classList.remove('hidden');
      return;
    }
    const btn = $('#auth-submit');
    btn.disabled = true;
    try {
      const r = await api.post(isLogin ? '/api/auth/login' : '/api/auth/register', {
        username: data.username.trim(), password: data.password, displayName: data.displayName,
      });
      setUser(r.user);
      toast(isLogin ? `Chào mừng trở lại, ${r.user.displayName}!` : 'Tạo tài khoản thành công!', 'ok');
      navigate(safeNext, { replace: true });
    } catch (ex) {
      err.textContent = ex.message;
      err.classList.remove('hidden');
      btn.disabled = false;
    }
  });
}
