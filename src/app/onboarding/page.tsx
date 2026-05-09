'use client';

import { useState } from 'react';
import { useUser } from '@/lib/user-context';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, Activity, Dumbbell, Wind, Flame, Ruler, Weight, ChevronLeft } from 'lucide-react';

const ALLERGIES = ['Peanuts', 'Dairy', 'Gluten', 'Soy', 'Shellfish', 'Eggs', 'Tree Nuts'];
const CONDITIONS = ['Diabetes', 'Hypertension', 'Celiac Disease', 'PCOS', 'IBS'];

const COMMUNITIES = [
  { name: 'Gym', desc: 'Protein & Muscle' },
  { name: 'Yoga', desc: 'Flexibility & Balance' },
  { name: 'Running', desc: 'Endurance & Cardio' },
  { name: 'Weight Loss', desc: 'Calorie Control' },
  { name: 'Nutrition', desc: 'Clean Eating' },
];

export default function Onboarding() {
  const { setPreferences, preferences } = useUser();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [dietType, setDietType] = useState<'vegetarian' | 'non-veg' | 'vegan'>('non-veg');
  const [routine, setRoutine] = useState('Sedentary');
  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null);
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [weight, setWeight] = useState<string>('');
  const [height, setHeight] = useState<string>('');

  const TOTAL_STEPS = 6;

  const toggleItem = (item: string, list: string[], setList: (l: string[]) => void) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleFinish = async () => {
    if (!preferences) return;
    await setPreferences({
      ...preferences,
      allergies: selectedAllergies,
      conditions: selectedConditions,
      dietType,
      routine,
      community: selectedCommunity,
      weight: parseFloat(weight) || 0,
      height: parseFloat(height) || 0,
      gender,
      scanHistory: [],
      exerciseGoal: { totalMinutes: 0, activity: 'walking', completedMinutes: 0 },
    });
    router.push('/');
  };

  const nextStep = () => setStep(s => Math.min(TOTAL_STEPS, s + 1));
  const prevStep = () => setStep(s => Math.max(1, s - 1));

  return (
    <div className="container" style={{ paddingTop: '3rem' }}>
      <header style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Phase {step} / {TOTAL_STEPS}</span>
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map(s => (
              <div key={s} style={{ width: '12px', height: '4px', borderRadius: '2px', background: s <= step ? 'var(--primary)' : 'var(--secondary)' }} />
            ))}
          </div>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="1" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
            <h2 className="title" style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>Allergy Profile</h2>
            <p className="subtitle" style={{ marginBottom: '2.5rem' }}>Identify substances for precision safety filtering.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
              {ALLERGIES.map(a => (
                <button key={a} className={`btn ${selectedAllergies.includes(a) ? 'btn-primary' : 'btn-secondary'}`} style={{ justifyContent: 'space-between', padding: '1rem 1.25rem' }} onClick={() => toggleItem(a, selectedAllergies, setSelectedAllergies)}>
                  <span>{a}</span>
                  {selectedAllergies.includes(a) && <Check size={18} />}
                </button>
              ))}
            </div>
            <button className="btn btn-primary" style={{ marginTop: '2.5rem' }} onClick={nextStep}>Continue</button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="2" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
            <h2 className="title" style={{ fontSize: '1.75rem' }}>Medical Background</h2>
            <p className="subtitle" style={{ marginBottom: '2.5rem' }}>Specific health conditions for tailored insights.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
              {CONDITIONS.map(c => (
                <button key={c} className={`btn ${selectedConditions.includes(c) ? 'btn-primary' : 'btn-secondary'}`} style={{ justifyContent: 'space-between', padding: '1rem 1.25rem' }} onClick={() => toggleItem(c, selectedConditions, setSelectedConditions)}>
                  <span>{c}</span>
                  {selectedConditions.includes(c) && <Check size={18} />}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2.5rem' }}>
              <button className="btn btn-secondary" onClick={prevStep} style={{ width: 'auto', padding: '0 1.5rem' }}><ChevronLeft size={20} /></button>
              <button className="btn btn-primary" onClick={nextStep}>Next Phase</button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="3" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
            <h2 className="title">Physical Metrics</h2>
            <p className="subtitle" style={{ marginBottom: '2.5rem' }}>Basics for caloric and metabolic calculations.</p>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {(['male', 'female', 'other'] as const).map(g => (
                <button key={g} className={`btn ${gender === g ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1, textTransform: 'capitalize' }} onClick={() => setGender(g)}>{g}</button>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: '0.5rem' }}>Weight (kg)</label>
                <input type="number" className="input" placeholder="70" value={weight} onChange={e => setWeight(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: '0.5rem' }}>Height (cm)</label>
                <input type="number" className="input" placeholder="175" value={height} onChange={e => setHeight(e.target.value)} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2.5rem' }}>
              <button className="btn btn-secondary" onClick={prevStep} style={{ width: 'auto', padding: '0 1.5rem' }}><ChevronLeft size={20} /></button>
              <button className="btn btn-primary" onClick={nextStep}>Continue</button>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div key="4" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
            <h2 className="title">Lifestyle Activity</h2>
            <p className="subtitle" style={{ marginBottom: '2.5rem' }}>Determine your baseline energy expenditure.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { name: 'Sedentary', icon: <Wind size={18} /> },
                { name: 'Moderate', icon: <Activity size={18} /> },
                { name: 'Active', icon: <Flame size={18} /> },
              ].map(r => (
                <button key={r.name} className={`btn ${routine === r.name ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '1.25rem', justifyContent: 'flex-start', gap: '1rem' }} onClick={() => setRoutine(r.name)}>
                  <div style={{ opacity: 0.6 }}>{r.icon}</div>
                  <span style={{ fontWeight: 600 }}>{r.name}</span>
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2.5rem' }}>
              <button className="btn btn-secondary" onClick={prevStep} style={{ width: 'auto', padding: '0 1.5rem' }}><ChevronLeft size={20} /></button>
              <button className="btn btn-primary" onClick={nextStep}>Finalizing</button>
            </div>
          </motion.div>
        )}

        {step === 5 && (
          <motion.div key="5" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
            <h2 className="title">Dietary Focus</h2>
            <p className="subtitle" style={{ marginBottom: '2.5rem' }}>Primary nutritional orientation.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {(['vegetarian', 'non-veg', 'vegan'] as const).map(type => (
                <button key={type} className={`btn ${dietType === type ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '1.25rem', justifyContent: 'flex-start', textTransform: 'capitalize' }} onClick={() => setDietType(type)}>
                  <span style={{ fontWeight: 600 }}>{type}</span>
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2.5rem' }}>
              <button className="btn btn-secondary" onClick={prevStep} style={{ width: 'auto', padding: '0 1.5rem' }}><ChevronLeft size={20} /></button>
              <button className="btn btn-primary" onClick={nextStep}>One Last Step</button>
            </div>
          </motion.div>
        )}

        {step === 6 && (
          <motion.div key="6" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
            <h2 className="title">Choose Community</h2>
            <p className="subtitle" style={{ marginBottom: '2.5rem' }}>Sync with peers who share your discipline.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
              {COMMUNITIES.map(c => (
                <button key={c.name} className={`btn ${selectedCommunity === c.name ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '1.25rem', justifyContent: 'space-between' }} onClick={() => setSelectedCommunity(c.name)}>
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ fontWeight: 700, fontSize: '0.9375rem', margin: 0 }}>{c.name}</p>
                    <p style={{ fontSize: '0.75rem', opacity: 0.6, margin: 0 }}>{c.desc}</p>
                  </div>
                  {selectedCommunity === c.name && <Check size={18} />}
                </button>
              ))}
            </div>
            <button className="btn btn-primary" style={{ marginTop: '2.5rem' }} onClick={handleFinish}>Complete Onboarding</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
