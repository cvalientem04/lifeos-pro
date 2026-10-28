    // =========================================================================
    // --- GPS REAL DE BICICLETA + HISTORIAL GUARDADO POR DÍA ---
    // =========================================================================
    let bikeMap = null, currentTileLayer = null, riderMarker = null, gpsWatchId = null, rideClockId = null;
    let previewRouteLayerGroup = null;
    let liveRide = {
      active: false,
      startTimeMs: 0,
      elapsedSeconds: 0,
      totalDistKm: 0,
      currentSpeedKmh: 0,
      maxSpeedKmh: 0,
      speedSamples: [],
      points: [],
      segments: [], // { pts: [[lat,lng],[lat,lng]], color, speed }
      polylines: []
    };

    function initBikeMapIfNeeded() {
      if (bikeMap) return;
      const el = document.getElementById('bike-map');
      if (!el) return;
      bikeMap = L.map('bike-map').setView([39.5696, 2.6502], 14);
      previewRouteLayerGroup = L.layerGroup().addTo(bikeMap);
      changeBikeMapStyle('esri_street');
    }

    function changeBikeMapStyle(k) {
      if (!bikeMap) return;
      if (currentTileLayer) bikeMap.removeLayer(currentTileLayer);
      const url = k === 'esri_sat'
        ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
        : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}';
      currentTileLayer = L.tileLayer(url, { maxZoom: 19 }).addTo(bikeMap);
    }

    function centerMapOnMe() {
      initBikeMapIfNeeded();
      const badge = document.getElementById('gpsLiveStatusBadge');
      if (!navigator.geolocation) {
        if (badge) badge.textContent = '⚠️ Navegador sin GPS';
        return;
      }
      if (badge) badge.textContent = '📡 Solicitando permiso GPS...';
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const latlng = [pos.coords.latitude, pos.coords.longitude];
          bikeMap.setView(latlng, 16);
          updateLiveRiderDot(latlng);
          if (badge) badge.textContent = `🟢 GPS Activo (±${Math.round(pos.coords.accuracy)}m)`;
        },
        (err) => {
          if (err.code === 1) {
            if (badge) badge.textContent = '🔒 Bloqueado en iPhone: Ve a Ajustes > Privacidad > Localización';
            alert('Tu iPhone tiene bloqueada la ubicación para este navegador.\n\nPara activarla:\n1. Abre Ajustes del iPhone > Privacidad y seguridad > Localización.\n2. Busca tu navegador (Safari / Chrome / Google) y ponlo en "Cuando se use la app".');
          } else {
            if (badge) badge.textContent = '📡 Buscando señal GPS exterior...';
          }
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
      );
    }

    function updateLiveRiderDot(latlng) {
      if (!bikeMap) return;
      const icon = L.divIcon({ className: '', html: `<div class="gps-live-dot"></div>`, iconSize: [16, 16], iconAnchor: [8, 8] });
      if (!riderMarker) riderMarker = L.marker(latlng, { icon }).addTo(bikeMap);
      else riderMarker.setLatLng(latlng);
    }

    function getSpeedColor(s) {
      if (s < 12) return '#3b82f6';
      if (s < 22) return '#10b981';
      if (s < 30) return '#f59e0b';
      return '#f43f5e';
    }

    function startRealGPSTracking() {
      initBikeMapIfNeeded();
      if (!navigator.geolocation) {
        alert('Tu navegador no tiene acceso al GPS.');
        return;
      }
      if (previewRouteLayerGroup) previewRouteLayerGroup.clearLayers();
      liveRide.polylines.forEach(p => bikeMap.removeLayer(p));

      liveRide = {
        active: true,
        startTimeMs: Date.now(),
        elapsedSeconds: 0,
        totalDistKm: 0,
        currentSpeedKmh: 0,
        maxSpeedKmh: 0,
        speedSamples: [],
        points: [],
        segments: [],
        polylines: []
      };

      document.getElementById('btnStartLiveGPS').classList.add('hidden');
      document.getElementById('btnStopSaveGPS').classList.remove('hidden');
      document.getElementById('gpsLiveStatusBadge').textContent = '📡 Conectando satélites GPS...';

      // Cronómetro en vivo desde el segundo 1
      if (rideClockId) clearInterval(rideClockId);
      rideClockId = setInterval(() => {
        if (!liveRide.active) return;
        liveRide.elapsedSeconds = Math.floor((Date.now() - liveRide.startTimeMs) / 1000);
        const mins = Math.floor(liveRide.elapsedSeconds / 60);
        const secs = String(liveRide.elapsedSeconds % 60).padStart(2, '0');
        document.getElementById('liveDurationClock').textContent = `${String(mins).padStart(2, '0')}:${secs}`;
      }, 1000);

      // Primera lectura inmediata + seguimiento continuo
      centerMapOnMe();

      gpsWatchId = navigator.geolocation.watchPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const nowMs = Date.now();
          const newPt = L.latLng(lat, lng);
          let speedKmh = 0;

          if (liveRide.points.length > 0) {
            const prev = liveRide.points[liveRide.points.length - 1];
            const prevPt = L.latLng(prev.lat, prev.lng);
            const distM = prevPt.distanceTo(newPt);
            const dtSec = Math.max(1, (nowMs - prev.timeMs) / 1000);

            if (pos.coords.speed !== null && pos.coords.speed >= 0) {
              speedKmh = pos.coords.speed * 3.6;
            } else {
              speedKmh = (distM / dtSec) * 3.6;
            }
            speedKmh = Math.min(75, Math.max(0, speedKmh));

            if (distM >= 2) {
              liveRide.totalDistKm += distM / 1000;
              liveRide.currentSpeedKmh = speedKmh;
              if (speedKmh > liveRide.maxSpeedKmh) liveRide.maxSpeedKmh = speedKmh;
              liveRide.speedSamples.push(speedKmh);

              const col = getSpeedColor(speedKmh);
              const segCoords = [[prev.lat, prev.lng], [lat, lng]];
              const poly = L.polyline(segCoords, { color: col, weight: 6 }).addTo(bikeMap);
              liveRide.polylines.push(poly);
              liveRide.segments.push({ pts: segCoords, color: col, speed: Number(speedKmh.toFixed(1)) });
            }
          }

          liveRide.points.push({ lat, lng, timeMs: nowMs });
          updateLiveRiderDot([lat, lng]);
          bikeMap.panTo([lat, lng]);

          const avg = liveRide.speedSamples.length > 0
            ? liveRide.speedSamples.reduce((a, b) => a + b, 0) / liveRide.speedSamples.length
            : 0;

          document.getElementById('gpsLiveStatusBadge').textContent = `🟢 Grabando GPS (±${Math.round(pos.coords.accuracy || 8)}m)`;
          document.getElementById('liveSpeedVal').textContent = speedKmh.toFixed(1);
          document.getElementById('liveDistKmVal').textContent = liveRide.totalDistKm.toFixed(2);
          document.getElementById('liveAvgSpeedVal').textContent = avg.toFixed(1);
        },
        (err) => {
          document.getElementById('gpsLiveStatusBadge').textContent = '⚠️ Permiso de ubicación bloqueado en el móvil';
        },
        { enableHighAccuracy: true, maximumAge: 1000, timeout: 15000 }
      );
    }

    function finishAndSaveLiveRide() {
      if (gpsWatchId !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(gpsWatchId);
        gpsWatchId = null;
      }
      if (rideClockId) clearInterval(rideClockId);
      liveRide.active = false;

      document.getElementById('btnStartLiveGPS').classList.remove('hidden');
      document.getElementById('btnStopSaveGPS').classList.add('hidden');

      const km = Number(liveRide.totalDistKm.toFixed(2));
      const mins = Math.max(1, Math.round(liveRide.elapsedSeconds / 60));
      const avgSpeed = liveRide.speedSamples.length > 0
        ? Number((liveRide.speedSamples.reduce((a, b) => a + b, 0) / liveRide.speedSamples.length).toFixed(1))
        : 0;
      const maxSpeed = Number(liveRide.maxSpeedKmh.toFixed(1));

      const day = getDayData(currentDate);
      if (!day.bikeRoutes) day.bikeRoutes = [];

      day.bikeRoutes.unshift({
        id: Date.now(),
        date: currentDate,
        timeStr: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        km,
        mins,
        avgSpeed,
        maxSpeed,
        segments: liveRide.segments
      });

      day.bikeKm = Number(((day.bikeKm || 0) + km).toFixed(2));
      day.bikeMinutes = (day.bikeMinutes || 0) + mins;

      document.getElementById('gpsLiveStatusBadge').textContent = `✔ Ruta guardada en ${formatHumanDate(currentDate)}`;
      saveToStorage();
      renderSavedBikeRoutesHistory();
    }

    // Mostrar historial de rutas guardadas (del día actual y de otros días) y poder pintarlas al tocarlas
    function renderSavedBikeRoutesHistory() {
      const box = document.getElementById('savedBikeRoutesHistoryList');
      if (!box) return;

      const allSaved = [];
      Object.keys(appState.days).sort().reverse().forEach(dStr => {
        (appState.days[dStr].bikeRoutes || []).forEach(r => {
          allSaved.push({ ...r, date: dStr });
        });
      });

      if (allSaved.length === 0) {
        box.innerHTML = `<p class="text-xs text-slate-500 italic">Aún no hay rutas guardadas. Cuando finalices una ruta GPS aparecerá aquí con su fecha, velocidad media, minutos y trazado.</p>`;
        return;
      }

      box.innerHTML = allSaved.map(r => `
        <div onclick="replaySavedRouteOnMap(${r.id}, '${r.date}')" class="cursor-pointer bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl p-3 flex items-center justify-between transition">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-extrabold text-white capitalize">📅 ${formatHumanDate(r.date)}</span>
              <span class="text-[10px] font-mono text-slate-400">${r.timeStr || ''}</span>
            </div>
            <p class="text-[11px] font-mono text-emerald-400 mt-0.5">
              ⚡ Media: <b>${r.avgSpeed || 0} km/h</b> • Máx: <b>${r.maxSpeed || 0} km/h</b>
            </p>
          </div>
          <div class="text-right">
            <span class="text-sm font-extrabold font-mono text-cyan-400 block">${r.km} km</span>
            <span class="text-[10px] font-mono text-amber-300">${r.mins} min • Ver 🗺️</span>
          </div>
        </div>
      `).join('');
    }

    function replaySavedRouteOnMap(routeId, dateStr) {
      initBikeMapIfNeeded();
      const day = getDayData(dateStr);
      const r = (day.bikeRoutes || []).find(x => x.id === routeId);
      if (!r) return;

      if (previewRouteLayerGroup) previewRouteLayerGroup.clearLayers();
      const boundsPts = [];

      (r.segments || []).forEach(seg => {
        L.polyline(seg.pts, { color: seg.color || '#10b981', weight: 6 }).addTo(previewRouteLayerGroup);
        seg.pts.forEach(p => boundsPts.push(p));
      });

      if (boundsPts.length > 0) {
        bikeMap.fitBounds(boundsPts, { padding: [25, 25] });
      }
      document.getElementById('liveDistKmVal').textContent = r.km;
      document.getElementById('liveAvgSpeedVal').textContent = r.avgSpeed || 0;
      document.getElementById('liveDurationClock').textContent = `${r.mins}m`;
      document.getElementById('gpsLiveStatusBadge').textContent = `🗺️ Viendo ruta del ${formatHumanDate(dateStr)}`;
    }

