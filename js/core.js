const EXERCISE_CATALOG = [
      { id: 'incline_db', name: 'Press Inclinado con Mancuernas', muscle: 'Pecho', equip: 'Mancuernas', prev: '22.5kg x 10', defaultKg: 22.5, defaultReps: 10 },
      { id: 'bench_bar', name: 'Press de Banca con Barra', muscle: 'Pecho', equip: 'Barra', prev: '70kg x 10', defaultKg: 70, defaultReps: 10 },
      { id: 'chest_fly', name: 'Aperturas en Máquina (Contractora)', muscle: 'Pecho', equip: 'Máquina', prev: '50kg x 12', defaultKg: 50, defaultReps: 12 },
      { id: 'cable_cross', name: 'Cruce de Poleas', muscle: 'Pecho', equip: 'Polea', prev: '20kg x 12', defaultKg: 20, defaultReps: 12 },
      { id: 'seated_row', name: 'Remo en Polea Baja (Gironda)', muscle: 'Espalda', equip: 'Polea', prev: '60kg x 10', defaultKg: 60, defaultReps: 10 },
      { id: 'lat_pull', name: 'Jalón al Pecho en Polea', muscle: 'Espalda', equip: 'Polea', prev: '60kg x 10', defaultKg: 60, defaultReps: 10 },
      { id: 'pull_ups', name: 'Dominadas (Pull-ups)', muscle: 'Espalda', equip: 'Peso Corporal', prev: '76kg x 10', defaultKg: 76, defaultReps: 10 },
      { id: 'bar_row', name: 'Remo con Barra', muscle: 'Espalda', equip: 'Barra', prev: '65kg x 8', defaultKg: 65, defaultReps: 8 },
      { id: 'rear_delt', name: 'Pájaros / Posterior en Máquina', muscle: 'Hombros', equip: 'Máquina', prev: '66kg x 10', defaultKg: 66, defaultReps: 10 },
      { id: 'shoulder_press', name: 'Press Militar con Mancuernas', muscle: 'Hombros', equip: 'Mancuernas', prev: '24kg x 10', defaultKg: 24, defaultReps: 10 },
      { id: 'lat_raise', name: 'Elevaciones Laterales', muscle: 'Hombros', equip: 'Mancuernas', prev: '12kg x 12', defaultKg: 12, defaultReps: 12 },
      { id: 'squat_bar', name: 'Sentadilla Libre con Barra', muscle: 'Piernas', equip: 'Barra', prev: '90kg x 8', defaultKg: 90, defaultReps: 8 },
      { id: 'bulgarian', name: 'Sentadilla Búlgara', muscle: 'Piernas', equip: 'Mancuernas', prev: '20kg x 10', defaultKg: 20, defaultReps: 10 },
      { id: 'leg_curl', name: 'Curl Femoral Sentado', muscle: 'Piernas', equip: 'Máquina', prev: '55kg x 12', defaultKg: 55, defaultReps: 12 },
      { id: 'leg_press', name: 'Prensa de Piernas 45º', muscle: 'Piernas', equip: 'Máquina', prev: '160kg x 10', defaultKg: 160, defaultReps: 10 },
      { id: 'calf_raise', name: 'Elevación de Gemelos', muscle: 'Piernas', equip: 'Máquina', prev: '50kg x 15', defaultKg: 50, defaultReps: 15 },
      { id: 'hammer_curl', name: 'Curl Martillo con Mancuernas', muscle: 'Brazos', equip: 'Mancuernas', prev: '16kg x 10', defaultKg: 16, defaultReps: 10 },
      { id: 'tricep_rope', name: 'Extensión de Tríceps en Polea', muscle: 'Brazos', equip: 'Polea', prev: '25kg x 12', defaultKg: 25, defaultReps: 12 },
      { id: 'bicep_bar', name: 'Curl de Bíceps con Barra Z', muscle: 'Brazos', equip: 'Barra Z', prev: '32.5kg x 10', defaultKg: 32.5, defaultReps: 10 }
    ];

    function getRoundExerciseAvatar(muscle) {
      const colors = { Pecho: '#10b981', Espalda: '#3b82f6', Piernas: '#f59e0b', Hombros: '#8b5cf6', Brazos: '#ec4899' };
      const c = colors[muscle] || '#10b981';
      return `
        <div class="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0">
          <svg viewBox="0 0 40 40" class="w-6 h-6">
            <circle cx="20" cy="11" r="4" fill="#e2e8f0"/>
            <rect x="14" y="16" width="12" height="12" rx="3" fill="${c}"/>
            <line x1="8" y1="20" x2="32" y2="20" stroke="#94a3b8" stroke-width="3" stroke-linecap="round"/>
          </svg>
        </div>
      `;
    }

    function getAnatomyBodyMapSVG(activeMuscles = ['Pecho']) {
      const hasChest = activeMuscles.some(m => ['Pecho'].includes(m));
      const hasBack = activeMuscles.some(m => ['Espalda'].includes(m));
      const hasLegs = activeMuscles.some(m => ['Piernas'].includes(m));
      const hasShoulders = activeMuscles.some(m => ['Hombros'].includes(m));
      const hasArms = activeMuscles.some(m => ['Brazos', 'Hombros'].includes(m));
      const hi = '#10b981';
      const hi2 = '#06b6d4';
      const base = '#1e293b';
      const glow = (active, color='#10b981') => active ? color : base;
      return `
        <svg viewBox="0 0 90 155" class="w-full h-auto max-h-32" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="chestGrad" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="${hasChest ? hi : base}"/><stop offset="100%" stop-color="${hasChest ? '#059669' : base}"/></radialGradient>
            <radialGradient id="armGrad" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="${hasArms ? hi2 : base}"/><stop offset="100%" stop-color="${hasArms ? '#0284c7' : base}"/></radialGradient>
            <radialGradient id="legGrad" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="${hasLegs ? '#f59e0b' : base}"/><stop offset="100%" stop-color="${hasLegs ? '#d97706' : base}"/></radialGradient>
          </defs>
          <!-- Cabeza -->
          <circle cx="45" cy="13" r="9" fill="#475569" stroke="#64748b" stroke-width="1"/>
          <!-- Cuello -->
          <rect x="41" y="22" width="8" height="6" rx="2" fill="#334155"/>
          <!-- Hombros -->
          <ellipse cx="28" cy="32" rx="8" ry="5" fill="${glow(hasShoulders, '#8b5cf6')}"/>
          <ellipse cx="62" cy="32" rx="8" ry="5" fill="${glow(hasShoulders, '#8b5cf6')}"/>
          <!-- Brazos superiores -->
          <rect x="18" y="30" width="9" height="26" rx="4" fill="url(#armGrad)"/>
          <rect x="63" y="30" width="9" height="26" rx="4" fill="url(#armGrad)"/>
          <!-- Brazos inferiores -->
          <rect x="17" y="57" width="8" height="22" rx="4" fill="${glow(hasArms, '#0ea5e9')}"/>
          <rect x="65" y="57" width="8" height="22" rx="4" fill="${glow(hasArms, '#0ea5e9')}"/>
          <!-- Torso pecho -->
          <rect x="30" y="27" width="30" height="20" rx="5" fill="url(#chestGrad)"/>
          <!-- Abs -->
          <rect x="33" y="48" width="24" height="22" rx="4" fill="${glow(hasBack && hasChest, '#0f766e')}" opacity="0.6"/>
          <!-- Línea central abs -->
          <line x1="45" y1="48" x2="45" y2="70" stroke="#0f172a" stroke-width="1.5" opacity="0.5"/>
          <!-- Cintura -->
          <rect x="33" y="70" width="24" height="8" rx="3" fill="#334155"/>
          <!-- Pierna izquierda cuadriceps -->
          <rect x="30" y="79" width="13" height="34" rx="6" fill="url(#legGrad)"/>
          <!-- Pierna derecha cuadriceps -->
          <rect x="47" y="79" width="13" height="34" rx="6" fill="url(#legGrad)"/>
          <!-- Espinillas -->
          <rect x="31" y="113" width="11" height="22" rx="5" fill="${glow(hasLegs, '#b45309')}"/>
          <rect x="48" y="113" width="11" height="22" rx="5" fill="${glow(hasLegs, '#b45309')}"/>
          <!-- Pies -->
          <ellipse cx="36" cy="136" rx="7" ry="4" fill="#1e293b"/>
          <ellipse cx="54" cy="136" rx="7" ry="4" fill="#1e293b"/>
          <!-- Indicadores brillantes si está activo -->
          ${hasChest ? '<circle cx="45" cy="36" r="3" fill="#10b981" opacity="0.8"><animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite"/></circle>' : ''}
          ${hasLegs ? '<circle cx="37" cy="96" r="2.5" fill="#f59e0b" opacity="0.8"><animate attributeName="opacity" values="0.4;1;0.4" dur="1.8s" repeatCount="indefinite"/></circle>' : ''}
          ${hasArms ? '<circle cx="23" cy="43" r="2" fill="#06b6d4" opacity="0.8"><animate attributeName="opacity" values="0.4;1;0.4" dur="1.5s" repeatCount="indefinite"/></circle>' : ''}
        </svg>
      `;
    }


    const SafeStorage = {
      get(k) { try { return localStorage.getItem(k); } catch(e) { return null; } },
      set(k, v) { try { localStorage.setItem(k, v); } catch(e) {} },
      remove(k) { try { localStorage.removeItem(k); } catch(e) {} }
    };

    const STORAGE_KEY = 'LIFEOS_PRO_V55_STUDIO';
    const USER_STORAGE_PREFIX = `${STORAGE_KEY}_USER_`;
    function getTodayISO() { return new Date().toISOString().split('T')[0]; }
    let currentDate = getTodayISO();
    let currentAppMode = 'ALL';
    let currentActiveTab = 'home';
    let currentAuthSession = null;
    let dailyLogSaveTimer = null;

    let appState = {
      workoutCount: 19,
      profile: { weightKg: 76.5, heightCm: 178 },
      routines: [
        { id: 'pecho_esp', title: '🔥 Día de Pecho y Espalda', exerciseIds: ['incline_db', 'seated_row', 'lat_pull', 'chest_fly', 'rear_delt'] },
        { id: 'arm_day', title: '💪 Día de Brazo y Hombro', exerciseIds: ['hammer_curl', 'tricep_rope', 'shoulder_press', 'bicep_bar'] },
        { id: 'leg_day', title: '🦵 Día de Pierna Completa', exerciseIds: ['leg_curl', 'bulgarian', 'squat_bar', 'calf_raise'] }
      ],
      shoppingList: [
        { id: 1, text: 'Saco de pienso para los pavos', done: false },
        { id: 2, text: 'Pechuga de pollo y huevos', done: false }
      ],
      workoutFeed: [
        {
          id: 101,
          user: 'Tú (@cvalientem04)',
          date: getTodayISO(),
          title: '🔥 Día de Pecho y Espalda',
          duration: '42min',
          volumeKg: 7471,
          setsCount: 16,
          muscles: ['Pecho', 'Espalda', 'Hombros'],
          summaryLines: ['4x Remo en Polea Baja (60kg)', '3x Jalón al Pecho (60kg)', '3x Press Inclinado Mancuernas (22.5kg)'],
          note: 'Subiendo cargas con técnica estricta.',
          photoUrl: '',
          likes: 4
        }
      ],
      days: {}
    };

    // IMPORTANTE: DÍA VACÍO SIEMPRE EMPIEZA EN 0 PASOS (CORREGIDO)
    function createEmptyDay() {
      return {
        turkeys: { fedMorning: false, morningTime: '', waterGiven: false, waterTime: '', fedEvening: false, eveningTime: '' },
        animalTasks: { pavos: {}, gatos: {} },
        studyMinutes: 0,
        carMinutes: 0,
        steps: 0,
        bikeKm: 0,
        bikeMinutes: 0,
        bikeRoutes: [], // Guarda { id, date, name, km, mins, avgSpeed, maxSpeed, segments: [{pts, color, speed}] }
        ghostMode: false,
        meals: [],
        expenses: [],
        mood: '😄',
        journal: ''
      };
    }

    function getDayData(dateStr = currentDate) {
      if (!appState.days[dateStr]) appState.days[dateStr] = createEmptyDay();
      return appState.days[dateStr];
    }

    function saveToStorage() {
      SafeStorage.set(getUserStorageKey(), JSON.stringify(appState));
      refreshCurrentActiveView();
      queueDailyLogSync();
    }

    function getUserStorageKey() {
      return currentAuthSession?.user
        ? `${USER_STORAGE_PREFIX}${currentAuthSession.user.id}`
        : STORAGE_KEY;
    }

    function loadFromStorage() {
      const raw = SafeStorage.get(STORAGE_KEY);
      if (raw) {
        try { appState = Object.assign(appState, JSON.parse(raw)); } catch(e) {}
      }
      if (Object.keys(appState.days).length === 0) loadDemoData();
    }

    function switchToUserStorage(session) {
      if (!session?.user) return;
      const userStorageKey = `${USER_STORAGE_PREFIX}${session.user.id}`;
      const userRaw = SafeStorage.get(userStorageKey);
      if (userRaw) {
        try {
          appState = Object.assign(appState, JSON.parse(userRaw));
        } catch (error) {
          setAuthFeedback(`No se pudieron cargar tus datos locales: ${error.message}`, 'error', true);
        }
      } else {
        const sharedRaw = SafeStorage.get(STORAGE_KEY);
        if (sharedRaw) {
          try {
            SafeStorage.set(userStorageKey, sharedRaw);
            SafeStorage.remove(STORAGE_KEY);
          } catch (error) {
            setAuthFeedback(`No se pudieron migrar tus datos locales: ${error.message}`, 'error', true);
          }
        } else {
          appState.days = {};
          appState.shoppingList = [];
          appState.workoutFeed = [];
          appState.workoutCount = 0;
        }
      }
      SafeStorage.set(userStorageKey, JSON.stringify(appState));
      refreshCurrentActiveView();
    }

    function getDailyLogPayload(dateStr = currentDate) {
      const day = getDayData(dateStr);
      return {
        user_id: currentAuthSession.user.id,
        log_date: dateStr,
        steps: Math.max(0, Number(day.steps) || 0),
        study_minutes: Math.max(0, Number(day.studyMinutes) || 0),
        car_minutes: Math.max(0, Number(day.carMinutes) || 0),
        mood: day.mood || null,
        journal: day.journal || '',
        ghost_mode: !!day.ghostMode
      };
    }

    function queueDailyLogSync() {
      if (!currentAuthSession?.user) return;
      clearTimeout(dailyLogSaveTimer);
      dailyLogSaveTimer = setTimeout(() => {
        saveDailyLogToSupabase(currentDate);
      }, 400);
    }

    async function saveDailyLogToSupabase(dateStr) {
      if (!currentAuthSession?.user) return;
      const payload = getDailyLogPayload(dateStr);
      const { error } = await lifeosSupabase
        .from('daily_logs')
        .upsert(payload, { onConflict: 'user_id,log_date' });

      if (error) {
        setAuthFeedback(`No se pudo sincronizar el día: ${error.message}`, 'error', true);
      }
    }

    async function loadDailyLogFromSupabase(dateStr = currentDate) {
      if (!currentAuthSession?.user) return;
      const { data, error } = await lifeosSupabase
        .from('daily_logs')
        .select('log_date, steps, study_minutes, car_minutes, mood, journal, ghost_mode')
        .eq('user_id', currentAuthSession.user.id)
        .eq('log_date', dateStr)
        .maybeSingle();

      if (error) {
        setAuthFeedback(`No se pudo cargar el día: ${error.message}`, 'error', true);
        return;
      }
      if (!data) return;

      const day = getDayData(dateStr);
      day.steps = data.steps;
      day.studyMinutes = data.study_minutes;
      day.carMinutes = data.car_minutes;
      day.mood = data.mood || '😄';
      day.journal = data.journal || '';
      day.ghostMode = !!data.ghost_mode;
      SafeStorage.set(getUserStorageKey(), JSON.stringify(appState));
      refreshCurrentActiveView();
    }

    async function syncWorkoutToSupabase(workout, exercises) {
      if (!currentAuthSession?.user || workout.supabaseId) return;

      const { data: createdWorkout, error: workoutError } = await lifeosSupabase
        .from('workouts')
        .insert({
          user_id: currentAuthSession.user.id,
          workout_date: workout.date,
          title: workout.title,
          duration_minutes: Number.parseInt(workout.duration, 10) || 0,
          volume_kg: Number(workout.volumeKg) || 0,
          sets_count: Number(workout.setsCount) || 0,
          notes: workout.note || '',
          photo_url: null
        })
        .select('id')
        .single();

      if (workoutError) {
        setAuthFeedback(`No se pudo sincronizar el entrenamiento: ${workoutError.message}`, 'error', true);
        return;
      }

      const sets = exercises.flatMap(exercise => exercise.sets
        .filter(set => set.done)
        .map((set, index) => ({
          workout_id: createdWorkout.id,
          exercise_name: exercise.name,
          muscle: exercise.muscle || null,
          set_number: index + 1,
          weight_kg: Math.max(0, Number(set.kg) || 0),
          reps: Math.max(0, Number(set.reps) || 0),
          completed: true
        })));

      if (sets.length > 0) {
        const { error: setsError } = await lifeosSupabase
          .from('workout_sets')
          .insert(sets);
        if (setsError) {
          setAuthFeedback(`El entrenamiento se guardó, pero no sus series: ${setsError.message}`, 'error', true);
          return;
        }
      }

      workout.supabaseId = createdWorkout.id;
      SafeStorage.set(getUserStorageKey(), JSON.stringify(appState));
      setAuthFeedback('Entrenamiento sincronizado correctamente.', 'info', true);
    }

    async function loadWorkoutsFromSupabase() {
      if (!currentAuthSession?.user) return;

      const { data, error } = await lifeosSupabase
        .from('workouts')
        .select('id, workout_date, title, duration_minutes, volume_kg, sets_count, notes, photo_url, workout_sets(exercise_name, muscle, set_number, weight_kg, reps, completed)')
        .eq('user_id', currentAuthSession.user.id)
        .order('workout_date', { ascending: false });

      if (error) {
        setAuthFeedback(`No se pudo cargar el historial de entrenamientos: ${error.message}`, 'error', true);
        return;
      }

      const remoteWorkouts = data.map(workout => ({
        id: `supabase-${workout.id}`,
        supabaseId: workout.id,
        user: 'Tú',
        date: workout.workout_date,
        title: workout.title,
        duration: `${workout.duration_minutes || 0}min`,
        volumeKg: Number(workout.volume_kg) || 0,
        setsCount: workout.sets_count || 0,
        muscles: [...new Set((workout.workout_sets || []).map(set => set.muscle).filter(Boolean))],
        summaryLines: [...new Set((workout.workout_sets || []).map(set => `${set.exercise_name} (${set.weight_kg}kg x ${set.reps})`))],
        note: workout.notes || '',
        photoUrl: workout.photo_url || '',
        likes: 1
      }));

      const localRemoteIds = new Set(appState.workoutFeed.map(workout => workout.supabaseId).filter(Boolean));
      appState.workoutFeed.push(...remoteWorkouts.filter(workout => !localRemoteIds.has(workout.supabaseId)));
      SafeStorage.set(getUserStorageKey(), JSON.stringify(appState));
      refreshCurrentActiveView();
    }

    async function syncExpenseToSupabase(expense, dateStr = currentDate) {
      if (!currentAuthSession?.user || expense.supabaseId) return;
      const { data, error } = await lifeosSupabase
        .from('expenses')
        .insert({
          user_id: currentAuthSession.user.id,
          expense_date: dateStr,
          description: expense.desc,
          amount: Math.max(0, Number(expense.amount) || 0)
        })
        .select('id')
        .single();

      if (error) {
        setAuthFeedback(`No se pudo sincronizar el gasto: ${error.message}`, 'error', true);
        return;
      }
      expense.supabaseId = data.id;
      SafeStorage.set(getUserStorageKey(), JSON.stringify(appState));
    }

    async function loadExpensesFromSupabase() {
      if (!currentAuthSession?.user) return;
      const { data, error } = await lifeosSupabase
        .from('expenses')
        .select('id, expense_date, description, amount')
        .eq('user_id', currentAuthSession.user.id)
        .order('expense_date', { ascending: false });

      if (error) {
        setAuthFeedback(`No se pudieron cargar los gastos: ${error.message}`, 'error', true);
        return;
      }

      const knownIds = new Set(Object.values(appState.days)
        .flatMap(day => day.expenses || [])
        .map(expense => expense.supabaseId)
        .filter(Boolean));
      data.forEach(expense => {
        if (knownIds.has(expense.id)) return;
        const day = getDayData(expense.expense_date);
        day.expenses.push({
          id: `supabase-${expense.id}`,
          supabaseId: expense.id,
          amount: Number(expense.amount) || 0,
          desc: expense.description
        });
      });
      SafeStorage.set(getUserStorageKey(), JSON.stringify(appState));
      refreshCurrentActiveView();
    }

    async function syncShoppingItemToSupabase(item) {
      if (!currentAuthSession?.user || item.supabaseId) return;
      const { data, error } = await lifeosSupabase
        .from('shopping_items')
        .insert({
          user_id: currentAuthSession.user.id,
          text: item.text,
          done: !!item.done,
          done_at: item.doneAt ? new Date(item.doneAt).toISOString() : null
        })
        .select('id')
        .single();

      if (error) {
        setAuthFeedback(`No se pudo sincronizar la compra: ${error.message}`, 'error', true);
        return;
      }
      item.supabaseId = data.id;
      SafeStorage.set(getUserStorageKey(), JSON.stringify(appState));
    }

    async function updateShoppingItemInSupabase(item) {
      if (!currentAuthSession?.user || !item.supabaseId) return;
      const { error } = await lifeosSupabase
        .from('shopping_items')
        .update({
          text: item.text,
          done: !!item.done,
          done_at: item.doneAt ? new Date(item.doneAt).toISOString() : null
        })
        .eq('id', item.supabaseId);
      if (error) setAuthFeedback(`No se pudo actualizar la compra: ${error.message}`, 'error', true);
    }

    async function loadShoppingItemsFromSupabase() {
      if (!currentAuthSession?.user) return;
      const { data, error } = await lifeosSupabase
        .from('shopping_items')
        .select('id, text, done, done_at')
        .eq('user_id', currentAuthSession.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        setAuthFeedback(`No se pudo cargar la lista de la compra: ${error.message}`, 'error', true);
        return;
      }

      const knownIds = new Set(appState.shoppingList.map(item => item.supabaseId).filter(Boolean));
      const remoteItems = data.filter(item => !knownIds.has(item.id)).map(item => ({
        id: `supabase-${item.id}`,
        supabaseId: item.id,
        text: item.text,
        done: item.done,
        doneAt: item.done_at ? Date.parse(item.done_at) : 0
      }));
      appState.shoppingList.push(...remoteItems);
      SafeStorage.set(getUserStorageKey(), JSON.stringify(appState));
      refreshCurrentActiveView();
    }

    async function syncAnimalTasksToSupabase(day, dateStr = currentDate) {
      if (!currentAuthSession?.user) return;
      ensureAnimalTasks(day);
      const rows = ['pavos', 'gatos'].flatMap(animalType =>
        ['fedMorning', 'waterGiven', 'fedEvening'].map(taskKey => {
          const completed = !!day.animalTasks[animalType][taskKey];
          return {
            user_id: currentAuthSession.user.id,
            task_date: dateStr,
            animal_type: animalType,
            task_key: taskKey,
            completed,
            completed_at: completed ? new Date().toISOString() : null
          };
        })
      );
      const { error } = await lifeosSupabase
        .from('animal_tasks')
        .upsert(rows, { onConflict: 'user_id,task_date,animal_type,task_key' });
      if (error) setAuthFeedback(`No se pudieron sincronizar las tareas: ${error.message}`, 'error', true);
    }

    async function loadAnimalTasksFromSupabase() {
      if (!currentAuthSession?.user) return;
      const { data, error } = await lifeosSupabase
        .from('animal_tasks')
        .select('task_date, animal_type, task_key, completed')
        .eq('user_id', currentAuthSession.user.id);

      if (error) {
        setAuthFeedback(`No se pudieron cargar las tareas: ${error.message}`, 'error', true);
        return;
      }
      data.forEach(task => {
        const day = getDayData(task.task_date);
        ensureAnimalTasks(day);
        day.animalTasks[task.animal_type][task.task_key] = !!task.completed;
        if (task.animal_type === 'pavos') syncPavosToTurkeys(day);
      });
      SafeStorage.set(getUserStorageKey(), JSON.stringify(appState));
      refreshCurrentActiveView();
    }

    async function syncBikeRouteToSupabase(route) {
      if (!currentAuthSession?.user || route.supabaseId) return false;
      const { data, error } = await lifeosSupabase
        .from('bike_routes')
        .insert({
          user_id: currentAuthSession.user.id,
          route_date: route.date,
          name: route.name || '',
          distance_km: Math.max(0, Number(route.km) || 0),
          duration_minutes: Math.max(0, Number(route.mins) || 0),
          average_speed_kmh: Math.max(0, Number(route.avgSpeed) || 0),
          max_speed_kmh: Math.max(0, Number(route.maxSpeed) || 0),
          segments: Array.isArray(route.segments) ? route.segments : []
        })
        .select('id')
        .single();

      if (error) {
        setAuthFeedback(`No se pudo sincronizar la ruta: ${error.message}`, 'error', true);
        return false;
      }
      route.supabaseId = data.id;
      delete route.syncPending;
      SafeStorage.set(getUserStorageKey(), JSON.stringify(appState));
      setAuthFeedback('Ruta sincronizada correctamente.', 'info', true);
      return true;
    }

    async function syncPendingBikeRoutesToSupabase() {
      if (!currentAuthSession?.user) return;
      const pendingRoutes = Object.values(appState.days)
        .flatMap(day => day.bikeRoutes || [])
        .filter(route => route.syncPending && !route.supabaseId);

      for (const route of pendingRoutes) {
        await syncBikeRouteToSupabase(route);
      }
    }

    async function loadBikeRoutesFromSupabase() {
      if (!currentAuthSession?.user) return;
      const { data, error } = await lifeosSupabase
        .from('bike_routes')
        .select('id, route_date, name, distance_km, duration_minutes, average_speed_kmh, max_speed_kmh, segments')
        .eq('user_id', currentAuthSession.user.id)
        .order('route_date', { ascending: false });

      if (error) {
        setAuthFeedback(`No se pudo cargar el historial de rutas: ${error.message}`, 'error', true);
        return;
      }

      const knownIds = new Set(Object.values(appState.days)
        .flatMap(day => day.bikeRoutes || [])
        .map(route => route.supabaseId)
        .filter(Boolean));

      data.forEach(route => {
        if (knownIds.has(route.id)) return;
        const day = getDayData(route.route_date);
        if (!day.bikeRoutes) day.bikeRoutes = [];
        day.bikeRoutes.push({
          id: `supabase-${route.id}`,
          supabaseId: route.id,
          date: route.route_date,
          timeStr: '',
          name: route.name || '',
          km: Number(route.distance_km) || 0,
          mins: Number(route.duration_minutes) || 0,
          avgSpeed: Number(route.average_speed_kmh) || 0,
          maxSpeed: Number(route.max_speed_kmh) || 0,
          segments: Array.isArray(route.segments) ? route.segments : []
        });
        day.bikeKm = Number(((day.bikeKm || 0) + (Number(route.distance_km) || 0)).toFixed(2));
        day.bikeMinutes = Number(((day.bikeMinutes || 0) + (Number(route.duration_minutes) || 0)).toFixed(2));
      });

      SafeStorage.set(getUserStorageKey(), JSON.stringify(appState));
      refreshCurrentActiveView();
    }

    async function syncMealToSupabase(meal, dateStr = currentDate) {
      if (!currentAuthSession?.user || meal.supabaseId) return;
      const { data, error } = await lifeosSupabase
        .from('meals')
        .insert({
          user_id: currentAuthSession.user.id,
          meal_date: dateStr,
          description: meal.desc
        })
        .select('id')
        .single();

      if (error) {
        setAuthFeedback(`No se pudo sincronizar la comida: ${error.message}`, 'error', true);
        return;
      }
      meal.supabaseId = data.id;
      SafeStorage.set(getUserStorageKey(), JSON.stringify(appState));
    }

    async function loadMealsFromSupabase() {
      if (!currentAuthSession?.user) return;
      const { data, error } = await lifeosSupabase
        .from('meals')
        .select('id, meal_date, description')
        .eq('user_id', currentAuthSession.user.id)
        .order('meal_date', { ascending: false });

      if (error) {
        setAuthFeedback(`No se pudieron cargar las comidas: ${error.message}`, 'error', true);
        return;
      }

      const knownIds = new Set(Object.values(appState.days)
        .flatMap(day => day.meals || [])
        .map(meal => meal.supabaseId)
        .filter(Boolean));
      data.forEach(meal => {
        if (knownIds.has(meal.id)) return;
        const day = getDayData(meal.meal_date);
        day.meals.push({
          id: `supabase-${meal.id}`,
          supabaseId: meal.id,
          desc: meal.description
        });
      });
      SafeStorage.set(getUserStorageKey(), JSON.stringify(appState));
      refreshCurrentActiveView();
    }

    function setAuthFeedback(message, tone = 'info', signedIn = false) {
      const box = document.getElementById(signedIn ? 'authSignedInFeedback' : 'authFeedback');
      if (!box) return;
      box.textContent = message;
      box.className = `rounded-xl border p-3 text-xs leading-relaxed ${
        tone === 'error'
          ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
          : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
      }`;
    }

    function openAuthModal() {
      const modal = document.getElementById('authModal');
      if (modal) modal.classList.replace('hidden', 'flex');
    }

    function closeAuthModal() {
      const modal = document.getElementById('authModal');
      if (modal) modal.classList.replace('flex', 'hidden');
    }

    function getAuthCredentials() {
      const email = document.getElementById('authEmailInput')?.value.trim();
      const password = document.getElementById('authPasswordInput')?.value || '';
      if (!email || !password) {
        setAuthFeedback('Introduce tu email y tu contraseña.');
        return null;
      }
      return { email, password };
    }

    async function signInWithEmail() {
      const credentials = getAuthCredentials();
      if (!credentials) return;
      const { error } = await lifeosSupabase.auth.signInWithPassword(credentials);
      if (error) {
        setAuthFeedback(`No se pudo iniciar sesión: ${error.message}`, 'error');
        return;
      }
      setAuthFeedback('Sesión iniciada correctamente.');
    }

    async function signUpWithEmail() {
      const credentials = getAuthCredentials();
      if (!credentials) return;
      if (credentials.password.length < 6) {
        setAuthFeedback('La contraseña debe tener al menos 6 caracteres.', 'error');
        return;
      }
      const { data, error } = await lifeosSupabase.auth.signUp(credentials);
      if (error) {
        setAuthFeedback(`No se pudo crear la cuenta: ${error.message}`, 'error');
        return;
      }
      setAuthFeedback(data.session
        ? 'Cuenta creada y sesión iniciada.'
        : 'Cuenta creada. Revisa tu email para confirmar la dirección.');
    }

    async function sendPasswordReset() {
      const email = document.getElementById('authEmailInput')?.value.trim();
      if (!email) {
        setAuthFeedback('Escribe tu email para enviarte el enlace de recuperación.', 'error');
        return;
      }
      const resetOptions = window.location.protocol === 'http:' || window.location.protocol === 'https:'
        ? { redirectTo: window.location.href.split('#')[0] }
        : undefined;
      const { error } = await lifeosSupabase.auth.resetPasswordForEmail(email, resetOptions);
      if (error) {
        setAuthFeedback(`No se pudo enviar el enlace: ${error.message}`, 'error');
        return;
      }
      setAuthFeedback('Te hemos enviado un enlace para restablecer la contraseña.');
    }

    async function signOutFromLifeOS() {
      const { error } = await lifeosSupabase.auth.signOut();
      if (error) {
        setAuthFeedback(`No se pudo cerrar sesión: ${error.message}`, 'error', true);
        return;
      }
      closeAuthModal();
    }

    function showPasswordRecoveryFeedback(message, tone = 'info') {
      const box = document.getElementById('passwordRecoveryFeedback');
      if (!box) return;
      box.textContent = message;
      box.className = `rounded-xl border p-3 text-xs leading-relaxed ${
        tone === 'error'
          ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
          : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
      }`;
    }

    function openPasswordRecoveryModal() {
      const modal = document.getElementById('passwordRecoveryModal');
      if (modal) modal.classList.replace('hidden', 'flex');
    }

    async function updateRecoveredPassword() {
      const password = document.getElementById('newPasswordInput')?.value || '';
      const confirmation = document.getElementById('confirmPasswordInput')?.value || '';
      if (password.length < 6) {
        showPasswordRecoveryFeedback('La contraseña debe tener al menos 6 caracteres.', 'error');
        return;
      }
      if (password !== confirmation) {
        showPasswordRecoveryFeedback('Las contraseñas no coinciden.', 'error');
        return;
      }
      const { error } = await lifeosSupabase.auth.updateUser({ password });
      if (error) {
        showPasswordRecoveryFeedback(`No se pudo actualizar la contraseña: ${error.message}`, 'error');
        return;
      }
      document.getElementById('newPasswordInput').value = '';
      document.getElementById('confirmPasswordInput').value = '';
      showPasswordRecoveryFeedback('Contraseña actualizada. Ya puedes entrar con ella.');
      setTimeout(() => {
        const modal = document.getElementById('passwordRecoveryModal');
        if (modal) modal.classList.replace('flex', 'hidden');
        history.replaceState({}, document.title, window.location.pathname + window.location.search);
      }, 1200);
    }

    function renderAuthState(session) {
      const signedIn = !!session?.user;
      const button = document.getElementById('authHeaderButton');
      const signedOutForm = document.getElementById('authSignedOutForm');
      const signedInPanel = document.getElementById('authSignedInPanel');
      const email = document.getElementById('authCurrentEmail');
      if (!button || !signedOutForm || !signedInPanel) return;
      button.querySelector('span:last-child').textContent = signedIn ? 'Cuenta' : 'Entrar';
      signedOutForm.classList.toggle('hidden', signedIn);
      signedInPanel.classList.toggle('hidden', !signedIn);
      if (email) email.textContent = session?.user?.email || '';
    }

    async function syncUserProfile(session) {
      const user = session?.user;
      if (!user) return;

      const { data: existingProfile, error: profileError } = await lifeosSupabase
        .from('profiles')
        .select('id, username, display_name, weight_kg, height_cm')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        setAuthFeedback(`No se pudo cargar tu perfil: ${profileError.message}`, 'error', true);
        return;
      }

      let profile = existingProfile;
      if (!profile) {
        const { data: createdProfile, error: createError } = await lifeosSupabase
          .from('profiles')
          .insert({ id: user.id })
          .select('id, username, display_name, weight_kg, height_cm')
          .single();

        if (createError) {
          setAuthFeedback(`No se pudo crear tu perfil: ${createError.message}`, 'error', true);
          return;
        }
        profile = createdProfile;
      }

      if (profile.weight_kg !== null) appState.profile.weightKg = Number(profile.weight_kg);
      if (profile.height_cm !== null) appState.profile.heightCm = Number(profile.height_cm);
      const usernameInput = document.getElementById('profileUsernameInput');
      const displayNameInput = document.getElementById('profileDisplayNameInput');
      if (usernameInput) usernameInput.value = profile.username || '';
      if (displayNameInput) displayNameInput.value = profile.display_name || '';
      SafeStorage.set(getUserStorageKey(), JSON.stringify(appState));
      refreshCurrentActiveView();
      setAuthFeedback('Perfil sincronizado correctamente.', 'info', true);
    }

    async function saveUserProfile() {
      const { data: sessionData, error: sessionError } = await lifeosSupabase.auth.getSession();
      if (sessionError || !sessionData.session?.user) {
        setAuthFeedback('Necesitas iniciar sesión para guardar tu perfil.', 'error', true);
        return;
      }

      const username = document.getElementById('profileUsernameInput')?.value.trim().toLowerCase() || '';
      const displayName = document.getElementById('profileDisplayNameInput')?.value.trim() || '';
      if (!/^[a-z0-9_]{3,24}$/.test(username)) {
        setAuthFeedback('El usuario debe tener entre 3 y 24 caracteres: letras minúsculas, números o _.', 'error', true);
        return;
      }

      const { data: updatedProfile, error } = await lifeosSupabase
        .from('profiles')
        .update({ username, display_name: displayName || null })
        .eq('id', sessionData.session.user.id)
        .select('id, username, display_name, weight_kg, height_cm')
        .single();

      if (error) {
        const message = error.code === '23505'
          ? 'Ese nombre de usuario ya está ocupado. Elige otro.'
          : `No se pudo guardar el perfil: ${error.message}`;
        setAuthFeedback(message, 'error', true);
        return;
      }

      if (updatedProfile.weight_kg !== null) appState.profile.weightKg = Number(updatedProfile.weight_kg);
      if (updatedProfile.height_cm !== null) appState.profile.heightCm = Number(updatedProfile.height_cm);
      saveToStorage();
      setAuthFeedback('Perfil guardado correctamente.', 'info', true);
    }

    async function initializeAuth() {
      const { data, error } = await lifeosSupabase.auth.getSession();
      if (error) {
        setAuthFeedback(`No se pudo comprobar la sesión: ${error.message}`, 'error');
      } else {
        currentAuthSession = data.session;
        renderAuthState(data.session);
        switchToUserStorage(data.session);
        await syncUserProfile(data.session);
        await loadDailyLogFromSupabase(currentDate);
        await loadWorkoutsFromSupabase();
        await loadExpensesFromSupabase();
        await loadShoppingItemsFromSupabase();
        await loadAnimalTasksFromSupabase();
        await loadBikeRoutesFromSupabase();
        await syncPendingBikeRoutesToSupabase();
        await loadMealsFromSupabase();
      }
      if (window.location.hash.includes('type=recovery')) openPasswordRecoveryModal();
      lifeosSupabase.auth.onAuthStateChange((event, session) => {
        currentAuthSession = session;
        renderAuthState(session);
        if (event === 'SIGNED_IN') {
          setTimeout(async () => {
            switchToUserStorage(session);
            await syncUserProfile(session);
            await loadDailyLogFromSupabase(currentDate);
            await loadWorkoutsFromSupabase();
            await loadExpensesFromSupabase();
            await loadShoppingItemsFromSupabase();
            await loadAnimalTasksFromSupabase();
            await loadBikeRoutesFromSupabase();
            await syncPendingBikeRoutesToSupabase();
            await loadMealsFromSupabase();
          }, 0);
        }
        if (event === 'PASSWORD_RECOVERY') openPasswordRecoveryModal();
      });
    }

    function formatHumanDate(isoStr) {
      try {
        const d = new Date(isoStr + 'T12:00:00');
        return d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
      } catch(e) { return isoStr; }
    }

    // --- ACTUALIZAR TODAS LAS VISTAS AL CAMBIAR DE FECHA ---
    function refreshCurrentActiveView() {
      document.getElementById('currentDatePicker').value = currentDate;
      const isToday = currentDate === getTodayISO();
      document.getElementById('headerReadableDate').textContent = isToday
        ? `Hoy (${formatHumanDate(currentDate)})`
        : formatHumanDate(currentDate);
      renderStreakAndGhostMode();

      renderHomeView();
      if (currentActiveTab === 'gym') renderGymSection();
      if (currentActiveTab === 'bikemap') renderBikeStepsView();
      if (currentActiveTab === 'hogar') renderHogarView();
      if (currentActiveTab === 'weekly') renderWeeklyClearAudit();
      if (currentActiveTab === 'journal') renderJournalCombinedView();
    }

    function onDateChange(val) {
      if (!val) return;
      currentDate = val;
      refreshCurrentActiveView();
      loadDailyLogFromSupabase(currentDate);
    }

    function changeDay(offset) {
      const d = new Date(currentDate + 'T12:00:00');
      d.setDate(d.getDate() + offset);
      currentDate = d.toISOString().split('T')[0];
      refreshCurrentActiveView();
      loadDailyLogFromSupabase(currentDate);
    }

    function setAppMode(mode) {
      currentAppMode = mode;
      ['ALL', 'CLUB', 'HOME'].forEach(m => {
        const b1 = document.getElementById('mode-btn-' + m);
        const b2 = document.getElementById('top-mode-' + m);
        if (b1) b1.className = m === mode ? 'py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-extrabold' : 'py-1.5 rounded-lg text-slate-400 hover:text-white';
        if (b2) b2.className = m === mode ? 'px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 font-extrabold transition' : 'px-2.5 py-1 rounded-lg text-slate-400 transition';
      });
      document.querySelectorAll('[data-scope]').forEach(el => {
        const sc = el.getAttribute('data-scope');
        el.classList.toggle('hidden', !(mode === 'ALL' || sc === 'ALL' || sc === mode));
      });
      document.querySelectorAll('[data-card-scope]').forEach(el => {
        const sc = el.getAttribute('data-card-scope');
        el.classList.toggle('hidden', !(mode === 'ALL' || sc === 'ALL' || sc === mode));
      });
      const activeMobileButton = document.getElementById('mtab-' + currentActiveTab);
      if (activeMobileButton && activeMobileButton.classList.contains('hidden')) {
        switchTab('home');
        return;
      }
      requestAnimationFrame(() => moveDockBubbleToActiveTab(currentActiveTab));
    }

    function switchTab(tabId) {
      currentActiveTab = tabId;
      const tabs = ['home', 'gym', 'bikemap', 'hogar', 'weekly', 'journal'];
      tabs.forEach(t => {
        const view = document.getElementById('view-' + t);
        const dbtn = document.getElementById('dtab-' + t);
        const mbtn = document.getElementById('mtab-' + t);
        if (view) view.classList.toggle('hidden', t !== tabId);
        if (dbtn) dbtn.classList.toggle('active', t === tabId);
        if (mbtn) mbtn.classList.toggle('active', t === tabId);
      });
        moveDockBubbleToActiveTab(tabId);

      const minBanner = document.getElementById('minimizedWorkoutBanner');
      if (minBanner) minBanner.classList.toggle('hidden', !(activeWorkout.running && tabId !== 'gym'));

      refreshCurrentActiveView();
      if (tabId === 'bikemap') {
        setTimeout(() => {
          initBikeMapIfNeeded();
          if (bikeMap) bikeMap.invalidateSize();
          renderSavedBikeRoutesHistory();
        }, 120);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function getWeekKey(dateStr = currentDate) {
      const date = new Date(dateStr + 'T12:00:00');
      const day = date.getDay() || 7;
      date.setDate(date.getDate() + 4 - day);
      const yearStart = new Date(date.getFullYear(), 0, 1);
      return `${date.getFullYear()}-${Math.ceil((((date - yearStart) / 86400000) + 1) / 7)}`;
    }

    function isWorkoutDay(dateStr) {
      return appState.workoutFeed.some(w => w.date === dateStr && w.user.startsWith('Tú'));
    }

    function isStreakDay(dateStr) {
      const day = appState.days[dateStr];
      if (!day) return false;
      const turkeyCount = (day.turkeys.fedMorning ? 1 : 0) + (day.turkeys.waterGiven ? 1 : 0) + (day.turkeys.fedEvening ? 1 : 0);
      return (day.steps || 0) >= 6000 || isWorkoutDay(dateStr) || !!day.ghostMode || turkeyCount >= 2;
    }

    function getCurrentStreak() {
      let streak = 0;
      const date = new Date(currentDate + 'T12:00:00');
      while (streak < 365) {
        const iso = date.toISOString().split('T')[0];
        if (!isStreakDay(iso)) break;
        streak++;
        date.setDate(date.getDate() - 1);
      }
      return streak;
    }

    function getGhostUsesThisWeek() {
      return Object.keys(appState.days).filter(dateStr =>
        getWeekKey(dateStr) === getWeekKey(currentDate) && appState.days[dateStr].ghostMode
      ).length;
    }

    function renderStreakAndGhostMode() {
      const day = getDayData(currentDate);
      const streakEl = document.getElementById('topStreakNum');
      const button = document.getElementById('ghostModeButton');
      if (streakEl) streakEl.textContent = getCurrentStreak();
      if (!button) return;

      const uses = getGhostUsesThisWeek();
      const canActivate = (day.steps || 0) >= 5000 && uses < 2;
      button.classList.toggle('ghost-mode-ready', canActivate && !day.ghostMode);
      button.classList.toggle('bg-emerald-500/20', !!day.ghostMode);
      button.classList.toggle('border-emerald-500/40', !!day.ghostMode);
      button.classList.toggle('text-emerald-300', !!day.ghostMode);
      button.classList.toggle('border-slate-800', !day.ghostMode);
      button.classList.toggle('text-slate-400', !day.ghostMode);
      button.disabled = !day.ghostMode && !canActivate;
      button.title = day.ghostMode
        ? `Modo fantasma activo para ${formatHumanDate(currentDate)}: este día protege tu racha`
        : canActivate
          ? `Activar modo fantasma para ${formatHumanDate(currentDate)} (${2 - uses} uso${2 - uses === 1 ? '' : 's'} disponible${2 - uses === 1 ? '' : 's'})`
          : `Necesitas 5.000 pasos y quedan ${Math.max(0, 2 - uses)} usos esta semana`;
      button.setAttribute('aria-pressed', day.ghostMode ? 'true' : 'false');
      button.setAttribute('aria-label', day.ghostMode
        ? `Modo fantasma activo para ${formatHumanDate(currentDate)}`
        : `Modo fantasma, ${uses} de 2 usos semanales`);
    }

    function toggleGhostMode() {
      const day = getDayData(currentDate);
      if (day.ghostMode) return;
      const uses = getGhostUsesThisWeek();
      if ((day.steps || 0) < 5000 || uses >= 2) {
        renderStreakAndGhostMode();
        return;
      }
      day.ghostMode = true;
      saveToStorage();
    }

    function moveDockBubbleToActiveTab(tabId) {
      const dock = document.querySelector('.bottom-dock');
      const bubble = document.getElementById('ios-floating-bubble');
      const activeButton = document.getElementById('mtab-' + tabId);
      if (!dock || !bubble || !activeButton) return;
      const dockRect = dock.getBoundingClientRect();
      const buttonRect = activeButton.getBoundingClientRect();
      if (!buttonRect.width || !buttonRect.height) return;
      bubble.style.width = `${buttonRect.width}px`;
      bubble.style.setProperty('--dock-bubble-x', `${buttonRect.left - dockRect.left}px`);
    }
