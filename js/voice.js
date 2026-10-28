// =========================================================================
    // --- VOZ REAL MEJORADA (BOTÓN ROJO AL GRABAR + ENTENDIMIENTO INTELIGENTE) ---
    // =========================================================================
    let activeRecognition = null;
    let isRecordingVoice = false;
    let lastCapturedTranscript = '';
    let commandAlreadyProcessed = false;

    function speakTextAloud(text) {
      if (!('speechSynthesis' in window)) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'es-ES';
      u.rate = 1.03;
      window.speechSynthesis.speak(u);
    }

    function speakDaySummaryAloud() {
      const day = getDayData(currentDate);
      const tc = (day.turkeys.fedMorning ? 1 : 0) + (day.turkeys.waterGiven ? 1 : 0) + (day.turkeys.fedEvening ? 1 : 0);
      const spent = (day.expenses || []).reduce((a, b) => a + Number(b.amount || 0), 0);
      const msg = `Resumen del ${formatHumanDate(currentDate)}: llevas ${day.steps || 0} pasos, ${day.bikeKm || 0} kilómetros en bici, ${day.studyMinutes || 0} minutos de estudio, ${spent.toFixed(0)} euros gastados y ${tc} de 3 turnos de los pavos.`;
      const box = document.getElementById('voiceTranscriptBox');
      if (box) box.textContent = `🔊 "${msg}"`;
      speakTextAloud(msg);
    }

    function openVoiceModal() {
      document.getElementById('voiceModal').classList.replace('hidden', 'flex');
      setMicVisualState(false);
    }

    function closeVoiceModal() {
      if (activeRecognition && isRecordingVoice) {
        try { activeRecognition.stop(); } catch(e) {}
      }
      setMicVisualState(false);
      document.getElementById('voiceModal').classList.replace('flex', 'hidden');
    }

    // Cambia visualmente a ROJO cuando está grabando y a VERDE cuando para
    function setMicVisualState(recording) {
      isRecordingVoice = recording;
      const btn = document.getElementById('btnStartMicListen');
      const circle = document.getElementById('voiceMicCircle');
      const title = document.getElementById('voiceModalStatusTitle');
      const sub = document.getElementById('voiceModalStatusSub');

      if (!btn || !circle) return;

      if (recording) {
        btn.className = 'flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs transition-all shadow-lg shadow-rose-600/40 animate-pulse';
        btn.innerHTML = '⏹ GRABANDO... (Toca para parar)';
        circle.className = 'w-14 h-14 rounded-full bg-rose-500/30 border-2 border-rose-500 text-rose-300 flex items-center justify-center text-2xl mx-auto animate-bounce shadow-lg shadow-rose-500/40';
        circle.innerHTML = '🔴';
        if (title) title.textContent = '🔴 Escuchando tu voz ahora...';
        if (sub) sub.textContent = 'Habla claro. Cuando termines, toca el botón rojo o haz una pausa.';
      } else {
        btn.className = 'flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs transition-all shadow-lg';
        btn.innerHTML = '🎙️ Empezar a Hablar';
        circle.className = 'w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 text-emerald-300 flex items-center justify-center text-2xl mx-auto transition-all';
        circle.innerHTML = '🎙️';
        if (title) title.textContent = 'Control por Voz';
        if (sub) sub.textContent = 'Micrófono en espera. Pulsa el botón verde para hablar.';
      }
    }

    function toggleRealVoiceRecognition() {
      const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
      const box = document.getElementById('voiceTranscriptBox');

      if (!SpeechRec) {
        box.textContent = '⚠️ Abre la web en Safari para usar el micrófono en iPhone.';
        return;
      }

      // Si ya estaba grabando y el usuario toca el botón rojo, paramos y procesamos
      if (isRecordingVoice && activeRecognition) {
        try { activeRecognition.stop(); } catch(e) {}
        return;
      }

      lastCapturedTranscript = '';
      commandAlreadyProcessed = false;
      activeRecognition = new SpeechRec();
      activeRecognition.lang = 'es-ES';
      activeRecognition.continuous = false;
      activeRecognition.interimResults = true;

      activeRecognition.onstart = () => {
        setMicVisualState(true);
        box.textContent = '🔴 Escuchando... di tu orden ahora';
      };

      activeRecognition.onresult = (e) => {
        lastCapturedTranscript = Array.from(e.results).map(r => r[0].transcript).join(' ').trim();
        box.textContent = `🗣️ "${lastCapturedTranscript}"`;
      };

      activeRecognition.onerror = (err) => {
        setMicVisualState(false);
        box.textContent = '⚠️ No se detectó voz o permiso denegado.';
      };

      // En Safari iOS, procesar al terminar (onend) garantiza que SIEMPRE lea lo que acabas de decir
      activeRecognition.onend = () => {
        setMicVisualState(false);
        if (lastCapturedTranscript && !commandAlreadyProcessed) {
          commandAlreadyProcessed = true;
          processSpokenText(lastCapturedTranscript);
        }
      };

      activeRecognition.start();
    }

    // Cerebro inteligente que da respuestas distintas según lo que digas
    function processSpokenText(rawText) {
      if (!rawText || !rawText.trim()) return;
      const t = rawText.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const day = getDayData(currentDate);
      const nowStr = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      const actionsDone = [];

      // 1. PAVOS Y GATOS (órdenes independientes: agua no marca comida)
      ensureAnimalTasks(day);

      ['pavo', 'gato'].forEach(animal => {
        if (t.includes(animal)) {
          const type = animal + 's';
          if (!day.animalTasks[type]) day.animalTasks[type] = {};

          const wantsWater = t.includes('agua') || t.includes('beber') || t.includes('arena');
          const wantsFood = t.includes('comida') || t.includes('comer') || t.includes('pienso') || t.includes('alimentar');

          if (wantsWater) {
            day.animalTasks[type].waterGiven = true;
            day.animalTasks[type].waterTime = nowStr;
            actionsDone.push(`agua de los ${type} a las ${nowStr}`);
          }
          if (wantsFood) {
            if (t.includes('tarde') || t.includes('noche')) {
              day.animalTasks[type].fedEvening = true;
              day.animalTasks[type].eveningTime = nowStr;
            } else {
              day.animalTasks[type].fedMorning = true;
              day.animalTasks[type].morningTime = nowStr;
            }
            actionsDone.push(`comida de los ${type} a las ${nowStr}`);
          }

          if (type === 'pavos') syncPavosToTurkeys(day);
        }
      });

      // 2. LISTA DE LA COMPRA (Filtro avanzado)
      if (t.includes('compra') || t.includes('lista') || t.includes('necesito')) {
        let itemText = rawText
          .replace(/\b(apunta(r|me)?|anade(me)?|añade(me)?|añadir|anotar|necesito|necesitamos|ponme|pon|echa)\b/gi, ' ')
          .replace(/\b(en|a|para|de)\s+(la\s+)?(lista(\s+de\s+la\s+compra)?|compra)\b/gi, ' ')
          .replace(/\b(lista(\s+de\s+la\s+compra)?|compra|comprar)\b/gi, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        itemText = itemText.replace(/\s+(para|par|en|a|de|la)$/i, '').replace(/^[¿?¡!.,;:\s]+|[¿?¡!.,;:\s]+$/g, '').trim();

        if (itemText) {
          appState.shoppingList.unshift({ id: Date.now(), text: itemText, done: false });
          syncShoppingItemToSupabase(appState.shoppingList[0]);
          actionsDone.push(`añadido "${itemText}" a la compra`);
        }
      }

      // 3. GASTOS EN EUROS
      if (t.includes('gast') || t.includes('euro') || t.includes('pagado') || t.includes('costado')) {
        const numMatch = t.match(/\d+([.,]\d+)?/);
        const amount = numMatch ? parseFloat(numMatch[0].replace(',', '.')) : 10;
        const concept = rawText.replace(/he gastado|gaste|euros|euro|en|pagado/gi, '').replace(/\d+([.,]\d+)?/g, '').trim() || 'Gasto por voz';
        day.expenses.push({ id: Date.now(), amount, desc: concept });
        syncExpenseToSupabase(day.expenses[day.expenses.length - 1], currentDate);
        actionsDone.push(`registrado un gasto de ${amount} euros en ${concept}`);
      }

      // 4. PASOS
      if (t.includes('paso')) {
        const numMatch = t.match(/\d+/);
        const st = numMatch ? parseInt(numMatch[0]) : 2000;
        day.steps = (day.steps || 0) + st;
        actionsDone.push(`sumados ${st} pasos, llevas ${day.steps} hoy`);
      }

      // 5. ESTUDIO
      if (t.includes('estudi')) {
        const numMatch = t.match(/\d+/);
        let mins = numMatch ? parseInt(numMatch[0]) : 30;
        if (t.includes('hora') && mins <= 10) mins = mins * 60;
        day.studyMinutes = (day.studyMinutes || 0) + mins;
        actionsDone.push(`sumados ${mins} minutos de estudio`);
      }

      // 6. COCHE
      if (t.includes('coche') || t.includes('conduc')) {
        const numMatch = t.match(/\d+/);
        const mins = numMatch ? parseInt(numMatch[0]) : 20;
        day.carMinutes = (day.carMinutes || 0) + mins;
        actionsDone.push(`añadidos ${mins} minutos de coche`);
      }

      // 7. BICI
      if (t.includes('bici') || t.includes('kilometro')) {
        const numMatch = t.match(/\d+([.,]\d+)?/);
        const km = numMatch ? parseFloat(numMatch[0].replace(',', '.')) : 5;
        day.bikeKm = Number(((day.bikeKm || 0) + km).toFixed(2));
        actionsDone.push(`sumados ${km} kilómetros de bici`);
      }

      // 8. COMIDA / DESAYUNO / CENA
      if (t.includes('comido') || t.includes('cenado') || t.includes('desayunado')) {
        const food = rawText.replace(/hoy|he comido|he cenado|he desayunado/gi, '').trim() || rawText;
        const meal = { id: Date.now(), desc: food };
        day.meals.push(meal);
        syncMealToSupabase(meal, currentDate);
        actionsDone.push(`anotada tu comida: ${food}`);
      }

      // 9. SI NO ES NINGUNO DE LOS ANTERIORES, VA AL DIARIO PERSONAL
      let finalReply = '';
      if (actionsDone.length > 0) {
        finalReply = 'Listo: ' + actionsDone.join(', y ') + '.';
      } else {
        day.journal = (day.journal ? day.journal + '. ' : '') + rawText;
        finalReply = `Guardado en tu diario personal: "${rawText}"`;
      }

      const box = document.getElementById('voiceTranscriptBox');
      if (box) box.textContent = `✅ ${finalReply}`;
      speakTextAloud(finalReply);
      saveToStorage();
      syncAnimalTasksToSupabase(day, currentDate);
    }

    // DICTADO EN EL DIARIO (TAMBIÉN SE PONE ROJO AL GRABAR)
    let journalRec = null;
    let isJournalRecording = false;

    function startJournalVoiceDictation() {
      const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
      const btn = document.getElementById('btnJournalMic');
      const lbl = document.getElementById('journalMicLabel');
      const area = document.getElementById('personalJournalTextarea');

      if (!SpeechRec) {
        alert('Abre la web en Safari para dictar por voz.');
        return;
      }

      if (isJournalRecording && journalRec) {
        try { journalRec.stop(); } catch(e) {}
        return;
      }

      let captured = '';
      journalRec = new SpeechRec();
      journalRec.lang = 'es-ES';
      journalRec.interimResults = true;

      journalRec.onstart = () => {
        isJournalRecording = true;
        btn.className = 'px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-extrabold flex items-center gap-1.5 animate-pulse shadow-lg shadow-rose-600/30';
        lbl.textContent = '🔴 Grabando... (Parar)';
      };

      journalRec.onresult = (e) => {
        captured = Array.from(e.results).map(r => r[0].transcript).join(' ').trim();
      };

      journalRec.onend = () => {
        isJournalRecording = false;
        btn.className = 'px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-extrabold flex items-center gap-1.5';
        lbl.textContent = 'Dictar mi Día';
        if (captured) {
          area.value = (area.value ? area.value + ' ' : '') + captured;
          getDayData(currentDate).journal = area.value;
          saveToStorage();
          speakTextAloud('Añadido a tu diario.');
        }
      };

      journalRec.start();
    }
