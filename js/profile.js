

const CREDIT_LIMIT = 25;  
const DAYS = ["Даваа", "Мягмар", "Лхагва", "Пүрэв", "Баасан"];

const PERIODS = [
  { start: "08:00", end: "09:30" },
  { start: "09:40", end: "11:10" },
  { start: "11:20", end: "12:50" },
  { start: "13:30", end: "15:00" },
  { start: "15:10", end: "16:40" },
];

// Хуваарийн өнгө (хичээл бүрт өөр өнгө)
const COLORS = [
  { bg: "#e3edfd", line: "#2f6fd1" },
  { bg: "#e3f4ea", line: "#1e8a5b" },
  { bg: "#fdf0e1", line: "#d08a1e" },
  { bg: "#f1e8fb", line: "#7a45c2" },
  { bg: "#fde8ec", line: "#c2375a" },
  { bg: "#e2f4f5", line: "#16848c" },
  { bg: "#eef1d9", line: "#6f7d12" },
];



const COURSES = [
  
  { code: "S.ETM100", name: "Эдийн засгийн онолын үндэс", credit: 3, teacherCode: "J.IM05", teacher: "М.БУРМАА", semester: 1,
    sessions: [{ day: 0, period: 0, type: "Лекц" }, { day: 2, period: 0, type: "Семинар" }] },
  { code: "F.CSA101", name: "Мэргэжлийн удиртгал", credit: 2, teacherCode: "F.CS06", teacher: "Ж.АЛИМАА", semester: 1,
    sessions: [{ day: 1, period: 0, type: "Лекц" }] },
  { code: "S.CFM100", name: "Программчлалын үндэс", credit: 3, teacherCode: "F.IT15", teacher: "М.ТУНГАЛАГ", semester: 1,
    sessions: [{ day: 0, period: 1, type: "Лекц" }, { day: 3, period: 1, type: "Лаборатори" }] },
  { code: "S.MLM101", name: "Хэл ярианы соёл", credit: 3, teacherCode: "B.RS99", teacher: "Д.ДУЛАМСҮРЭН", semester: 1,
    sessions: [{ day: 1, period: 1, type: "Лекц" }, { day: 4, period: 0, type: "Семинар" }] },
  { code: "S.MTM131", name: "Математик 1С", credit: 3, teacherCode: "E.MT13", teacher: "С.УРАНЧИМЭГ", semester: 1,
    sessions: [{ day: 0, period: 2, type: "Лекц" }, { day: 2, period: 1, type: "Семинар" }] },
  { code: "S.PHM101", name: "Физик I", credit: 3, teacherCode: "F.PH84", teacher: "О.ЭРДЭНЭТУЯА", semester: 1,
    sessions: [{ day: 1, period: 2, type: "Лекц" }, { day: 3, period: 2, type: "Лаборатори" }] },
  { code: "S.PTM101", name: "Биеийн тамир", credit: 2, teacherCode: "J.PT11", teacher: "М.АМАРЖАРГАЛ", semester: 1,
    sessions: [{ day: 4, period: 1, type: "Дасгал" }] },

  { code: "S.MHM101", name: "Монголын түүх", credit: 3, teacherCode: "K.SS54", teacher: "С.БОЛОРМАА", semester: 2,
    sessions: [{ day: 0, period: 3, type: "Лекц" }, { day: 2, period: 2, type: "Семинар" }] },
  { code: "F.CSM202", name: "Объект хандлагат программчлал", credit: 3, teacherCode: "F.CS12", teacher: "А.ОТГОНБАЯР", semester: 2,
    sessions: [{ day: 1, period: 3, type: "Лекц" }, { day: 3, period: 3, type: "Лаборатори" }] },
  { code: "F.CSM101", name: "Программчлалын үндсэн аргууд", credit: 3, teacherCode: "F.CS16", teacher: "Э.БАТЦЭЦЭГ", semester: 2,
    sessions: [{ day: 0, period: 4, type: "Лекц" }, { day: 4, period: 2, type: "Лаборатори" }] },
  { code: "S.MTM132", name: "Математик 2С", credit: 3, teacherCode: "E.MT13", teacher: "С.УРАНЧИМЭГ", semester: 2,
    sessions: [{ day: 1, period: 4, type: "Лекц" }, { day: 2, period: 3, type: "Семинар" }] },
  { code: "S.PHM102", name: "Физик II", credit: 3, teacherCode: "F.MS12", teacher: "С.ЦЭРЭНБАЛЖИД", semester: 2,
    sessions: [{ day: 3, period: 0, type: "Лекц" }, { day: 4, period: 3, type: "Лаборатори" }] },
  { code: "S.CDM101", name: "Гамшгаас хамгаалах менежмент", credit: 1, teacherCode: "F.PH32", teacher: "М.АМГАЛАН", semester: 2,
    sessions: [{ day: 2, period: 4, type: "Лекц" }] },
  { code: "S.CEM101", name: "Харилцааны англи хэл", credit: 3, teacherCode: "B.RS69", teacher: "Т.МӨНХТУЯА", semester: 2,
    sessions: [{ day: 3, period: 4, type: "Лекц" }, { day: 4, period: 4, type: "Семинар" }] },
];


const state = {
  user: null,
  email: "",
  studentId: null,       
  profile: {},
  selected: [],          
  regIdByCode: {},      
  courseIdByCode: {},    
  openCode: null,
  loading: true,
  busy: false,
};

const $ = (id) => document.getElementById(id);


function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

const courseByCode = (code) => COURSES.find((c) => c.code === code);
const isSelected = (code) => state.selected.includes(code);
const colorOf = (code) => COLORS[COURSES.findIndex((c) => c.code === code) % COLORS.length];

function selectedCourses() {
  return state.selected.map(courseByCode).filter(Boolean);
}


function totalCredits() {
  return selectedCourses().reduce((sum, c) => sum + c.credit, 0);
}

function sessionText(s) {
  const p = PERIODS[s.period];
  return `${DAYS[s.day]} ${p.start}–${p.end} · ${s.type}`;
}

function findConflict(course) {
  for (const other of selectedCourses()) {
    if (other.code === course.code) continue;
    for (const s of course.sessions) {
      const clash = other.sessions.find((o) => o.day === s.day && o.period === s.period);
      if (clash) return { other, session: s };
    }
  }
  return null;
}

function blockReason(course) {
  if (!state.courseIdByCode[course.code]) {
    return "Энэ хичээл Supabase-ийн courses хүснэгтэд бүртгэгдээгүй байна. 03_courses_registrations.sql-ийг ажиллуулна уу.";
  }
  const total = totalCredits();
  if (total + course.credit > CREDIT_LIMIT) {
    return ` ${total} + ${course.credit} = ${total + course.credit} кредит болж ${CREDIT_LIMIT} кредитийн хязгаараас хэтэрнэ.`;
  }
  const conflict = findConflict(course);
  if (conflict) {
    const p = PERIODS[conflict.session.period];
    return `${DAYS[conflict.session.day]} ${p.start} цагт "${conflict.other.name}" хичээлтэй давхцаж байна.`;
  }
  return null;
}

let toastTimer;
function showToast(message, type = "success") {
  const toast = $("toast");
  toast.textContent = message;
  toast.className = `toast toast--${type} is-visible`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 4000);
}

async function loadStudent() {
  const { data, error } = await db
    .from("students")
    .select("id, student_code, first_name, last_name, major, class_name")
    .eq("user_id", state.user.id)
    .maybeSingle();

  if (error) throw error;
  if (data) {
    state.studentId = data.id;
    state.profile = data;
  }
}

async function loadCourseIds() {
  const { data, error } = await db
    .from("courses")
    .select("id, course_code")
    .in("course_code", COURSES.map((c) => c.code));

  if (error) throw error;
  state.courseIdByCode = {};
  (data || []).forEach((row) => { state.courseIdByCode[row.course_code] = row.id; });
}

async function loadRegistrations() {
  state.selected = [];
  state.regIdByCode = {};
  if (!state.studentId) return;

  const { data, error } = await db
    .from("registrations")
    .select("id, course_id")
    .eq("student_id", state.studentId);

  if (error) throw error;

  const codeById = {};
  Object.entries(state.courseIdByCode).forEach(([code, id]) => { codeById[id] = code; });

  (data || []).forEach((reg) => {
    const code = codeById[reg.course_id];
    if (code) {
      state.selected.push(code);
      state.regIdByCode[code] = reg.id;
    }
  });
}


function hasProfile() {
  return Boolean(state.studentId);
}

function renderProfile() {
  const p = state.profile;
  $("pName").textContent = [p.first_name, p.last_name].filter(Boolean).join(" ") || "—";
  $("pCode").textContent = p.student_code || "—";
  $("pMajor").textContent = p.major || "—";
  $("pClass").textContent = p.class_name || "—";
  $("pEmail").textContent = state.email || "—";

  $("lockedNote").hidden = hasProfile();
  $("courseArea").hidden = !hasProfile();
}

function setFieldError(id, message) {
  const input = $(id);
  input.classList.toggle("is-invalid", Boolean(message));
  if (id === "fFirstName") $("fFirstNameError").textContent = message || "";
}

function openEdit() {
  const p = state.profile;
  $("fFirstName").value = p.first_name || "";
  $("fLastName").value = p.last_name || "";
  $("fCode").value = p.student_code || "";
  $("fMajor").value = p.major || "";
  $("fClass").value = p.class_name || "";
  ["fFirstName", "fLastName", "fCode"].forEach((id) => setFieldError(id, ""));

  $("profileView").hidden = true;
  $("profileForm").hidden = false;
  $("editBtn").hidden = true;
  $("cancelBtn").hidden = !hasProfile();
  $("fFirstName").focus();
}

function closeEdit() {
  $("profileForm").hidden = true;
  $("profileView").hidden = false;
  $("editBtn").hidden = false;
}

$("editBtn").addEventListener("click", openEdit);
$("cancelBtn").addEventListener("click", closeEdit);

$("profileForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    first_name: $("fFirstName").value.trim(),
    last_name: $("fLastName").value.trim(),
    student_code: $("fCode").value.trim().toUpperCase(),
    major: $("fMajor").value.trim() || null,
    class_name: $("fClass").value.trim() || null,
  };

  ["fFirstName", "fLastName", "fCode"].forEach((id) => setFieldError(id, ""));
  const missing = [];
  if (!data.first_name) { setFieldError("fFirstName", "Нэрээ оруулна уу."); missing.push("нэр"); }
  if (!data.last_name) { setFieldError("fLastName", "x"); missing.push("овог"); }
  if (!data.student_code) { setFieldError("fCode", "x"); missing.push("оюутны код"); }
  if (missing.length) {
    showToast(`Дараах талбарыг бөглөнө үү: ${missing.join(", ")}.`, "error");
    return;
  }

  const saveBtn = $("profileForm").querySelector("[type=submit]");
  saveBtn.disabled = true;
  saveBtn.textContent = "Хадгалж байна...";


  const { data: row, error } = await db
    .from("students")
    .upsert({ user_id: state.user.id, ...data }, { onConflict: "user_id" })
    .select("id, student_code, first_name, last_name, major, class_name")
    .single();

  saveBtn.disabled = false;
  saveBtn.textContent = "Хадгалах";

  if (error) {
    showToast(
      error.code === "23505"
        ? "Энэ оюутны код өөр хүнд бүртгэлтэй байна."
        : "Хадгалах үед алдаа гарлаа: " + error.message,
      "error"
    );
    return;
  }

  const firstTime = !hasProfile();
  state.studentId = row.id;
  state.profile = row;
  closeEdit();
  if (firstTime) await loadRegistrations().catch(() => {});
  renderAll();
  showToast(" Мэдээлэл Supabase-д хадгалагдлаа.");

  if (firstTime) {
    $("coursesSection").scrollIntoView({ behavior: "smooth", block: "start" });
  }
});


function courseRow(c) {
  const selected = isSelected(c.code);
  return `
    <button type="button" class="course-row ${selected ? "is-selected" : ""}" data-open="${esc(c.code)}">
      <span>
        <span class="course-row__name">${esc(c.name)}</span>
        <span class="course-row__meta">${esc(c.code)} ·  ${esc(c.teacher)}</span>
      </span>
      <span class="course-row__side">
        ${selected ? `<span class="pill pill--ok">✓ Сонгосон</span>` : ""}
        <span class="pill">${c.credit} кр</span>
      </span>
    </button>`;
}

let searchText = "";

function renderCourseList() {
  if (state.loading) {
    $("courseCount").textContent = "";
    $("courseList").innerHTML = `<p class="empty">Ачаалж байна...</p>`;
    return;
  }

  // COURSES → filter() → тохирох хичээлүүд
  const q = searchText.trim().toLowerCase();
  const list = COURSES.filter((c) =>
    !q || [c.name, c.code, c.teacher, c.teacherCode].some((v) => v.toLowerCase().includes(q))
  );

  $("courseCount").textContent = hasProfile()
    ? (q ? `${list.length} хичээл олдлоо` : `${COURSES.length} хичээл`)
    : "";

  $("courseList").innerHTML = list.length
    ? list.map(courseRow).join("")
    : `<p class="empty">"${esc(searchText)}" гэсэн хичээл олдсонгүй. Өөр үгээр хайж үзнэ үү.</p>`;
}


$("searchInput").addEventListener("input", (e) => {
  searchText = e.target.value;
  renderCourseList();
});


function openDetails(code) {
  const c = courseByCode(code);
  if (!c) return;
  state.openCode = code;

  const selected = isSelected(code);
  const reason = selected ? null : blockReason(c);

  $("detailBody").innerHTML = `
    <h2 class="detail-title">${esc(c.name)}</h2>
    <dl class="profile-list detail-list">
      <div><dt>Хичээлийн код</dt><dd>${esc(c.code)}</dd></div>
      <div><dt>Кредит</dt><dd>${c.credit} кр</dd></div>
      <div><dt>Багшийн нэр</dt><dd> ${esc(c.teacher)}</dd></div>
      <div><dt>Багшийн код</dt><dd>${esc(c.teacherCode)}</dd></div>
      <div><dt>Хуваарь</dt><dd>
        <ul class="sessions">${c.sessions.map((s) => `<li> ${esc(sessionText(s))}</li>`).join("")}</ul>
      </dd></div>
    </dl>
    ${reason ? `<p class="detail-warn">${esc(reason)}</p>` : ""}
  `;

  const action = $("detailAction");
  action.textContent = selected ? "Хасах" : "Сонгох";
  action.className = selected ? "btn-red" : "btn-blue";
  action.disabled = !selected && (Boolean(reason) || !hasProfile());

  if (!$("courseDialog").open) $("courseDialog").showModal();
}

function closeDetails() {
  $("courseDialog").close();
  state.openCode = null;
}

$("detailClose").addEventListener("click", closeDetails);

$("courseDialog").addEventListener("click", (e) => {
  if (e.target === $("courseDialog")) closeDetails();
});

$("detailAction").addEventListener("click", async () => {
  const code = state.openCode;
  if (!code || state.busy) return;

  const action = $("detailAction");
  action.disabled = true;
  action.textContent = "Түр хүлээнэ үү...";

  if (isSelected(code)) await removeCourse(code);
  else await addCourse(code);

  closeDetails();
});


async function addCourse(code) {
  const c = courseByCode(code);
  if (!c || isSelected(code)) return;

  if (!state.studentId) {
    showToast("Эхлээд мэдээллээ бөглөж хадгална уу.", "warn");
    return;
  }

  const reason = blockReason(c);
  if (reason) {
    showToast(reason, "error");
    return;
  }

  state.busy = true;
  const { data, error } = await db
    .from("registrations")
    .insert({ student_id: state.studentId, course_id: state.courseIdByCode[code] })
    .select("id")
    .single();
  state.busy = false;

  if (error) {
    if (error.code === "23505") {
      showToast(" Та энэ хичээлийг аль хэдийн сонгосон байна.", "warn");
      await loadRegistrations().catch(() => {});
      renderAll();
    } else if (String(error.message).includes("CREDIT_LIMIT")) {
      showToast(` ${CREDIT_LIMIT} кредитийн дээд хязгаарт хүрсэн байна.`, "error");
    } else {
      showToast("Хадгалах үед алдаа гарлаа: " + error.message, "error");
    }
    return;
  }

  state.selected.push(code);
  state.regIdByCode[code] = data.id;
  renderAll();
  showToast(` "${c.name}" сонгогдлоо. Нийт ${totalCredits()} кредит.`);
}

async function removeCourse(code) {
  const c = courseByCode(code);
  const regId = state.regIdByCode[code];
  if (!regId) return;

  state.busy = true;
  const { error } = await db.from("registrations").delete().eq("id", regId);
  state.busy = false;

  if (error) {
    showToast("Хасах үед алдаа гарлаа: " + error.message, "error");
    return;
  }

  state.selected = state.selected.filter((x) => x !== code);
  delete state.regIdByCode[code];
  renderAll();
  showToast(` "${c ? c.name : code}" хасагдлаа.`, "info");
}

function renderSelection() {
  const total = totalCredits();
  const left = CREDIT_LIMIT - total;

  $("creditValue").textContent = `${total} / ${CREDIT_LIMIT}`;
  $("creditMeter").querySelector("span").style.width = Math.min(100, (total / CREDIT_LIMIT) * 100) + "%";
  $("creditMeter").classList.toggle("is-warn", left <= 3);
  $("creditHint").textContent = left > 0
    ? `Дахиад ${left} кредит сонгох боломжтой.`
    : `${CREDIT_LIMIT} кредитийн дээд хязгаарт хүрсэн байна.`;

  const courses = selectedCourses();
  $("myList").innerHTML = courses.length
    ? courses.map((c) => `
        <li class="my-item">
          <button type="button" class="my-item__open" data-open="${esc(c.code)}">
            <span class="my-item__name">${esc(c.name)}</span>
            <span class="my-item__meta">${esc(c.code)} · ${c.credit} кр · ${esc(c.teacher)}</span>
          </button>
          <button type="button" class="btn-remove" data-remove="${esc(c.code)}" aria-label="${esc(c.name)} хасах">Хасах</button>
        </li>`).join("")
    : `<li class="empty">Одоогоор хичээл сонгоогүй байна. Жагсаалтаас хичээл дээр дарж сонгоно уу.</li>`;
}

function renderTimetable() {
  const courses = selectedCourses();

  $("timetableHint").textContent = courses.length
    ? `${courses.length} хичээл · нийт ${totalCredits()} кредит. Хичээл дээр дарж дэлгэрэнгүйг харна уу.`
    : "Хичээл сонгоход энд хуваарь гарч ирнэ.";

  const grid = DAYS.map(() => PERIODS.map(() => null));
  courses.forEach((c) =>
    c.sessions.forEach((s) => { grid[s.day][s.period] = { course: c, session: s }; })
  );

  const head = `
    <thead><tr>
      <th class="tt-time-head">Цаг</th>
      ${DAYS.map((d) => `<th>${d}</th>`).join("")}
    </tr></thead>`;

  const body = PERIODS.map((p, pi) => `
    <tr>
      <td class="tt-time">${p.start}<br />${p.end}</td>
      ${DAYS.map((_, di) => {
        const cell = grid[di][pi];
        if (!cell) return "<td></td>";
        const color = colorOf(cell.course.code);
        return `
          <td>
            <button type="button" class="tt-chip" data-open="${esc(cell.course.code)}"
              style="background:${color.bg}; border-left-color:${color.line}">
              <span class="tt-chip__name">${esc(cell.course.name)}</span>
              <span class="tt-chip__meta">${esc(cell.session.type)} · ${esc(cell.course.teacher)}</span>
            </button>
          </td>`;
      }).join("")}
    </tr>`).join("");

  $("timetable").innerHTML = head + `<tbody>${body}</tbody>`;
}

function renderAll() {
  renderProfile();
  renderCourseList();
  renderSelection();
  renderTimetable();
}

document.addEventListener("click", async (e) => {
  const remove = e.target.closest("[data-remove]");
  if (remove) {
    if (state.busy) return;
    remove.disabled = true;
    await removeCourse(remove.dataset.remove);
    return;
  }
  const open = e.target.closest("[data-open]");
  if (open) openDetails(open.dataset.open);
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
    await Promise.all([loadStudent(), loadCourseIds()]);
    await loadRegistrations();

    const missing = COURSES.filter((c) => !state.courseIdByCode[c.code]).length;
    if (missing) {
      showToast(` ${missing} хичээл Supabase-ийн courses хүснэгтэд алга. 03_courses_registrations.sql-ийг ажиллуулна уу.`, "warn");
    }
  } catch (err) {
    showToast("Supabase-ээс уншихад алдаа гарлаа: " + err.message, "error");
  }

  state.loading = false;
  renderAll();

  if (!hasProfile()) openEdit();
}

init();