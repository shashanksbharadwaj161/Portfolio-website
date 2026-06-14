'use client';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

type Peg = 'A' | 'B' | 'C';

const DEMO_MOVES: { from: Peg; to: Peg; ring: number }[] = [
  { from: 'A', to: 'C', ring: 1 },
  { from: 'A', to: 'B', ring: 2 },
  { from: 'C', to: 'B', ring: 1 },
  { from: 'A', to: 'C', ring: 3 },
  { from: 'B', to: 'A', ring: 1 },
  { from: 'B', to: 'C', ring: 2 },
  { from: 'A', to: 'C', ring: 1 },
];

const SENSOR_DATA = [
  [412, 213, 334],
  [534, 421, 289],
  [389, 302, 445],
  [467, 356, 398],
  [298, 478, 367],
  [512, 289, 423],
  [445, 367, 312],
];
const ACCURACY = [98.2, 97.9, 98.4, 98.1, 98.6, 98.0, 98.3];

const RING_W: Record<number, number> = { 1: 60, 2: 100, 3: 140 };
const RING_STEP = 24;
const FLOOR = 26;
const LIFT_Y = -160;
const SENSOR_MAX = 512;

const SENSOR_ROWS = ['demo_sensor_thumb', 'demo_sensor_index', 'demo_sensor_middle'] as const;

export default function HanoiDemo() {
  const t = useTranslations('research');

  const wrapRef = useRef<HTMLDivElement>(null);
  const demoRef = useRef<HTMLDivElement>(null);
  const ringsLayerRef = useRef<HTMLDivElement>(null);
  const pegRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const ringRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const [instruction, setInstruction] = useState('');
  const [moveNum, setMoveNum] = useState(0);
  const [timeStr, setTimeStr] = useState('00:00');
  const [accuracy, setAccuracy] = useState(98.2);
  const [sensors, setSensors] = useState<number[]>(SENSOR_DATA[0]);
  const [solved, setSolved] = useState(false);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ----- mutable controller state (stable within this single effect run) -----
    let rings: Record<Peg, number[]> = { A: [3, 2, 1], B: [], C: [] };
    let moveIndex = 0;
    let started = false;
    let paused = false;
    let alive = true;
    let done = false;
    let scaledIn = false;
    let seconds = 0;
    const sensorBase = [...SENSOR_DATA[0]];
    let moveTimeout: ReturnType<typeof setTimeout> | undefined;
    let resetTimeout: ReturnType<typeof setTimeout> | undefined;
    let typeTimeouts: ReturnType<typeof setTimeout>[] = [];
    let timerInt: ReturnType<typeof setInterval> | undefined;
    let jitterInt: ReturnType<typeof setInterval> | undefined;

    const pegCenter = (p: Peg) => {
      const el = pegRefs.current[p];
      return el ? el.offsetLeft + el.offsetWidth / 2 : 0;
    };

    const placeRing = (n: number, peg: Peg, level: number) => {
      const el = ringRefs.current[n];
      if (el) gsap.set(el, { x: pegCenter(peg) - RING_W[n] / 2, y: -(FLOOR + level * RING_STEP) });
    };
    const placeAll = (state: Record<Peg, number[]>) => {
      (['A', 'B', 'C'] as Peg[]).forEach((p) => state[p].forEach((n, lvl) => placeRing(n, p, lvl)));
    };

    const fmt = (s: number) =>
      `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
    const jit = (v: number) =>
      Math.max(0, Math.min(SENSOR_MAX, Math.round(v + (Math.random() * 2 - 1) * 16)));

    const typeInstruction = (text: string) => {
      typeTimeouts.forEach(clearTimeout);
      typeTimeouts = [];
      setInstruction('');
      let i = 0;
      const step = () => {
        if (i <= text.length) {
          setInstruction(text.slice(0, i));
          i++;
          typeTimeouts.push(setTimeout(step, 28));
        }
      };
      step();
    };

    const updateSensors = (idx: number) => {
      const v = SENSOR_DATA[idx % SENSOR_DATA.length];
      sensorBase[0] = v[0];
      sensorBase[1] = v[1];
      sensorBase[2] = v[2];
      setSensors([v[0], v[1], v[2]]);
      setAccuracy(ACCURACY[idx % ACCURACY.length]);
    };

    const resetBoard = () => {
      rings = { A: [3, 2, 1], B: [], C: [] };
      moveIndex = 0;
      seconds = 0;
      done = false;
      setMoveNum(0);
      setTimeStr('00:00');
      setSolved(false);
      placeAll(rings);
    };

    const scheduleNext = (delay: number) => {
      if (moveTimeout) clearTimeout(moveTimeout);
      if (!alive || paused) return;
      moveTimeout = setTimeout(executeMove, delay);
    };

    function executeMove() {
      if (!alive) return;

      if (moveIndex >= DEMO_MOVES.length) {
        done = true;
        setSolved(true);
        if (demoRef.current) {
          gsap.fromTo(
            demoRef.current,
            { boxShadow: '0 0 0 rgba(0,217,255,0)' },
            { boxShadow: '0 0 36px rgba(0,217,255,0.45)', duration: 0.6, yoyo: true, repeat: 1 }
          );
        }
        resetTimeout = setTimeout(() => {
          if (!alive) return;
          resetBoard();
          scheduleNext(600);
        }, 3000);
        return;
      }

      const mv = DEMO_MOVES[moveIndex];
      const el = ringRefs.current[mv.ring];
      const targetLevel = rings[mv.to].length;

      typeInstruction(t('demo_instruction', { ring: mv.ring, from: mv.from, to: mv.to }));
      updateSensors(moveIndex);

      if (el) {
        gsap
          .timeline()
          .to(el, { y: LIFT_Y, duration: 0.5, ease: 'power2.out' })
          .to(el, { x: pegCenter(mv.to) - RING_W[mv.ring] / 2, duration: 0.8, ease: 'power2.inOut' }, '-=0.15')
          .to(el, { y: -(FLOOR + targetLevel * RING_STEP), duration: 0.45, ease: 'bounce.out' }, '-=0.1');
      }

      rings[mv.from].pop();
      rings[mv.to].push(mv.ring);
      moveIndex++;
      setMoveNum(moveIndex);
      scheduleNext(2000);
    }

    const start = () => {
      if (started) return;
      started = true;
      resetBoard();
      if (ringsLayerRef.current) gsap.set(ringsLayerRef.current, { opacity: 1 });
      timerInt = setInterval(() => {
        if (alive && !paused && !done) {
          seconds++;
          setTimeStr(fmt(seconds));
        }
      }, 1000);
      jitterInt = setInterval(() => {
        if (alive && !paused && !done) {
          setSensors([jit(sensorBase[0]), jit(sensorBase[1]), jit(sensorBase[2])]);
        }
      }, 220);
      scheduleNext(700);
    };

    const pause = () => {
      paused = true;
      if (moveTimeout) clearTimeout(moveTimeout);
    };
    const resume = () => {
      if (!started || !paused || !alive) return;
      paused = false;
      if (!done) scheduleNext(600);
    };

    const ctx = gsap.context(() => {
      // Reduced motion: show the solved board, no looping animation.
      if (reduced) {
        rings = { A: [], B: [], C: [3, 2, 1] };
        placeAll(rings);
        if (ringsLayerRef.current) gsap.set(ringsLayerRef.current, { opacity: 1 });
        setMoveNum(7);
        setSolved(true);
        setSensors(SENSOR_DATA[6]);
        setAccuracy(98.2);
        setTimeStr('00:14');
        setInstruction(t('demo_solved'));
        return;
      }

      // Place the initial stack so it's ready when the demo scales in.
      placeAll(rings);

      ScrollTrigger.create({
        trigger: wrapRef.current,
        start: 'top 75%',
        end: 'bottom 20%',
        onEnter: () => {
          if (!scaledIn) {
            scaledIn = true;
            gsap.fromTo(
              demoRef.current,
              { scale: 0.9, opacity: 0 },
              { scale: 1, opacity: 1, duration: 0.7, ease: 'power3.out' }
            );
          }
          start();
        },
        onEnterBack: resume,
        onLeave: pause,
        onLeaveBack: pause,
      });

      // Metric count-ups
      gsap.utils.toArray<HTMLElement>('.demo-metric-value').forEach((el) => {
        const target = Number(el.dataset.value || '0');
        const decimals = Number(el.dataset.decimals || '0');
        const prefix = el.dataset.prefix || '';
        const suffix = el.dataset.suffix || '';
        const obj = { v: 0 };
        gsap.to(obj, {
          v: target,
          duration: 1.6,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 90%' },
          onUpdate: () => {
            el.textContent = `${prefix}${obj.v.toFixed(decimals)}${suffix}`;
          },
        });
      });
    }, wrapRef);

    const onResize = () => placeAll(rings);
    window.addEventListener('resize', onResize);

    return () => {
      alive = false;
      window.removeEventListener('resize', onResize);
      if (moveTimeout) clearTimeout(moveTimeout);
      if (resetTimeout) clearTimeout(resetTimeout);
      typeTimeouts.forEach(clearTimeout);
      if (timerInt) clearInterval(timerInt);
      if (jitterInt) clearInterval(jitterInt);
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="chapter3-demo" ref={wrapRef}>
      <div className="hanoi-demo" ref={demoRef}>
        <div className="instruction-panel">
          <div>
            <span className="panel-kicker">{t('demo_guidance')}</span>
            <p className="instruction-text">
              {instruction}
              <span className="type-caret">|</span>
            </p>
          </div>
        </div>

        <div className="tower-container">
          <div className="tower-pegs">
            {(['A', 'B', 'C'] as Peg[]).map((p) => (
              <div
                key={p}
                className="peg"
                data-peg={p}
                ref={(el) => {
                  pegRefs.current[p] = el;
                }}
              >
                <div className="peg-shaft" />
                <span className="peg-label">Peg {p}</span>
              </div>
            ))}
          </div>
          <div className="tower-base" />
          <div className="tower-rings" ref={ringsLayerRef}>
            {[3, 2, 1].map((n) => (
              <div
                key={n}
                className={`ring ring-${n}`}
                data-ring={n}
                ref={(el) => {
                  ringRefs.current[n] = el;
                }}
              >
                {n}
              </div>
            ))}
          </div>
          {solved && <div className="demo-success">{t('demo_solved')}</div>}
        </div>

        <div className="sensor-panel">
          <span className="panel-kicker gold">{t('demo_sensors')}</span>
          {SENSOR_ROWS.map((key, i) => (
            <div className="sensor-reading" key={key}>
              <span className="sensor-label">{t(key)}</span>
              <div className="sensor-bar">
                <div
                  className="sensor-bar-fill"
                  style={{ width: `${(sensors[i] / SENSOR_MAX) * 100}%` }}
                />
              </div>
              <span className="sensor-value">{sensors[i]}</span>
            </div>
          ))}
        </div>

        <div className="demo-stats">
          <div className="demo-stat">
            <span className="demo-stat-value">{moveNum} / 7</span>
            <span>{t('demo_move')}</span>
          </div>
          <div className="demo-stat">
            <span className="demo-stat-value">{timeStr}</span>
            <span>{t('demo_time')}</span>
          </div>
          <div className="demo-stat">
            <span className="demo-stat-value">{accuracy.toFixed(1)}%</span>
            <span>{t('demo_accuracy')}</span>
          </div>
        </div>
      </div>

      <div className="demo-metrics">
        <div className="demo-metric">
          <span className="demo-metric-value" data-value="40" data-suffix="+">
            40+
          </span>
          <span className="demo-metric-label">{t('demo_metric1_label')}</span>
        </div>
        <div className="demo-metric">
          <span className="demo-metric-value" data-value="98.2" data-decimals="1" data-suffix="%">
            98.2%
          </span>
          <span className="demo-metric-label">{t('demo_metric2_label')}</span>
        </div>
        <div className="demo-metric">
          <span className="demo-metric-value" data-value="50" data-prefix="<" data-suffix="ms">
            &lt;50ms
          </span>
          <span className="demo-metric-label">{t('demo_metric3_label')}</span>
        </div>
      </div>
    </div>
  );
}
