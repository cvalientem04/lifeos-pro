    // =========================================================================
    // --- ESTUDIO DE FUERZA (DISEÑO ORIGINAL Y SOFISTICADO) ---
    // =========================================================================
    let activeWorkout = {
      running: false,
      title: 'Día de Pecho',
      startTimeMs: 0,
      elapsedSec: 0,
      timerId: null,
      restRemainingSec: 0,
      restTimerId: null,
      photoDataUrl: '',
      exercises: []
    };

    function getExById(id) {
      return EXERCISE_CATALOG.find(e => e.id === id) || EXERCISE_CATALOG[0];
    }

    function showGymSubview(sub) {
      ['hub', 'active', 'save', 'goodjob'].forEach(s => {
        const el = document.getElementById('gym-subview-' + s);
        if (el) el.classList.toggle('hidden', s !== sub);
      });
    }

    function renderGymSection() {
      if (activeWorkout.running) {
        showGymSubview('active');
        renderActiveWorkoutExercises();
      } else {
        showGymSubview('hub');
        renderHevyRoutinesHub();
        renderClearStrengthProgress();
      }
    }

    function renderHevyRoutinesHub() {
      const box = document.getElementById('hevyRoutinesList');
      box.innerHTML = appState.routines.map(r => {
        const names = r.exerciseIds.map(id => getExById(id).name).join(' • ');
        return `
          <div class="studio-card rounded-2xl p-4 space-y-3 border-l-4 border-l-emerald-500">
            <div class="flex items-center justify-between gap-2">
              <h4 class="text-sm sm:text-base font-extrabold text-white truncate">${r.title}</h4>
              <span class="text-[10px] font-mono px-2 py-1 rounded-full bg-slate-800 text-slate-300 shrink-0">${r.exerciseIds.length} ej</span>
            </div>
            <p class="text-xs text-slate-400 line-clamp-2">${names || 'Sin ejercicios'}</p>
            <div class="flex gap-2">
              <button onclick="startRoutineWorkout('${r.id}')" class="flex-1 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-extrabold text-xs shadow-md">
                ▶ Empezar Plan
              </button>
              <button onclick="openExercisePickerForRoutine('${r.id}')" class="px-3 py-2.5 rounded-xl border border-emerald-500/30 text-emerald-400 text-xs font-bold shrink-0">
                + Editar
              </button>
            </div>
          </div>
        `;
      }).join('');
    }

    function startRoutineWorkout(routineId) {
      const r = appState.routines.find(x => x.id === routineId) || appState.routines[0];
      activeWorkout.running = true;
      activeWorkout.title = r.title;
      activeWorkout.startTimeMs = Date.now();
      activeWorkout.elapsedSec = 0;
      activeWorkout.photoDataUrl = '';
      activeWorkout.exercises = r.exerciseIds.map(id => {
        const meta = getExById(id);
        const def = (appState.exerciseDefaults && appState.exerciseDefaults[id]) || {
          kg: meta.defaultKg,
          reps: meta.defaultReps,
          prev: meta.prev
        };
        return {
          id: meta.id,
          name: meta.name,
          muscle: meta.muscle,
          prev: def.prev,
          sets: [
            { kg: def.kg, reps: def.reps, done: false },
            { kg: def.kg, reps: def.reps, done: false },
            { kg: def.kg, reps: def.reps, done: false }
          ]
        };
      });
      startActiveWorkoutClock();
      showGymSubview('active');
      renderActiveWorkoutExercises();
    }

    function startEmptyWorkout() {
      activeWorkout.running = true;
      activeWorkout.title = 'Sesión de Fuerza Libre';
      activeWorkout.startTimeMs = Date.now();
      activeWorkout.elapsedSec = 0;
      activeWorkout.photoDataUrl = '';
      activeWorkout.exercises = [];
      startActiveWorkoutClock();
      showGymSubview('active');
      renderActiveWorkoutExercises();
      openExercisePickerModal('ACTIVE');
    }

    function startActiveWorkoutClock() {
      if (activeWorkout.timerId) clearInterval(activeWorkout.timerId);
      activeWorkout.timerId = setInterval(() => {
        if (!activeWorkout.running) return;
        activeWorkout.elapsedSec = Math.floor((Date.now() - activeWorkout.startTimeMs) / 1000);
        const m = Math.floor(activeWorkout.elapsedSec / 60);
        const s = activeWorkout.elapsedSec % 60;
        const txt = m > 0 ? `${m}m ${s}s` : `${s}s`;
        const el = document.getElementById('liveWorkoutDuration');
        if (el) el.textContent = txt;
        const mb = document.getElementById('minBannerTimer');
        if (mb) mb.textContent = `${txt} ➔ Volver`;
      }, 1000);
    }

    function startRestCountdown(seconds = 90) {
      if (activeWorkout.restTimerId) clearInterval(activeWorkout.restTimerId);
      activeWorkout.restRemainingSec = seconds;
      const lbl = document.getElementById('restTimerText');
      activeWorkout.restTimerId = setInterval(() => {
        activeWorkout.restRemainingSec--;
        if (activeWorkout.restRemainingSec <= 0) {
          clearInterval(activeWorkout.restTimerId);
          if (lbl) lbl.textContent = '¡Listo!';
          return;
        }
        const m = Math.floor(activeWorkout.restRemainingSec / 60);
        const s = String(activeWorkout.restRemainingSec % 60).padStart(2, '0');
        if (lbl) lbl.textContent = `${m}:${s}`;
      }, 1000);
    }

    function renderActiveWorkoutExercises() {
      document.getElementById('activeWorkoutHeaderTitle').textContent = activeWorkout.title;
      document.getElementById('minBannerTitle').textContent = activeWorkout.title;

      let totalVol = 0, doneSets = 0, totalSets = 0;
      const activeMuscles = [];

      activeWorkout.exercises.forEach(ex => {
        if (!activeMuscles.includes(ex.muscle)) activeMuscles.push(ex.muscle);
        ex.sets.forEach(st => {
          totalSets++;
          if (st.done) {
            doneSets++;
            totalVol += (Number(st.kg) || 0) * (Number(st.reps) || 0);
          }
        });
      });

      document.getElementById('liveWorkoutVolume').textContent = `${totalVol.toLocaleString()} kg`;
      document.getElementById('liveWorkoutSets').textContent = `${doneSets}/${totalSets}`;
      const pct = totalSets > 0 ? Math.round((doneSets / totalSets) * 100) : 0;
      document.getElementById('activeWorkoutProgressBar').style.width = pct + '%';
      document.getElementById('miniBodyMapTop').innerHTML = getAnatomyBodyMapSVG(activeMuscles);

      const container = document.getElementById('activeWorkoutExercisesContainer');
      if (activeWorkout.exercises.length === 0) {
        container.innerHTML = `<p class="text-xs text-slate-500 text-center py-6">Pulsa "+ Añadir Ejercicios" abajo para marcar varios ejercicios a la vez.</p>`;
        return;
      }

      container.innerHTML = activeWorkout.exercises.map((ex, exIdx) => {
        const best1RM = Math.max(...ex.sets.map(s => Math.round((Number(s.kg) || 0) * (1 + (Number(s.reps) || 0) / 30))), 0);
        return `
          <div class="studio-card rounded-2xl p-3.5 space-y-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2.5">
                ${getRoundExerciseAvatar(ex.muscle)}
                <div>
                  <h4 class="text-sm font-extrabold text-emerald-400 leading-tight">${ex.name}</h4>
                  <span class="text-[10px] text-slate-400">${ex.muscle} • 1RM Est: <b class="text-amber-300 font-mono">${best1RM} kg</b></span>
                </div>
              </div>
              <button onclick="removeExerciseFromActive(${exIdx})" class="text-slate-500 hover:text-rose-400 text-xs px-2">✕</button>
            </div>

            <div class="grid grid-cols-12 gap-1.5 text-[10px] font-bold uppercase text-slate-400 px-2 text-center">
              <div class="col-span-2">SERIE</div>
              <div class="col-span-4">ANTERIOR</div>
              <div class="col-span-2">KG</div>
              <div class="col-span-2">REPES</div>
              <div class="col-span-2">OK</div>
            </div>

            <div class="space-y-1.5">
              ${ex.sets.map((st, setIdx) => `
                <div class="grid grid-cols-12 gap-1.5 items-center p-1.5 rounded-xl border border-transparent transition ${st.done ? 'set-row-completed' : 'bg-slate-900/70'}">
                  <div class="col-span-2 text-center">
                    <span class="inline-block w-6 h-6 rounded-lg bg-slate-800 text-xs font-extrabold leading-6 text-white">${setIdx + 1}</span>
                  </div>
                  <div class="col-span-4 text-center text-xs font-mono text-slate-400">${ex.prev}</div>
                  <div class="col-span-2">
                    <input type="number" step="0.5" value="${st.kg}" onchange="updateSetVal(${exIdx}, ${setIdx}, 'kg', this.value)" onfocus="this.select()" class="w-full bg-slate-950 border border-slate-700 rounded-lg py-1 text-center text-xs font-extrabold text-white">
                  </div>
                  <div class="col-span-2">
                    <input type="number" value="${st.reps}" onchange="updateSetVal(${exIdx}, ${setIdx}, 'reps', this.value)" onfocus="this.select()" class="w-full bg-slate-950 border border-slate-700 rounded-lg py-1 text-center text-xs font-extrabold text-white">
                  </div>
                  <div class="col-span-2 flex justify-center">
                    <button onclick="toggleSetCheck(${exIdx}, ${setIdx})" class="w-8 h-7 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 font-extrabold text-xs flex items-center justify-center transition ${st.done ? 'check-btn-completed' : ''}">
                      ✓
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>

            <button onclick="addSetToExercise(${exIdx})" class="w-full py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-bold text-slate-200 transition">
              + Añadir Serie
            </button>
          </div>
        `;
      }).join('');
    }

    function updateSetVal(exIdx, setIdx, field, val) {
      activeWorkout.exercises[exIdx].sets[setIdx][field] = parseFloat(val) || 0;
      renderActiveWorkoutExercises();
    }

    function toggleSetCheck(exIdx, setIdx) {
      const st = activeWorkout.exercises[exIdx].sets[setIdx];
      st.done = !st.done;
      if (st.done) {
        const ex = activeWorkout.exercises[exIdx];
        const catItem = EXERCISE_CATALOG.find(c => c.id === ex.id);
        if (catItem) catItem.prev = `${st.kg}kg x ${st.reps}`;
        startRestCountdown(90);
      }
      renderActiveWorkoutExercises();
    }

    function addSetToExercise(exIdx) {
      const sets = activeWorkout.exercises[exIdx].sets;
      const last = sets[sets.length - 1] || { kg: 60, reps: 10 };
      sets.push({ kg: last.kg, reps: last.reps, done: false });
      renderActiveWorkoutExercises();
    }

    function removeExerciseFromActive(exIdx) {
      activeWorkout.exercises.splice(exIdx, 1);
      renderActiveWorkoutExercises();
    }

    function openSaveWorkoutScreen() {
      let totalVol = 0, doneSets = 0;
      activeWorkout.exercises.forEach(ex => {
        ex.sets.forEach(st => { if (st.done) { doneSets++; totalVol += (Number(st.kg) || 0) * (Number(st.reps) || 0); } });
      });

      if (doneSets === 0) {
        if (!confirm('⚠️ No has marcado ninguna serie con ✓.\n\nDale a ACEPTAR si quieres marcar todas como hechas y guardar, o CANCELAR para volver y darle a Discard.')) {
          return; // Te deja volver para que le des al botón rojo de Discard Workout
        } else {
          activeWorkout.exercises.forEach(ex => ex.sets.forEach(st => { st.done = true; doneSets++; totalVol += (Number(st.kg)||0) * (Number(st.reps)||0); }));
        }
      }
      // ... resto del código que ya tienes

      const mins = Math.max(1, Math.round(activeWorkout.elapsedSec / 60));
      document.getElementById('saveWorkoutTitleInput').value = activeWorkout.title;
      document.getElementById('saveScreenDuration').textContent = `${mins}min`;
      document.getElementById('saveScreenVolume').textContent = `${totalVol.toLocaleString()} kg`;
      document.getElementById('saveScreenSets').textContent = doneSets;
      showGymSubview('save');
    }

    function backToActiveWorkout() { showGymSubview('active'); }

    function handleHevyPhotoSelect(ev) {
      const file = ev.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        activeWorkout.photoDataUrl = e.target.result;
        document.getElementById('photoUploadLabelText').textContent = '✔ Foto lista para guardar';
        const prev = document.getElementById('savePhotoPreviewBox');
        prev.classList.remove('hidden');
        prev.innerHTML = `<img src="${activeWorkout.photoDataUrl}" class="w-full h-40 object-cover rounded-2xl border border-slate-700"/>`;
      };
      reader.readAsDataURL(file);
    }

    function confirmAndSaveHevyWorkout() {
      if (activeWorkout.timerId) clearInterval(activeWorkout.timerId);
      activeWorkout.running = false;
      appState.workoutCount = (appState.workoutCount || 18) + 1;

      const title = document.getElementById('saveWorkoutTitleInput').value.trim() || activeWorkout.title;
      const note = document.getElementById('saveWorkoutDescInput').value.trim() || 'Sesión completada.';
      const mins = Math.max(1, Math.round(activeWorkout.elapsedSec / 60));

      let totalVol = 0, setsCount = 0;
      const muscles = [];
      const summaryLines = [];

      if (!appState.exerciseDefaults) appState.exerciseDefaults = {};

      activeWorkout.exercises.forEach(ex => {
        if (!muscles.includes(ex.muscle)) muscles.push(ex.muscle);
        const doneList = ex.sets.filter(s => s.done);
        if (doneList.length > 0) {
          const bestKg = Math.max(...doneList.map(s => s.kg));
          const lastSet = doneList[doneList.length - 1];
          appState.exerciseDefaults[ex.id] = {
            kg: lastSet.kg,
            reps: lastSet.reps,
            prev: `${bestKg}kg x ${lastSet.reps}`
          };
          summaryLines.push(`${doneList.length}x ${ex.name} (${bestKg}kg)`);
          doneList.forEach(s => {
            setsCount++;
            totalVol += (Number(s.kg) || 0) * (Number(s.reps) || 0);
          });
        }
      });

      appState.workoutFeed.unshift({
        id: Date.now(),
        user: 'Tú (@cvalientem04)',
        date: currentDate,
        title,
        duration: `${mins}min`,
        volumeKg: totalVol,
        setsCount,
        muscles,
        summaryLines,
        note,
        photoUrl: activeWorkout.photoDataUrl,
        likes: 1
      });

      document.getElementById('goodJobCountSubtitle').textContent = `Sesión #${appState.workoutCount} registrada en tu historial`;
      document.getElementById('goodJobCardTitle').textContent = title;
      document.getElementById('goodJobCardVolBadge').textContent = `${totalVol.toLocaleString()} kg`;
      document.getElementById('goodJobCardExercisesList').innerHTML = summaryLines.map(line => {
        const parts = line.split(' ');
        const count = parts.shift();
        return `<p class="truncate"><b class="text-emerald-400 font-mono mr-1">${count}</b> <span class="text-slate-200">${parts.join(' ')}</span></p>`;
      }).join('');
      document.getElementById('goodJobAnatomyBox').innerHTML = getAnatomyBodyMapSVG(muscles);

      saveToStorage();
      showGymSubview('goodjob');
    }

    function finishGoodJobAndGoHome() {
      showGymSubview('hub');
      switchTab('home');
    }

    function discardActiveWorkout() {
      if (!confirm('¿Seguro que quieres descartar esta sesión?')) return;
      if (activeWorkout.timerId) clearInterval(activeWorkout.timerId);
      activeWorkout.running = false;
      activeWorkout.exercises = [];
      showGymSubview('hub');
      renderGymSection();
    }

    // =========================================================================
    // --- SELECTOR MULTI-CHECK CON PESTAÑAS QUE SE ILUMINAN Y CONTADOR ---
    // =========================================================================
    let pickerTargetMode = 'ACTIVE';
    let pickerTargetRoutineId = 'pecho_esp';
    let pickerMuscleFilter = 'ALL';
    let multiCheckedIds = new Set();

    function openExercisePickerModal(mode) {
      pickerTargetMode = mode;
      pickerMuscleFilter = 'ALL';
      multiCheckedIds.clear();
      document.getElementById('pickerSearchInput').value = '';
      updateMultiCheckButtonCount();
      renderPickerMusclePills();
      renderPickerExercisesList();
      document.getElementById('exercisePickerModal').classList.replace('hidden', 'flex');
    }

    function openExercisePickerForRoutine(routineId) {
      pickerTargetRoutineId = routineId;
      openExercisePickerModal('ROUTINE');
    }

    function closeExercisePickerModal() {
      document.getElementById('exercisePickerModal').classList.replace('flex', 'hidden');
    }

    function setPickerMuscle(muscle) {
      pickerMuscleFilter = muscle;
      renderPickerMusclePills();
      renderPickerExercisesList();
    }

    // PESTAÑAS DE MÚSCULO QUE SE ILUMINAN Y MUESTRAN CUÁNTOS EJERCICIOS LLEVAS MARCADOS
    function renderPickerMusclePills() {
      const categoryDefs = [
        { id: 'ALL', label: 'Todos', icon: '💪' },
        { id: 'Pecho', label: 'Pecho', icon: '🫁' },
        { id: 'Espalda', label: 'Espalda', icon: '🔙' },
        { id: 'Piernas', label: 'Piernas', icon: '🦵' },
        { id: 'Hombros', label: 'Hombros', icon: '🏔️' },
        { id: 'Brazos', label: 'Brazos', icon: '💪' }
      ];
      const pillsBox = document.getElementById('pickerMusclePills');
      if (!pillsBox) return;

      pillsBox.innerHTML = categoryDefs.map(cat => {
        const isActive = pickerMuscleFilter === cat.id;
        let countInCat = 0;
        multiCheckedIds.forEach(id => {
          const ex = getExById(id);
          if (cat.id === 'ALL' || ex.muscle === cat.id) countInCat++;
        });
        return `
          <button onclick="setPickerMuscle('${cat.id}')" class="px-3 py-2 rounded-xl text-xs font-extrabold shrink-0 transition flex items-center gap-1.5 border ${
            isActive
              ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30 border-emerald-400 scale-105'
              : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800 hover:border-slate-700'
          }">
            <span>${cat.icon}</span>
            <span>${cat.label}</span>
            ${countInCat > 0 ? `<span class="min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-black flex items-center justify-center ${isActive ? 'bg-slate-950 text-emerald-400' : 'bg-emerald-500 text-slate-950'}">${countInCat}</span>` : ''}
          </button>
        `;
      }).join('');
    }

    function togglePickerExerciseCheck(id) {
      if (multiCheckedIds.has(id)) multiCheckedIds.delete(id);
      else multiCheckedIds.add(id);
      updateMultiCheckButtonCount();
      renderPickerMusclePills();
      renderPickerExercisesList();
    }

    function updateMultiCheckButtonCount() {
      document.getElementById('btnConfirmMultiEx').textContent = `Añadir (${multiCheckedIds.size})`;
    }

    function renderPickerExercisesList() {
      const q = (document.getElementById('pickerSearchInput')?.value || '').toLowerCase().trim();
      const box = document.getElementById('pickerExercisesListContainer');
      const filtered = EXERCISE_CATALOG.filter(ex => {
        const mMatch = pickerMuscleFilter === 'ALL' || ex.muscle === pickerMuscleFilter;
        const qMatch = !q || ex.name.toLowerCase().includes(q) || ex.muscle.toLowerCase().includes(q);
        return mMatch && qMatch;
      });

      box.innerHTML = filtered.map(ex => {
        const checked = multiCheckedIds.has(ex.id);
        return `
          <div onclick="togglePickerExerciseCheck('${ex.id}')" class="cursor-pointer flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-900 transition ${checked ? 'bg-emerald-500/15 border border-emerald-500/30' : ''}">
            <div class="flex items-center gap-3 min-w-0">
              ${getRoundExerciseAvatar(ex.muscle)}
              <div class="truncate">
                <p class="text-xs font-extrabold text-white truncate">${ex.name}</p>
                <p class="text-[11px] text-slate-400 truncate"><span class="text-emerald-400 font-semibold">${ex.muscle}</span> • ${ex.equip} • Ant: ${ex.prev}</p>
              </div>
            </div>
            <div class="w-6 h-6 rounded-lg border flex items-center justify-center text-xs font-extrabold ${checked ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'border-slate-700 text-transparent'}">
              ✓
            </div>
          </div>
        `;
      }).join('');
    }

    function confirmMultiCheckedExercises() {
      if (multiCheckedIds.size === 0) {
        closeExercisePickerModal();
        return;
      }
      if (pickerTargetMode === 'ACTIVE') {
        multiCheckedIds.forEach(id => {
          const meta = getExById(id);
          const def = (appState.exerciseDefaults && appState.exerciseDefaults[id]) || {
            kg: meta.defaultKg,
            reps: meta.defaultReps,
            prev: meta.prev
          };
          activeWorkout.exercises.push({
            id: meta.id,
            name: meta.name,
            muscle: meta.muscle,
            prev: def.prev,
            sets: [
              { kg: def.kg, reps: def.reps, done: false },
              { kg: def.kg, reps: def.reps, done: false },
              { kg: def.kg, reps: def.reps, done: false }
            ]
          });
        });
        renderActiveWorkoutExercises();
      } else {
        const r = appState.routines.find(x => x.id === pickerTargetRoutineId) || appState.routines[0];
        multiCheckedIds.forEach(id => {
          if (!r.exerciseIds.includes(id)) r.exerciseIds.push(id);
        });
        saveToStorage();
        renderHevyRoutinesHub();
      }
      closeExercisePickerModal();
    }

    function openCreateRoutineModal() { document.getElementById('createRoutineModal').classList.replace('hidden', 'flex'); }
    function closeCreateRoutineModal() { document.getElementById('createRoutineModal').classList.replace('flex', 'hidden'); }
    function createNewHevyRoutine() {
      const title = document.getElementById('newRoutineNameInput').value.trim();
      if (!title) return;
      const newId = 'rut_' + Date.now();
      appState.routines.unshift({ id: newId, title, exerciseIds: [] });
      document.getElementById('newRoutineNameInput').value = '';
      saveToStorage();
      closeCreateRoutineModal();
      openExercisePickerForRoutine(newId);
    }

    function renderClearStrengthProgress() {
      const sel = document.getElementById('clearProgressExerciseSelect');
      if (!sel) return;
      if (sel.options.length === 0) {
        sel.innerHTML = EXERCISE_CATALOG.map(e => `<option value="${e.id}">${e.name}</option>`).join('');
      }
      const ex = getExById(sel.value);

      // Buscar historial real de este ejercicio en todos los días guardados
      const histSessions = [];
      Object.keys(appState.days).sort().forEach(dateStr => {
        const dayFeeds = appState.workoutFeed.filter(w => w.date === dateStr);
        dayFeeds.forEach(w => {
          w.summaryLines && w.summaryLines.forEach(line => {
            if (line.toLowerCase().includes(ex.name.toLowerCase().substring(0, 8))) {
              const match = line.match(/(\d+(?:\.\d+)?)kg/);
              const repsMatch = line.match(/^(\d+)x/);
              if (match) histSessions.push({ date: dateStr, kg: parseFloat(match[1]), sets: repsMatch ? parseInt(repsMatch[1]) : 1 });
            }
          });
        });
      });

      const startKg = histSessions.length > 0 ? histSessions[0].kg : Math.max(10, ex.defaultKg - 12.5);
      const currentKg = histSessions.length > 0 ? histSessions[histSessions.length - 1].kg : ex.defaultKg;
      const diff = (currentKg - startKg).toFixed(1);
      const bodyWeightKg = appState.profile?.weightKg || 76.5;
      const relStrength = (currentKg / bodyWeightKg).toFixed(2);
      const level = relStrength >= 1.5 ? '🏆 Élite' : relStrength >= 1.0 ? '💪 Avanzado' : relStrength >= 0.75 ? '📈 Intermedio' : '🌱 Iniciando';

      document.getElementById('clearProgressSummaryBanner').innerHTML = `
        <p>🚀 <b>${ex.name}</b>: empezaste con <b>${startKg} kg</b> y tu marca actual es <b>${currentKg} kg × ${ex.defaultReps} reps</b> (<span class="text-emerald-300 font-mono">+${diff} kg de mejora</span>).</p>
        <p class="mt-1.5">⚡ Fuerza relativa: <b class="text-amber-300">${relStrength}x tu peso corporal</b> — Nivel: <b>${level}</b></p>
      `;

      const histRows = histSessions.length > 0
        ? histSessions.slice(-5).map((s, i) => `
          <div class="flex justify-between items-center bg-slate-900 px-3 py-2 rounded-xl text-xs">
            <span class="text-slate-400">${formatHumanDate(s.date)}</span>
            <span class="font-mono font-bold ${i === histSessions.slice(-5).length - 1 ? 'text-emerald-400' : 'text-slate-300'}">${s.kg} kg</span>
          </div>
        `).join('')
        : `<div class="flex justify-between items-center bg-slate-900 px-3 py-2 rounded-xl text-xs"><span class="text-slate-400">Marca de referencia</span><span class="font-mono font-bold text-slate-300">${ex.prev}</span></div>`;

      document.getElementById('clearProgressHistoryRows').innerHTML = histRows + `
        <div class="flex justify-between items-center bg-emerald-500/15 border border-emerald-500/30 px-3 py-2 rounded-xl text-xs mt-1">
          <span class="text-emerald-300 font-bold">Marca Actual</span>
          <span class="font-mono font-extrabold text-emerald-400">${currentKg} kg — ${relStrength}x tu peso</span>
        </div>
      `;
    }

