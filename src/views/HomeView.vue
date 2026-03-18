<template>
  <div class="page">

    <!-- ── Hero (mobile) ── -->
    <div class="hero">
      <div class="orb orb-a" /><div class="orb orb-b" />
      <div class="hero-body">
        <div class="hero-text">
          <p class="hero-date">{{ todayLabel }}</p>
          <h1 class="hero-title">{{ heroTitle }}</h1>
          <p class="hero-sub">{{ heroSub }}</p>
        </div>
        <div v-if="store.vehicles.length > 0" class="stat-strip">
          <div class="stat-item">
            <span class="stat-num">{{ store.stats.ok }}</span>
            <span class="stat-lbl">In regola</span>
          </div>
          <div class="stat-sep" />
          <div class="stat-item">
            <span class="stat-num">{{ store.stats.warn }}</span>
            <span class="stat-lbl">In scadenza</span>
          </div>
          <div class="stat-sep" />
          <div class="stat-item">
            <span class="stat-num" :class="store.stats.danger > 0 ? 'stat-urgent' : ''">{{ store.stats.danger }}</span>
            <span class="stat-lbl">Urgenti</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Desktop header (solo desktop) ── -->
    <div class="desktop-header">
      <div class="desktop-header-inner">
        <div>
          <p class="desktop-date">{{ todayLabel }}</p>
          <h1 class="desktop-title">{{ heroTitle }}</h1>
        </div>
        <button v-if="store.vehicles.length > 0" class="desktop-add-btn" @click="goAdd">
          ＋ Aggiungi veicolo
        </button>
      </div>
      <div v-if="store.vehicles.length > 0" class="desktop-stats">
        <div class="ds-pill ds-ok">
          <span class="ds-num">{{ store.stats.ok }}</span>
          <span class="ds-lbl">In regola</span>
        </div>
        <div class="ds-pill ds-warn">
          <span class="ds-num">{{ store.stats.warn }}</span>
          <span class="ds-lbl">In scadenza</span>
        </div>
        <div class="ds-pill ds-danger">
          <span class="ds-num">{{ store.stats.danger }}</span>
          <span class="ds-lbl">Urgenti</span>
        </div>
      </div>
    </div>

    <!-- ── Lista / Empty ── -->
    <div class="content">
      <div v-if="!store.loaded" class="skeleton-list">
        <div v-for="i in 2" :key="i" class="skeleton" />
      </div>

      <div v-else-if="store.vehicles.length === 0" class="empty">
        <div class="empty-icon-wrap">🚗</div>
        <h2 class="empty-title">Nessun veicolo</h2>
        <p class="empty-sub">Aggiungi il tuo primo veicolo per gestire bollo, assicurazione e revisione.</p>
        <button class="add-pill-btn" @click="goAdd">
          <span class="btn-plus">＋</span> Aggiungi veicolo
        </button>
      </div>

      <template v-else>
        <div class="list-header mobile-only-header">
          <span class="list-title">I tuoi veicoli</span>
          <span class="list-badge">{{ store.vehicles.length }}</span>
        </div>
        <div class="vehicle-list">
          <VehicleCard
            v-for="v in store.vehiclesSortedByUrgency"
            :key="v.id"
            :vehicle="v"
            @click="goDetail(v.id)"
          />
        </div>
      </template>
    </div>

    <!-- ── FAB mobile ── -->
    <div v-if="store.loaded && store.vehicles.length > 0" class="fab-wrap">
      <button class="fab-pill" @click="goAdd">
        <span class="fab-icon">＋</span>
        <span class="fab-label">Aggiungi</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useVehiclesStore } from '../stores/vehicles'
import VehicleCard from '../components/VehicleCard.vue'

const router = useRouter()
const store  = useVehiclesStore()
onMounted(async () => { if (!store.loaded) await store.load() })

const todayLabel = computed(() =>
  new Date().toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })
)
const heroTitle = computed(() => {
  if (!store.loaded || !store.vehicles.length) return 'Il mio garage'
  if (store.stats.danger > 0) return `${store.stats.danger} urgent${store.stats.danger === 1 ? 'e' : 'i'} 🔥`
  if (store.stats.warn  > 0) return 'Occhio alle date ⏳'
  return 'Tutto in regola ✅'
})
const heroSub = computed(() => {
  const n = store.vehicles.length
  if (!n) return 'Inizia aggiungendo il tuo primo veicolo'
  if (store.stats.danger > 0) return 'Hai scadenze critiche da rinnovare subito'
  if (store.stats.warn  > 0) return `${store.stats.warn} scadenz${store.stats.warn === 1 ? 'a' : 'e'} nei prossimi 30 giorni`
  return `${n} veicol${n === 1 ? 'o' : 'i'} · nessuna urgenza`
})

function goAdd()      { router.push('/veicolo/nuovo') }
function goDetail(id) { router.push(`/veicolo/${id}`) }
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  background: var(--bg-page);
}

/* ── Hero (solo mobile) ── */
.hero {
  position: relative;
  background: linear-gradient(160deg, #060A14 0%, #0F1F4A 60%, #1E3A8A 100%);
  overflow: hidden;
}
.orb {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  background: rgba(255,255,255,0.05);
}
.orb-a { width: 300px; height: 300px; top: -120px; right: -100px; }
.orb-b { width: 180px; height: 180px; bottom: -60px; left: -60px; }

.hero-body {
  position: relative;
  z-index: 1;
  padding: 56px 22px 26px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.hero-date {
  font-size: 12px;
  font-weight: 500;
  color: rgba(255,255,255,0.5);
  text-transform: capitalize;
  letter-spacing: 0.4px;
  margin-bottom: 4px;
}
.hero-title {
  font-size: 30px;
  font-weight: 800;
  color: #fff;
  letter-spacing: -1px;
  line-height: 1.15;
  margin-bottom: 6px;
}
.hero-sub {
  font-size: 14px;
  color: rgba(255,255,255,0.55);
  line-height: 1.45;
}

.stat-strip {
  display: flex;
  align-items: center;
  background: rgba(0,0,0,0.25);
  border-radius: 14px;
  padding: 14px 0;
}
.stat-item { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 3px; }
.stat-sep { width: 1px; height: 30px; background: rgba(255,255,255,0.1); }
.stat-num {
  font-size: 22px;
  font-weight: 800;
  color: #fff;
  line-height: 1;
  letter-spacing: -0.5px;
}
.stat-urgent { color: #FCA5A5; }
.stat-lbl {
  font-size: 10px;
  font-weight: 500;
  color: rgba(255,255,255,0.45);
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

/* ── Desktop header (nascosto su mobile) ── */
.desktop-header { display: none; }

/* ── Content ── */
.content {
  flex: 1;
  padding: 20px 16px calc(var(--nav-height) + var(--safe-bottom) + 80px);
}
.mobile-only-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}
.list-title { font-size: 17px; font-weight: 700; color: var(--text-primary); }
.list-badge {
  min-width: 24px; height: 24px;
  background: var(--accent-grad);
  color: #fff; font-size: 12px; font-weight: 700;
  border-radius: 99px;
  display: flex; align-items: center; justify-content: center;
  padding: 0 7px;
}

.vehicle-list { display: flex; flex-direction: column; gap: 12px; }

/* Skeleton */
.skeleton-list { display: flex; flex-direction: column; gap: 12px; }
.skeleton {
  height: 185px; border-radius: var(--radius-xl);
  background: var(--bg-card);
  animation: pulse 1.5s ease infinite;
}
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

/* Empty */
.empty {
  display: flex; flex-direction: column; align-items: center;
  text-align: center; gap: 12px; padding: 32px 24px;
}
.empty-icon-wrap {
  width: 88px; height: 88px; border-radius: 50%;
  background: var(--accent-grad);
  display: flex; align-items: center; justify-content: center;
  font-size: 42px; box-shadow: var(--shadow-accent);
  animation: float 3s ease-in-out infinite;
}
@keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
.empty-title { font-size: 20px; font-weight: 700; color: var(--text-primary); }
.empty-sub { font-size: 14px; color: var(--text-secondary); line-height: 1.55; max-width: 270px; }
.add-pill-btn {
  display: flex; align-items: center; gap: 8px;
  padding: 13px 26px;
  background: var(--accent-grad); color: #fff; border: none;
  border-radius: var(--radius-xl); font-size: 15px; font-weight: 700;
  cursor: pointer; box-shadow: var(--shadow-accent);
}
.btn-plus { font-size: 18px; font-weight: 300; }

/* ── FAB (solo mobile) ── */
.fab-wrap {
  position: fixed;
  bottom: calc(var(--nav-height) + var(--safe-bottom) + 12px);
  left: 50%; transform: translateX(-50%);
  z-index: 50;
}
.fab-pill {
  display: flex; align-items: center; gap: 8px;
  padding: 13px 26px;
  background: var(--accent-grad); color: #fff; border: none;
  border-radius: 99px; font-size: 15px; font-weight: 700;
  cursor: pointer; box-shadow: 0 6px 24px rgba(37,99,235,0.45);
  -webkit-tap-highlight-color: transparent; white-space: nowrap;
}
.fab-pill:active { transform: scale(0.95) translateX(-50%); }
.fab-icon { font-size: 18px; font-weight: 300; }

/* ── DESKTOP ── */
@media (min-width: 1024px) {
  /* Nascondi hero mobile, mostra header desktop */
  .hero { display: none; }
  .desktop-header { display: block; }
  .fab-wrap { display: none; }
  .mobile-only-header { display: none; }

  .page { min-height: 100dvh; }

  /* Header desktop */
  .desktop-header {
    padding: 32px 32px 0;
    border-bottom: 1px solid var(--border);
    padding-bottom: 20px;
    margin-bottom: 4px;
  }
  .desktop-header-inner {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 20px;
  }
  .desktop-date {
    font-size: 12px;
    font-weight: 500;
    color: var(--text-tertiary);
    text-transform: capitalize;
    letter-spacing: 0.4px;
    margin-bottom: 4px;
  }
  .desktop-title {
    font-size: 26px;
    font-weight: 800;
    color: var(--text-primary);
    letter-spacing: -0.8px;
  }
  .desktop-add-btn {
    padding: 10px 20px;
    background: var(--accent-grad);
    color: #fff; border: none;
    border-radius: var(--radius-md);
    font-size: 14px; font-weight: 600;
    cursor: pointer;
    box-shadow: var(--shadow-accent);
    white-space: nowrap;
    flex-shrink: 0;
  }
  .desktop-stats {
    display: flex;
    gap: 10px;
  }
  .ds-pill {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 16px;
    border-radius: var(--radius-md);
    border: 1px solid var(--border);
    background: var(--bg-card);
  }
  .ds-num { font-size: 20px; font-weight: 800; color: var(--text-primary); }
  .ds-lbl { font-size: 12px; color: var(--text-secondary); font-weight: 500; }
  .ds-ok     .ds-num { color: var(--ok); }
  .ds-warn   .ds-num { color: var(--warn); }
  .ds-danger .ds-num { color: var(--danger); }

  /* Content desktop */
  .content {
    padding: 24px 32px 32px;
  }
  .vehicle-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  .skeleton-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
}
</style>
