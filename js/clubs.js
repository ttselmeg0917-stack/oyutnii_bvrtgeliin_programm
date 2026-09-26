

const MEMBERSHIP_TABLE = "club_memberships";

const state = {
  user: null,
  email: "",
  studentId: null,
  clubs: [],            
  memberIdByClub: {},    
  category: "all",
  search: "",
  openId: null,
  loading: true,
  busy: false,
};

const $ = (id) => document.getElementById(id);

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

const clubById = (id) => state.clubs.find((c) => c.id === id);
const isJoined = (id) => Boolean(state.memberIdByClub[id]);
const hasProfile = () => Boolean(state.studentId);
const joinedClubs = () => state.clubs.filter((c) => isJoined(c.id));

let toastTimer;
function showToast(message, type = "success") {
  const toast = $("toast");
  toast.textContent = message;
  toast.className = `toast toast--${type} is-visible`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 4000);
}

function explainError(error) {
  const msg = String(error.message || "");
  if (error.code === "42P01" || msg.includes("does not exist") || msg.includes("schema cache")) {
    return "Клубын хүснэгт олдсонгүй. Supabase дээр 04_clubs.sql-ийг ажиллуулна уу.";
  }
  return msg;
}
async function loadStudent() {
  const { data, error } = await db
    .from("students")
    .select("id")
    .eq("user_id", state.user.id)
    .maybeSingle();
  if (error) throw error;
  state.studentId = data ? data.id : null;
}

async function loadClubs() {
  const { data, error } = await db
    .from("clubs")
    .select("id, club_name, category, description, meeting_time, location, leader_name, example")
    .order("id", { ascending: true });
  if (error) throw error;
  state.clubs = data || [];
}

async function loadMemberships() {
  state.memberIdByClub = {};
  if (!state.studentId) return;

  const { data, error } = await db
    .from(MEMBERSHIP_TABLE)
    .select("id, club_id")
    .eq("student_id", state.studentId);
  if (error) throw error;

  (data || []).forEach((m) => { state.memberIdByClub[m.club_id] = m.id; });
}

async function joinClub(id) {
  const club = clubById(id);
  if (!club || isJoined(id) || state.busy) return;

  if (!hasProfile()) {
    showToast("Эхлээд \"Миний мэдээлэл\" хэсгээ бөглөж хадгална уу.", "warn");
    return;
  }

  state.busy = true;
  const { data, error } = await db
    .from(MEMBERSHIP_TABLE)
    .insert({ club_id: id, student_id: state.studentId, status: "active" })
    .select("id")
    .single();
  state.busy = false;

  if (error) {
    if (error.code === "23505") {
      showToast("Та энэ клубт аль хэдийн элссэн байна.", "warn");
      await loadMemberships().catch(() => {});
      renderAll();
    } else {
      showToast("Элсэх үед алдаа гарлаа: " + explainError(error), "error");
    }
    return;
  }

  state.memberIdByClub[id] = data.id;
  renderAll();
  showToast(`"${club.club_name}"-д элслээ.`);
}

async function leaveClub(id) {
  const club = clubById(id);
  const memberId = state.memberIdByClub[id];
  if (!memberId || state.busy) return;

  state.busy = true;
  const { error } = await db.from(MEMBERSHIP_TABLE).delete().eq("id", memberId);
  state.busy = false;

  if (error) {
    showToast("Клубээс гарах үед алдаа гарлаа: " + explainError(error), "error");
    return;
  }

  delete state.memberIdByClub[id];
  renderAll();
  showToast(`"${club ? club.club_name : "Клуб"}"-ээс гарлаа.`, "warn");
}

function categories() {
  return [...new Set(state.clubs.map((c) => c.category).filter(Boolean))];
}

function renderTabs() {
  const tabs = [{ key: "all", label: "Бүгд" }, ...categories().map((c) => ({ key: c, label: c }))];
  $("catTabs").innerHTML = tabs.map((t) => `
    <button type="button" data-cat="${esc(t.key)}"
      class="${state.category === t.key ? "is-active" : ""}"
      aria-pressed="${state.category === t.key}">${esc(t.label)}</button>`).join("");
}

function filteredClubs() {
  const q = state.search.trim().toLowerCase();
  return state.clubs.filter((c) => {
    if (state.category !== "all" && c.category !== state.category) return false;
    if (!q) return true;
    return [c.club_name, c.category, c.description, c.example]
      .some((v) => String(v || "").toLowerCase().includes(q));
  });
}

function clubCard(c) {
  const joined = isJoined(c.id);
  return `
    <article class="club-card ${joined ? "is-joined" : ""}">
      <div class="club-card__top">
        ${c.category ? `<span class="pill">${esc(c.category)}</span>` : ""}
        ${joined ? `<span class="pill pill--ok">✓ Элссэн</span>` : ""}
      </div>
      <h3 class="club-card__name">${esc(c.club_name)}</h3>
      <p class="club-card__desc">${esc(c.description)}</p>
      ${c.meeting_time ? `<p class="club-card__time">Цуглардаг: ${esc(c.meeting_time)}</p>` : ""}
      <div class="club-card__actions">
        <button type="button" class="btn-plain" data-open="${c.id}">Дэлгэрэнгүй</button>
        ${joined
          ? `<button type="button" class="btn-red" data-leave="${c.id}">Клубээс гарах</button>`
          : `<button type="button" class="btn-blue" data-join="${c.id}" ${hasProfile() ? "" : "disabled"}>Элсэх</button>`}
      </div>
    </article>`;
}

function renderList() {
  if (state.loading) {
    $("clubCount").textContent = "";
    $("clubList").innerHTML = `<p class="empty">Ачаалж байна...</p>`;
    return;
  }

  if (!state.clubs.length) {
    $("clubCount").textContent = "";
    $("clubList").innerHTML = `<p class="empty">Клуб бүртгэгдээгүй байна. Supabase дээр 04_clubs.sql-ийг ажиллуулна уу.</p>`;
    return;
  }

  const list = filteredClubs();
  const filtering = state.search.trim() || state.category !== "all";
  $("clubCount").textContent = filtering
    ? `${list.length} клуб олдлоо`
    : `${state.clubs.length} клуб`;

  $("clubList").innerHTML = list.length
    ? list.map(clubCard).join("")
    : `<p class="empty">Тохирох клуб олдсонгүй. Өөр үгээр хайх эсвэл "Бүгд" ангиллыг сонгоно уу.</p>`;
}

function renderMine() {
  const mine = joinedClubs();
  $("joinedCount").textContent = mine.length;

  $("myList").innerHTML = mine.length
    ? mine.map((c) => `
        <li class="my-item">
          <button type="button" class="my-item__open" data-open="${c.id}">
            <span class="my-item__name">${esc(c.club_name)}</span>
            <span class="my-item__meta">${esc(c.meeting_time || c.category || "")}</span>
          </button>
          <button type="button" class="btn-remove" data-leave="${c.id}" aria-label="${esc(c.club_name)}-ээс гарах">Гарах</button>
        </li>`).join("")
    : `<li class="empty">Одоогоор клубт элсээгүй байна. Жагсаалтаас сонирхсон клубээ сонгоно уу.</li>`;
}

function renderAll() {
  $("lockedNote").hidden = state.loading || hasProfile();
  renderTabs();
  renderList();
  renderMine();
}


function openDetails(id) {
  const c = clubById(id);
  if (!c) return;
  state.openId = id;
  const joined = isJoined(id);

  const row = (label, value) =>
    value ? `<div><dt>${label}</dt><dd>${esc(value)}</dd></div>` : "";

  $("detailBody").innerHTML = `
    ${c.category ? `<p class="detail-cat"><span class="pill">${esc(c.category)}</span></p>` : ""}
    <h2 class="detail-title">${esc(c.club_name)}</h2>
    <p class="detail-desc">${esc(c.description)}</p>
    <dl class="profile-list detail-list">
      ${row("Цуглардаг цаг", c.meeting_time)}
      ${row("Байршил", c.location)}
      ${row("Ахлагч", c.leader_name)}
      ${row("Жишээ үйл ажиллагаа", c.example)}
    </dl>
  `;

  const action = $("detailAction");
  action.textContent = joined ? "Клубээс гарах" : "Элсэх";
  action.className = joined ? "btn-red" : "btn-blue";
  action.disabled = !joined && !hasProfile();

  if (!$("clubDialog").open) $("clubDialog").showModal();
}

function closeDetails() {
  $("clubDialog").close();
  state.openId = null;
}

$("detailClose").addEventListener("click", closeDetails);
$("clubDialog").addEventListener("click", (e) => {
  if (e.target === $("clubDialog")) closeDetails();
});

$("detailAction").addEventListener("click", async () => {
  const id = state.openId;
  if (!id || state.busy) return;
  const action = $("detailAction");
  action.disabled = true;
  action.textContent = "Түр хүлээнэ үү...";

  if (isJoined(id)) await leaveClub(id);
  else await joinClub(id);

  closeDetails();
});

$("searchInput").addEventListener("input", (e) => {
  state.search = e.target.value;
  renderList();
});

document.addEventListener("click", async (e) => {
  const cat = e.target.closest("[data-cat]");
  if (cat) {
    state.category = cat.dataset.cat;
    renderTabs();
    renderList();
    return;
  }

  const join = e.target.closest("[data-join]");
  if (join) {
    join.disabled = true;
    await joinClub(Number(join.dataset.join));
    return;
  }

  const leave = e.target.closest("[data-leave]");
  if (leave) {
    leave.disabled = true;
    await leaveClub(Number(leave.dataset.leave));
    return;
  }

  const open = e.target.closest("[data-open]");
  if (open) openDetails(Number(open.dataset.open));
});

$("logoutBtn").addEventListener("click", async () => {
  await db.auth.signOut();
  window.location.href = "index.html";
});

async function init() {
  const { data: { session } } = await db.auth.getSession();
  if (!session) {
    window.location.href = "index.html";
    return;
  }

  state.user = session.user;
  state.email = session.user.email;
  $("userEmail").textContent = state.email;
  renderAll();

  try {
    await Promise.all([loadStudent(), loadClubs()]);
    await loadMemberships();
  } catch (err) {
    showToast("Supabase-ээс уншихад алдаа гарлаа: " + explainError(err), "error");
  }

  state.loading = false;
  renderAll();
}

init();