    // =========================================================================
    // --- INICIO, HOGAR, SEMANA Y DIARIO UNIDO ---
    // =========================================================================
    function renderHomeView() {
      const day = getDayData(currentDate);
      const myWorkoutsToday = appState.workoutFeed.filter(w => w.date === currentDate && w.user.startsWith('Tú'));
      document.getElementById('homeGymStat').textContent = myWorkoutsToday.length > 0
        ? `${myWorkoutsToday[0].volumeKg.toLocaleString()} kg`
        : '0 kg hoy';

      document.getElementById('homeStepsStat').textContent = `${(day.steps || 0).toLocaleString()} pasos`;
      document.getElementById('homeBikeSub').textContent = `${(day.bikeKm || 0).toFixed(1)} km bici`;

      const tc = (day.turkeys.fedMorning ? 1 : 0) + (day.turkeys.waterGiven ? 1 : 0) + (day.turkeys.fedEvening ? 1 : 0);
      document.getElementById('homeTurkeysStat').textContent = `${tc}/3 turnos`;
      const pendingShop = appState.shoppingList.filter(i => !i.done).length;
      document.getElementById('homeShopSub').textContent = `${pendingShop} pendientes`;

      document.getElementById('homeStudyStat').textContent = `${day.studyMinutes || 0} min`;
      document.getElementById('homeCarSub').textContent = `${day.carMinutes || 0} min coche`;

      document.getElementById('studyMinHome').textContent = `${day.studyMinutes || 0} min`;
      document.getElementById('carMinHome').textContent = `${day.carMinutes || 0} min`;

      document.getElementById('homeMealsPills').innerHTML = (day.meals || []).map(m => `
        <span class="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200">🥗 ${m.desc}</span>
      `).join('');

      document.getElementById('socialWorkoutFeedList').innerHTML = appState.workoutFeed.map(w => `
        <div class="studio-card rounded-2xl p-4 space-y-3">
          <div class="flex items-center justify-between">
            <div>
              <span class="text-xs font-extrabold text-white">${w.user}</span>
              <span class="text-[11px] text-slate-400 block capitalize">${formatHumanDate(w.date)}</span>
            </div>
            <button onclick="likeFeedWorkout(${w.id})" class="px-3 py-1 rounded-xl bg-slate-900 text-emerald-400 text-xs font-bold border border-slate-800">
              💪 ${w.likes || 0}
            </button>
          </div>
          <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between gap-3">
            <div class="space-y-1 min-w-0 flex-1">
              <h4 class="text-base font-extrabold text-white">${w.title}</h4>
              <div class="flex gap-3 text-xs font-mono text-slate-400 pb-1">
                <span>⏱️ ${w.duration}</span>
                <span>📦 <b class="text-emerald-400">${w.volumeKg.toLocaleString()} kg</b></span>
                <span>✔ ${w.setsCount} series</span>
              </div>
              ${(w.summaryLines || []).map(l => `<p class="text-xs text-slate-300 truncate">• ${l}</p>`).join('')}
            </div>
            <div class="w-16 shrink-0">${getAnatomyBodyMapSVG(w.muscles || ['Pecho'])}</div>
          </div>
          ${w.photoUrl ? `<img src="${w.photoUrl}" class="w-full h-48 object-cover rounded-2xl border border-slate-800"/>` : ''}
          ${w.note ? `<p class="text-xs text-slate-300 italic">"${w.note}"</p>` : ''}
        </div>
      `).join('');
    }

    function likeFeedWorkout(id) {
      const w = appState.workoutFeed.find(x => x.id === id);
      if (w) w.likes = (w.likes || 0) + 1;
      saveToStorage();
    }

    function addMinutes(type, mins) {
      const day = getDayData(currentDate);
      if (type === 'study') day.studyMinutes = (day.studyMinutes || 0) + mins;
      if (type === 'car') day.carMinutes = (day.carMinutes || 0) + mins;
      saveToStorage();
    }

    function addQuickMeal() {
      const inp = document.getElementById('quickMealInput');
      const desc = inp.value.trim();
      if (!desc) return;
      const meal = { id: Date.now(), desc };
      getDayData(currentDate).meals.push(meal);
      inp.value = '';
      saveToStorage();
      syncMealToSupabase(meal, currentDate);
    }

    let activeAnimalType = 'pavos'; // pavos | gatos

    function ensureAnimalTasks(day) {
      if (!day.animalTasks) day.animalTasks = { pavos: {}, gatos: {} };
      if (!day.animalTasks.pavos) day.animalTasks.pavos = {};
      if (!day.animalTasks.gatos) day.animalTasks.gatos = {};
      const p = day.animalTasks.pavos;
      const hasPavosData = p.fedMorning || p.waterGiven || p.fedEvening || p.morningTime || p.waterTime || p.eveningTime;
      if (!hasPavosData && day.turkeys) {
        day.animalTasks.pavos = {
          fedMorning: !!day.turkeys.fedMorning,
          morningTime: day.turkeys.morningTime || '',
          waterGiven: !!day.turkeys.waterGiven,
          waterTime: day.turkeys.waterTime || '',
          fedEvening: !!day.turkeys.fedEvening,
          eveningTime: day.turkeys.eveningTime || ''
        };
      }
    }

    function syncPavosToTurkeys(day) {
      const p = (day.animalTasks && day.animalTasks.pavos) || {};
      day.turkeys = {
        fedMorning: !!p.fedMorning,
        morningTime: p.morningTime || '',
        waterGiven: !!p.waterGiven,
        waterTime: p.waterTime || '',
        fedEvening: !!p.fedEvening,
        eveningTime: p.eveningTime || ''
      };
    }

    function selectAnimalType(type) {
      activeAnimalType = type;
      document.getElementById('tab-animal-pavos').className = type === 'pavos' ? 'px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 text-slate-950 transition' : 'px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-slate-400 border border-slate-800 transition';
      document.getElementById('tab-animal-gatos').className = type === 'gatos' ? 'px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 text-slate-950 transition' : 'px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-slate-400 border border-slate-800 transition';
      renderHogarView();
    }

    function toggleTurkeyTask(field) {
      const day = getDayData(currentDate);
      ensureAnimalTasks(day);
      if (!day.animalTasks[activeAnimalType]) day.animalTasks[activeAnimalType] = {};

      const timeKeyMap = { fedMorning: 'morningTime', waterGiven: 'waterTime', fedEvening: 'eveningTime' };
      const animalObj = day.animalTasks[activeAnimalType];
      animalObj[field] = !animalObj[field];
      const nowStr = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      animalObj[timeKeyMap[field]] = animalObj[field] ? nowStr : '';
      if (activeAnimalType === 'pavos') syncPavosToTurkeys(day);
      saveToStorage();
      syncAnimalTasksToSupabase(day, currentDate);
    }

    function renderHogarView() {
      const day = getDayData(currentDate);
      ensureAnimalTasks(day);
      const currentObj = day.animalTasks[activeAnimalType] || {};

      const titleEl = document.getElementById('hogarCardTitleText');
      if (titleEl) titleEl.textContent = activeAnimalType === 'pavos' ? '🦃 Cuidado de los Pavos' : '🐈 Cuidado de los Gatos';

      const tabPavos = document.getElementById('tab-animal-pavos');
      const tabGatos = document.getElementById('tab-animal-gatos');
      if (tabPavos) tabPavos.className = activeAnimalType === 'pavos' ? 'px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 text-slate-950 transition' : 'px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-slate-400 border border-slate-800 transition';
      if (tabGatos) tabGatos.className = activeAnimalType === 'gatos' ? 'px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 text-slate-950 transition' : 'px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-slate-400 border border-slate-800 transition';

      const states = [
        { key: 'fedMorning', timeKey: 'morningTime', btn: 'btn-turkey-morning', timeEl: 'time-turkey-morning' },
        { key: 'waterGiven', timeKey: 'waterTime', btn: 'btn-turkey-water', timeEl: 'time-turkey-water' },
        { key: 'fedEvening', timeKey: 'eveningTime', btn: 'btn-turkey-evening', timeEl: 'time-turkey-evening' }
      ];

      states.forEach(s => {
        const done = currentObj[s.key];
        const btnEl = document.getElementById(s.btn);
        const tEl = document.getElementById(s.timeEl);
        if (btnEl && tEl) {
          if (done) {
            btnEl.className = 'p-3 rounded-xl border-2 border-emerald-500 bg-emerald-500/15 flex flex-col items-center text-center transition';
            tEl.textContent = `✔ ${currentObj[s.timeKey] || 'Hecho'}`;
            tEl.className = 'text-[10px] font-mono text-emerald-300 font-bold mt-0.5';
          } else {
            btnEl.className = 'p-3 rounded-xl border border-slate-800 bg-slate-900 flex flex-col items-center text-center transition';
            tEl.textContent = 'Pendiente';
            tEl.className = 'text-[10px] font-mono text-slate-500 mt-0.5';
          }
        }
      });

      scheduleShopFadeRefresh();
      document.getElementById('shoppingListContainer').innerHTML = appState.shoppingList.map(item => {
        const faded = isShopItemFaded(item);
        const stateClass = faded ? 'is-faded' : (item.done ? 'is-done' : 'hover:bg-slate-800');
        return `
        <div onclick="toggleShopItem(${item.id})" class="shop-item cursor-pointer flex items-center justify-between bg-slate-900 px-3 py-2.5 rounded-xl border border-slate-800 text-xs ${stateClass}">
          <div class="flex items-center gap-2.5">
            <span class="w-5 h-5 rounded border flex items-center justify-center transition-colors ${item.done ? 'bg-emerald-500 border-emerald-500 text-slate-950 font-bold' : 'border-slate-700 text-transparent'}">✓</span>
            <span class="font-semibold ${item.done ? 'text-slate-500' : 'text-white'}">${item.text}</span>
          </div>
        </div>`;
      }).join('');

      const spent = (day.expenses || []).reduce((a, b) => a + Number(b.amount || 0), 0);
      document.getElementById('todaySpentTotalLabel').textContent = `${spent.toFixed(2)} €`;
      document.getElementById('expensesListContainer').innerHTML = (day.expenses || []).map(e => `
        <div class="flex justify-between items-center bg-slate-900 px-3 py-2 rounded-xl border border-slate-800 text-xs">
          <span class="text-white">${e.desc}</span>
          <b class="font-mono text-emerald-400">${Number(e.amount).toFixed(2)} €</b>
        </div>
      `).join('');
    }
    function quickAddTurkeyFeedToShop() {
      appState.shoppingList.unshift({ id: Date.now(), text: 'Saco de pienso para los pavos', done: false });
      saveToStorage();
      syncShoppingItemToSupabase(appState.shoppingList[0]);
    }

    function addShoppingItem() {
      const inp = document.getElementById('shopItemInput');
      const text = inp.value.trim();
      if (!text) return;
      appState.shoppingList.unshift({ id: Date.now(), text, done: false });
      inp.value = '';
      saveToStorage();
      syncShoppingItemToSupabase(appState.shoppingList[0]);
    }

    const SHOP_FADE_AFTER_MS = 6 * 60 * 60 * 1000;
    let shopFadeTimer = null;

    function isShopItemFaded(item) {
      return !!(item && item.done && item.doneAt && (Date.now() - item.doneAt >= SHOP_FADE_AFTER_MS));
    }

    function scheduleShopFadeRefresh() {
      clearTimeout(shopFadeTimer);
      const now = Date.now();
      const waits = appState.shoppingList
        .filter(i => i.done && i.doneAt && (now - i.doneAt < SHOP_FADE_AFTER_MS))
        .map(i => i.doneAt + SHOP_FADE_AFTER_MS - now);
      if (!waits.length) return;
      shopFadeTimer = setTimeout(() => {
        if (currentActiveTab === 'hogar') renderHogarView();
        else scheduleShopFadeRefresh();
      }, Math.min(...waits) + 50);
    }

    function toggleShopItem(id) {
      const it = appState.shoppingList.find(i => i.id === id);
      if (!it) return;
      it.done = !it.done;
      it.doneAt = it.done ? Date.now() : 0;
      saveToStorage();
      updateShoppingItemInSupabase(it);
    }

    function addExpense() {
      const amount = parseFloat(document.getElementById('expenseAmountInput').value);
      const desc = document.getElementById('expenseDescInput').value.trim();
      if (!amount || !desc) return;
      getDayData(currentDate).expenses.push({ id: Date.now(), amount, desc });
      document.getElementById('expenseAmountInput').value = '';
      document.getElementById('expenseDescInput').value = '';
      saveToStorage();
      const savedExpense = getDayData(currentDate).expenses[getDayData(currentDate).expenses.length - 1];
      syncExpenseToSupabase(savedExpense, currentDate);
    }

    function renderWeeklyClearAudit() {
      const rows = [];
      let goodDays = 0;
      for (let i = 0; i < 7; i++) {
        const d = new Date(currentDate + 'T12:00:00');
        d.setDate(d.getDate() - i);
        const iso = d.toISOString().split('T')[0];
        const day = getDayData(iso);
        const tc = (day.turkeys.fedMorning ? 1 : 0) + (day.turkeys.waterGiven ? 1 : 0) + (day.turkeys.fedEvening ? 1 : 0);
        const wDone = appState.workoutFeed.some(w => w.date === iso && w.user.startsWith('Tú'));
        if (tc >= 2 || wDone || day.steps >= 6000) goodDays++;

        rows.push(`
          <div class="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div>
              <b class="text-white capitalize">${formatHumanDate(iso)}</b>
              <p class="text-[11px] text-slate-400">
                🦃 Pavos: ${tc}/3 • 👣 ${(day.steps || 0).toLocaleString()} pasos • 🚴 ${(day.bikeKm || 0).toFixed(1)}km • 📚 ${day.studyMinutes || 0}m estudio
              </p>
            </div>
            <span class="px-2.5 py-1 rounded-lg font-bold ${wDone ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}">
              ${wDone ? '🏋️ Fuerza OK' : 'Descanso'}
            </span>
          </div>
        `);
      }
      document.getElementById('weeklyClearCards').innerHTML = rows.join('');
      const pct = Math.round((goodDays / 7) * 100);
      document.getElementById('weeklyGlobalScore').textContent = pct + '%';
    }

    function renderJournalCombinedView() {
      const day = getDayData(currentDate);
      document.getElementById('journalDateLabel').textContent = formatHumanDate(currentDate);
      const tc = (day.turkeys.fedMorning ? 1 : 0) + (day.turkeys.waterGiven ? 1 : 0) + (day.turkeys.fedEvening ? 1 : 0);
      const wToday = appState.workoutFeed.find(w => w.date === currentDate && w.user.startsWith('Tú'));

      document.getElementById('journalTodayAttachedBadges').innerHTML = `
        <span class="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-[11px] font-bold">🏋️ ${wToday ? wToday.title + ' (' + wToday.volumeKg + 'kg)' : 'Sin gym'}</span>
        <span class="px-2.5 py-1 rounded-lg bg-orange-500/20 text-orange-300 text-[11px] font-bold">👣 ${(day.steps || 0).toLocaleString()} pasos</span>
        <span class="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 text-[11px] font-bold">🚴 ${(day.bikeKm || 0).toFixed(1)} km bici</span>
        <span class="px-2.5 py-1 rounded-lg bg-violet-500/20 text-violet-300 text-[11px] font-bold">📚 ${day.studyMinutes || 0}m estudio</span>
        <span class="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 text-[11px] font-bold">🦃 Pavos ${tc}/3</span>
      `;

      const moods = ['🤩', '😄', '🙂', '😐', '😴', '💪'];
      document.getElementById('moodSelectorRow').innerHTML = moods.map(m => `
        <button onclick="getDayData('${currentDate}').mood='${m}';saveToStorage();" class="w-7 h-7 rounded-lg text-sm ${day.mood === m ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 opacity-50'}">${m}</button>
      `).join('');

      document.getElementById('personalJournalTextarea').value = day.journal || '';

      const histBox = document.getElementById('journalCombinedHistoryList');
      const dates = Object.keys(appState.days).sort().reverse();
      histBox.innerHTML = dates.map(dStr => {
        const dObj = appState.days[dStr];
        const tCount = (dObj.turkeys.fedMorning ? 1 : 0) + (dObj.turkeys.waterGiven ? 1 : 0) + (dObj.turkeys.fedEvening ? 1 : 0);
        const wDay = appState.workoutFeed.find(w => w.date === dStr && w.user.startsWith('Tú'));
        const spent = (dObj.expenses || []).reduce((a, b) => a + Number(b.amount || 0), 0);

        return `
          <div class="studio-card rounded-2xl p-4 space-y-2.5">
            <div class="flex items-center justify-between border-b border-slate-800 pb-2">
              <span class="text-xs font-extrabold text-white capitalize">📅 ${formatHumanDate(dStr)} (${dStr})</span>
              <span class="text-base">${dObj.mood || '😄'}</span>
            </div>
            <div class="flex flex-wrap gap-1.5 text-[11px]">
              <span class="px-2 py-0.5 rounded bg-slate-900 text-emerald-400 font-semibold">🏋️ ${wDay ? wDay.title + ' (' + wDay.volumeKg + 'kg)' : 'Descanso'}</span>
              <span class="px-2 py-0.5 rounded bg-slate-900 text-orange-300">👣 ${(dObj.steps || 0).toLocaleString()} pasos</span>
              <span class="px-2 py-0.5 rounded bg-slate-900 text-cyan-300">🚴 ${(dObj.bikeKm || 0).toFixed(1)} km</span>
              <span class="px-2 py-0.5 rounded bg-slate-900 text-violet-300">📚 ${dObj.studyMinutes || 0}m estudio</span>
              <span class="px-2 py-0.5 rounded bg-slate-900 text-amber-300">🦃 Pavos ${tCount}/3</span>
              <span class="px-2 py-0.5 rounded bg-slate-900 text-emerald-300">💶 ${spent.toFixed(2)}€</span>
            </div>
            <p class="text-xs text-slate-200 leading-relaxed bg-slate-900/70 p-3 rounded-xl border border-slate-800/80">
              ${dObj.journal ? dObj.journal : '<i class="text-slate-500">Sin nota escrita este día.</i>'}
            </p>
          </div>
        `;
      }).join('');
    }

    function saveJournalEntryToHistory() {
      const val = document.getElementById('personalJournalTextarea').value.trim();
      getDayData(currentDate).journal = val;
      saveToStorage();
    }

    function loadDemoData() {
      appState.days = {};
      for (let i = 4; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const iso = d.toISOString().split('T')[0];
        const day = createEmptyDay();
        day.turkeys = { fedMorning: true, morningTime: '08:30', waterGiven: true, waterTime: '08:35', fedEvening: i !== 0, eveningTime: '19:40' };
        day.steps = 8200 + ((4 - i) * 650);
        day.studyMinutes = 90;
        day.carMinutes = 25;
        if (i % 2 === 0) {
          day.bikeKm = 11.4;
          day.bikeMinutes = 34;
          day.bikeRoutes = [{
            id: 500 + i,
            date: iso,
            timeStr: '18:15',
            km: 11.4,
            mins: 34,
            avgSpeed: 20.1,
            maxSpeed: 31.5,
            segments: [
              { pts: [[39.5696, 2.6502], [39.5735, 2.6550]], color: '#10b981', speed: 19.5 },
              { pts: [[39.5735, 2.6550], [39.5780, 2.6610]], color: '#f59e0b', speed: 26.4 },
              { pts: [[39.5780, 2.6610], [39.5820, 2.6675]], color: '#f43f5e', speed: 31.5 }
            ]
          }];
        }
        day.meals = [{ id: 1, desc: 'Pechuga de pollo con arroz y aguacate' }];
        day.expenses = [{ id: 1, amount: 14.20, desc: 'Compra supermercado' }];
        day.journal = i === 0
          ? 'Sesión de fuerza completada subiendo repeticiones, ruta en bici guardada y pavos atendidos temprano.'
          : 'Día constante cumpliendo pasos, estudio y cuidado del corral.';
        appState.days[iso] = day;
      }
      saveToStorage();
    }

    document.addEventListener('DOMContentLoaded', () => {
      const dock = document.querySelector('.bottom-dock');
      if (!dock) return;

      const bubble = document.getElementById('ios-floating-bubble');
      const dockButtons = dock.querySelectorAll('.dock-btn');
      let isDragging = false;
      let targetTabMatch = null;
      let dockRefreshFrame = 0;
      let dragFrame = 0;
      let pendingDragX = null;
      let dragGeometry = null;

      function scheduleDockBubbleRefresh() {
        cancelAnimationFrame(dockRefreshFrame);
        dockRefreshFrame = requestAnimationFrame(() => {
          requestAnimationFrame(() => moveDockBubbleToActiveTab(currentActiveTab));
        });
        window.setTimeout(() => moveDockBubbleToActiveTab(currentActiveTab), 180);
      }

      function updateBubblePosition(clientX) {
        if (!dragGeometry) {
          dragGeometry = {
            dockRect: dock.getBoundingClientRect(),
            bubbleWidth: bubble.offsetWidth,
            buttons: [...dockButtons].map(btn => ({
              element: btn,
              rect: btn.getBoundingClientRect()
            }))
          };
        }
        let offsetX = clientX - dragGeometry.dockRect.left;
        const minX = 6;
        const maxX = dock.offsetWidth - dragGeometry.bubbleWidth - 6;
        offsetX = Math.max(minX, Math.min(offsetX - (dragGeometry.bubbleWidth / 2), maxX));
        bubble.style.setProperty('--dock-bubble-x', `${offsetX}px`);

        const bubbleCenter = dragGeometry.dockRect.left + offsetX + (dragGeometry.bubbleWidth / 2);
        dragGeometry.buttons.forEach(({ element, rect }) => {
          if (bubbleCenter >= rect.left && bubbleCenter <= rect.right) {
            const onclickAttr = element.getAttribute('onclick');
            const match = onclickAttr && onclickAttr.match(/switchTab\(['"]([^'"]+)['"]\)/);
            if (match && match[1]) {
              targetTabMatch = match[1];
            }
          }
        });
      }

      dock.addEventListener('touchstart', event => {
        isDragging = true;
        dragGeometry = null;
        dock.classList.add('dock-dragging');
        const touch = event.touches[0];
        if (touch) updateBubblePosition(touch.clientX);
      }, { passive: true });

      dock.addEventListener('touchmove', event => {
        if (!isDragging) return;
        const touch = event.touches[0];
        if (!touch) return;
        pendingDragX = touch.clientX;
        if (dragFrame) return;
        dragFrame = requestAnimationFrame(() => {
          dragFrame = 0;
          if (pendingDragX !== null) updateBubblePosition(pendingDragX);
        });
      }, { passive: true });

      const endDrag = () => {
        if (!isDragging) return;
        isDragging = false;
        dragGeometry = null;
        pendingDragX = null;
        if (dragFrame) {
          cancelAnimationFrame(dragFrame);
          dragFrame = 0;
        }
        dock.classList.remove('dock-dragging');
        if (targetTabMatch) {
          window.switchTab(targetTabMatch);
          targetTabMatch = null;
        }
      };

      dock.addEventListener('touchend', endDrag);
      dock.addEventListener('touchcancel', endDrag);

      loadFromStorage();
      refreshCurrentActiveView();
      requestAnimationFrame(() => {
        requestAnimationFrame(() => moveDockBubbleToActiveTab(currentActiveTab));
      });
      window.addEventListener('load', () => moveDockBubbleToActiveTab(currentActiveTab), { once: true });
      window.addEventListener('resize', scheduleDockBubbleRefresh);
      window.addEventListener('orientationchange', scheduleDockBubbleRefresh);
      if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', scheduleDockBubbleRefresh);
      }
      initializeAuth();
    });
