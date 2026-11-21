(function () {
  const doctors = [
    { id: 'd1', name: 'Dr. Amara Odhiambo', specialty: 'Family Medicine', qualification: 'MBBS, MD (Family Medicine)', experience: 9, fee: 95, initials: 'AO', days: ['Mon','Tue','Wed','Thu','Fri'] },
    { id: 'd2', name: 'Dr. Felix Marchetti', specialty: 'Cardiology', qualification: 'MD, DM (Cardiology)', experience: 15, fee: 160, initials: 'FM', days: ['Mon','Wed','Fri'] },
    { id: 'd3', name: 'Dr. Priya Natarajan', specialty: 'Pediatrics', qualification: 'MBBS, MD (Pediatrics)', experience: 11, fee: 85, initials: 'PN', days: ['Tue','Wed','Thu','Fri'] },
    { id: 'd4', name: 'Dr. Owen Castillo', specialty: 'Dermatology', qualification: 'MBBS, MD (Dermatology)', experience: 7, fee: 110, initials: 'OC', days: ['Mon','Tue','Thu'] },
    { id: 'd5', name: 'Dr. Noor Al-Sayed', specialty: 'Orthopedics', qualification: 'MBBS, MS (Orthopedics)', experience: 13, fee: 140, initials: 'NA', days: ['Wed','Thu','Fri'] },
    { id: 'd6', name: 'Dr. Grace Tanaka', specialty: 'Family Medicine', qualification: 'MBBS, MD (Family Medicine)', experience: 6, fee: 90, initials: 'GT', days: ['Mon','Tue','Wed','Fri'] }
  ];

  const services = [
    { id: 's1', name: 'General check-up', desc: 'A full review of your overall health, including vitals and routine screening.', duration: '30 min', price: '$95' },
    { id: 's2', name: 'Cardiac consultation', desc: 'Heart health assessment, including ECG review if needed.', duration: '45 min', price: '$160' },
    { id: 's3', name: 'Child wellness visit', desc: 'Growth tracking, vaccinations, and development check for children.', duration: '30 min', price: '$85' },
    { id: 's4', name: 'Skin screening', desc: 'Examination of moles and skin concerns, with guidance on next steps.', duration: '20 min', price: '$110' },
    { id: 's5', name: 'Joint & mobility assessment', desc: 'Evaluation of joint pain, mobility limits, and a care plan going forward.', duration: '40 min', price: '$140' },
    { id: 's6', name: 'Follow-up visit', desc: 'A shorter visit to review progress after a prior appointment.', duration: '15 min', price: '$55' }
  ];

  const allSlotTimes = ['9:00 AM','9:30 AM','10:00 AM','10:30 AM','11:30 AM','1:00 PM','1:30 PM','2:30 PM','3:00 PM','4:00 PM'];

  let appointments = [];
  try {
    const saved = localStorage.getItem('lgc-appointments');
    if (saved) appointments = JSON.parse(saved);
  } catch (e) { appointments = []; }

  let takenSlotsByDoctorDate = {};
  try {
    const savedTaken = localStorage.getItem('lgc-taken');
    if (savedTaken) takenSlotsByDoctorDate = JSON.parse(savedTaken);
  } catch (e) { takenSlotsByDoctorDate = {}; }

  function persist() {
    try {
      localStorage.setItem('lgc-appointments', JSON.stringify(appointments));
      localStorage.setItem('lgc-taken', JSON.stringify(takenSlotsByDoctorDate));
    } catch (e) { /* storage unavailable, continue in-memory only */ }
  }

  // Tabs
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
      document.getElementById('view-' + btn.dataset.view).classList.add('active');
    });
  });

  // Doctors view
  const specialtyFilter = document.getElementById('specialtyFilter');
  const specialties = [...new Set(doctors.map(d => d.specialty))];
  specialties.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s; opt.textContent = s;
    specialtyFilter.appendChild(opt);
  });

  function renderDoctorGrid(filter) {
    const grid = document.getElementById('doctorGrid');
    const query = (document.getElementById('doctorSearch').value || '').trim().toLowerCase();
    grid.innerHTML = '';
    doctors
      .filter(d => filter === 'all' || d.specialty === filter)
      .filter(d => !query || d.name.toLowerCase().includes(query))
      .forEach(d => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <div class="doc-top">
          <div class="avatar">${d.initials}</div>
          <div>
            <div class="doc-name">${d.name}</div>
            <div class="doc-spec">${d.specialty}</div>
          </div>
        </div>
        <div class="doc-qual">${d.qualification}</div>
        <div class="doc-stats">
          <div><strong>${d.experience}</strong> yrs experience</div>
          <div><strong>$${d.fee}</strong> consultation</div>
        </div>
        <div class="doc-meta">Available ${d.days.join(', ')}</div>
        <button class="card-cta" data-doc="${d.id}">Book with ${d.name.split(' ')[1]}</button>
      `;
      grid.appendChild(card);
      });
    grid.querySelectorAll('.card-cta').forEach(btn => {
      btn.addEventListener('click', () => {
        document.getElementById('bookDoctor').value = btn.dataset.doc;
        document.querySelector('[data-view="book"]').click();
        updateSlotsForSelection();
      });
    });
  }
  specialtyFilter.addEventListener('change', () => renderDoctorGrid(specialtyFilter.value));
  document.getElementById('doctorSearch').addEventListener('input', () => renderDoctorGrid(specialtyFilter.value));
  renderDoctorGrid('all');

  document.getElementById('headerBookBtn').addEventListener('click', () => document.querySelector('[data-view="book"]').click());

  const themeToggle = document.getElementById('themeToggle');
  const storedTheme = (function () { try { return localStorage.getItem('lgc-theme'); } catch (e) { return null; } })();
  if (storedTheme) document.documentElement.setAttribute('data-theme', storedTheme);
  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('lgc-theme', next); } catch (e) { /* ignore */ }
  });

  // Services view
  const serviceList = document.getElementById('serviceList');
  services.forEach(s => {
    const row = document.createElement('div');
    row.className = 'service-row';
    row.innerHTML = `
      <div>
        <div class="service-name">${s.name}</div>
        <div class="service-desc">${s.desc}</div>
      </div>
      <div>
        <div class="service-price">${s.price}</div>
        <div class="service-dur">${s.duration}</div>
      </div>
    `;
    serviceList.appendChild(row);
  });

  // Booking view
  const bookDoctor = document.getElementById('bookDoctor');
  doctors.forEach(d => {
    const opt = document.createElement('option');
    opt.value = d.id; opt.textContent = `${d.name} — ${d.specialty}`;
    bookDoctor.appendChild(opt);
  });
  const bookService = document.getElementById('bookService');
  services.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.id; opt.textContent = s.name;
    bookService.appendChild(opt);
  });

  const bookDate = document.getElementById('bookDate');
  const todayStr = new Date().toISOString().split('T')[0];
  bookDate.min = todayStr;

  let selectedSlot = null;

  function keyFor(docId, date) { return docId + '|' + date; }

  function updateSlotsForSelection() {
    const docId = bookDoctor.value;
    const date = bookDate.value;
    const slotRow = document.getElementById('slotRow');
    const slotHint = document.getElementById('slotHint');
    slotRow.innerHTML = '';
    selectedSlot = null;
    updateSubmitState();

    if (!docId || !date) {
      slotHint.textContent = 'Choose a date first';
      return;
    }
    const dayName = new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' });
    const doc = doctors.find(d => d.id === docId);
    if (!doc.days.includes(dayName)) {
      slotHint.textContent = `${doc.name} isn't in on that day — try another date.`;
      return;
    }
    slotHint.textContent = 'Tap a time to select it';
    const taken = takenSlotsByDoctorDate[keyFor(docId, date)] || [];
    allSlotTimes.forEach(time => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'slot' + (taken.includes(time) ? ' taken' : '');
      btn.textContent = time;
      if (!taken.includes(time)) {
        btn.addEventListener('click', () => {
          slotRow.querySelectorAll('.slot').forEach(s => s.classList.remove('selected'));
          btn.classList.add('selected');
          selectedSlot = time;
          updateSubmitState();
          updateSummary();
        });
      } else {
        btn.disabled = true;
      }
      slotRow.appendChild(btn);
    });
  }
  bookDoctor.addEventListener('change', updateSlotsForSelection);
  bookDate.addEventListener('change', updateSlotsForSelection);

  function updateSummary() {
    const doc = doctors.find(d => d.id === bookDoctor.value);
    const svc = services.find(s => s.id === bookService.value);
    document.getElementById('sumDoctor').textContent = doc ? `${doc.name} ($${doc.fee})` : '—';
    document.getElementById('sumService').textContent = svc ? svc.name : '—';
    document.getElementById('sumDate').textContent = bookDate.value
      ? new Date(bookDate.value + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      : '—';
    document.getElementById('sumTime').textContent = selectedSlot || '—';
  }
  bookService.addEventListener('change', updateSummary);
  bookDoctor.addEventListener('change', updateSummary);

  const form = document.getElementById('bookingForm');
  const submitBtn = document.getElementById('submitBtn');
  function updateSubmitState() {
    const ready = bookDoctor.value && bookDate.value && selectedSlot &&
      document.getElementById('patName').value.trim() &&
      document.getElementById('patPhone').value.trim() &&
      document.getElementById('patEmail').value.trim();
    submitBtn.disabled = !ready;
  }
  ['patName','patPhone','patEmail'].forEach(id => {
    document.getElementById(id).addEventListener('input', updateSubmitState);
  });

  function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2600);
  }

  function renderAppointments() {
    const list = document.getElementById('apptList');
    const empty = document.getElementById('apptEmpty');
    list.innerHTML = '';
    if (appointments.length === 0) {
      empty.style.display = 'block';
      return;
    }
    empty.style.display = 'none';
    appointments.forEach(a => {
      const item = document.createElement('div');
      item.className = 'appt-item';
      item.innerHTML = `
        <span>${a.docName} · ${a.dateLabel} · ${a.time}</span>
        <button data-id="${a.id}">Cancel</button>
      `;
      list.appendChild(item);
    });
    list.querySelectorAll('button[data-id]').forEach(btn => {
      btn.addEventListener('click', () => cancelAppointment(btn.dataset.id));
    });
  }

  function cancelAppointment(id) {
    const appt = appointments.find(a => a.id === id);
    if (!appt) return;
    const key = keyFor(appt.docId, appt.rawDate);
    if (takenSlotsByDoctorDate[key]) {
      takenSlotsByDoctorDate[key] = takenSlotsByDoctorDate[key].filter(t => t !== appt.time);
    }
    appointments = appointments.filter(a => a.id !== id);
    persist();
    renderAppointments();
    updateSlotsForSelection();
    showToast('Appointment cancelled.');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const doc = doctors.find(d => d.id === bookDoctor.value);
    const svc = services.find(s => s.id === bookService.value);
    const date = bookDate.value;
    const dateLabel = new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

    const appt = {
      id: 'a' + Date.now(),
      docId: doc.id,
      docName: doc.name,
      serviceName: svc ? svc.name : 'General visit',
      rawDate: date,
      dateLabel: dateLabel,
      time: selectedSlot,
      patient: document.getElementById('patName').value.trim(),
      phone: document.getElementById('patPhone').value.trim(),
      email: document.getElementById('patEmail').value.trim(),
      notes: document.getElementById('patNotes').value.trim()
    };

    const key = keyFor(doc.id, date);
    if (!takenSlotsByDoctorDate[key]) takenSlotsByDoctorDate[key] = [];
    takenSlotsByDoctorDate[key].push(selectedSlot);

    appointments.push(appt);
    persist();
    renderAppointments();

    showToast(`Booked with ${doc.name} on ${dateLabel} at ${selectedSlot}`);

    form.reset();
    selectedSlot = null;
    updateSlotsForSelection();
    updateSummary();
    updateSubmitState();
  });

  renderAppointments();
  updateSummary();
})();
