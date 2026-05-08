'use client';

import { useState } from 'react';
import { useUser } from '@/lib/user-context';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, AlertCircle, Activity, Dumbbell, PersonStanding, Wind, Heart, Target, Ruler, Weight, Flame, User as UserIcon } from 'lucide-react';

const ALLERGIES = ['Peanuts', 'Dairy', 'Gluten', 'Soy', 'Shellfish', 'Eggs', 'Tree Nuts'];
const CONDITIONS = ['Diabetes', 'Hypertension', 'Celiac Disease', 'PCOS', 'IBS'];

const COMMUNITIES = [
  { name: 'Gym', icon: '🏋️', description: 'Strength training & muscle building', color: '#ef4444' },
  { name: 'Yoga', icon: '🧘', description: 'Flexibility, mindfulness & balance', color: '#8b5cf6' },
  { name: 'Running', icon: '🏃', description: 'Cardio, marathons & endurance', color: '#f97316' },
  { name: 'Meditation', icon: '🌿', description: 'Mental wellness & stress relief', color: '#0f766e' },
  { name: 'Weight Loss', icon: '⚖️', description: 'Calorie tracking & fat loss', color: '#0ea5e9' },
  { name: 'Nutrition', icon: '🥗', description: 'Clean eating & diet science', color: '#22c55e' },
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
  
  // Physical stats
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

  const variants = {
    enter: { x: 50, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -50, opacity: 0 }
  };

  const nextStep = () => setStep(s => Math.min(TOTAL_STEPS, s + 1));
  const prevStep = () => setStep(s => Math.max(1, s - 1));

  return (
    <div className="container">
      <header style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)' }}>Step {step} of {TOTAL_STEPS}</span>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map(s => (
              <div key={s} style={{ 
                width: '20px', 
                height: '4px', 
                borderRadius: '2px', 
                background: s <= step ? 'var(--primary)' : 'var(--secondary)' 
              }} />
            ))}
          </div>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" variants={variants} initial="enter" animate="center" exit="exit">
            <h2 className="title">Any Allergies?</h2>
            <p className="subtitle">Select anything you're allergic to. We'll alert you if a product contains these.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {ALLERGIES.map(allergy => (
                <button 
                  key={allergy}
                  className={`btn ${selectedAllergies.includes(allergy) ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '0.75rem', fontSize: '0.875rem', justifyContent: 'flex-start' }}
                  onClick={() => toggleItem(allergy, selectedAllergies, setSelectedAllergies)}
                >
                  {selectedAllergies.includes(allergy) && <Check size={16} />}
                  {allergy}
                </button>
              ))}
            </div>
            <button className="btn btn-primary" style={{ marginTop: '2rem' }} onClick={nextStep}>Continue <ChevronRight size={18} /></button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" variants={variants} initial="enter" animate="center" exit="exit">
            <h2 className="title">Health Conditions?</h2>
            <p className="subtitle">This helps us provide more specific warnings for you.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {CONDITIONS.map(condition => (
                <button 
                  key={condition}
                  className={`btn ${selectedConditions.includes(condition) ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '0.75rem', fontSize: '0.875rem', justifyContent: 'flex-start' }}
                  onClick={() => toggleItem(condition, selectedConditions, setSelectedConditions)}
                >
                  {selectedConditions.includes(condition) && <Check size={16} />}
                  {condition}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={prevStep}>Back</button>
              <button className="btn btn-primary" style={{ flex: 2 }} onClick={nextStep}>Continue <ChevronRight size={18} /></button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" variants={variants} initial="enter" animate="center" exit="exit">
            <h2 className="title">About You</h2>
            <p className="subtitle">Tell us about your body for better diet calculation.</p>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Gender</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {['male', 'female', 'other'].map(g => (
                  <button key={g} className={`btn ${gender === g ? 'btn-primary' : 'btn-secondary'}`} 
                    style={{ flex: 1, textTransform: 'capitalize' }} onClick={() => setGender(g as any)}>
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Weight (kg)</label>
                <div style={{ position: 'relative' }}>
                  <Weight size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
                  <input type="number" placeholder="70" className="input" style={{ paddingLeft: '2.75rem', marginBottom: 0 }} 
                    value={weight} onChange={e => setWeight(e.target.value)} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Height (cm)</label>
                <div style={{ position: 'relative' }}>
                  <Ruler size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
                  <input type="number" placeholder="175" className="input" style={{ paddingLeft: '2.75rem', marginBottom: 0 }}
                    value={height} onChange={e => setHeight(e.target.value)} />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={prevStep}>Back</button>
              <button className="btn btn-primary" style={{ flex: 2 }} onClick={nextStep}>Continue <ChevronRight size={18} /></button>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div key="step4" variants={variants} initial="enter" animate="center" exit="exit">
            <h2 className="title">Daily Routine</h2>
            <p className="subtitle">How active is your lifestyle?</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { name: 'Sedentary', desc: 'Little or no exercise', icon: <Wind size={20} /> },
                { name: 'Light', desc: 'Exercise 1-3 days/week', icon: <Activity size={20} /> },
                { name: 'Moderate', desc: 'Exercise 3-5 days/week', icon: <Dumbbell size={20} /> },
                { name: 'Active', desc: 'Exercise 6-7 days/week', icon: <Flame size={20} /> },
              ].map(r => (
                <button 
                  key={r.name}
                  className={`btn ${routine === r.name ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '1rem', justifyContent: 'space-between' }}
                  onClick={() => setRoutine(r.name)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ background: routine === r.name ? 'rgba(255,255,255,0.2)' : 'rgba(13,148,136,0.1)', padding: '0.5rem', borderRadius: '0.75rem' }}>
                      {r.icon}
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>{r.name}</p>
                      <p style={{ fontSize: '0.75rem', opacity: 0.8 }}>{r.desc}</p>
                    </div>
                  </div>
                  {routine === r.name && <Check size={18} />}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={prevStep}>Back</button>
              <button className="btn btn-primary" style={{ flex: 2 }} onClick={nextStep}>Continue <ChevronRight size={18} /></button>
            </div>
          </motion.div>
        )}

        {step === 5 && (
          <motion.div key="step5" variants={variants} initial="enter" animate="center" exit="exit">
            <h2 className="title">Dietary Preference</h2>
            <p className="subtitle">This helps us filter product safety checks.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
              {(['vegetarian', 'non-veg', 'vegan'] as const).map(type => (
                <button 
                  key={type}
                  className={`btn ${dietType === type ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '1.25rem', justifyContent: 'space-between', textTransform: 'capitalize' }}
                  onClick={() => setDietType(type)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {type === 'vegetarian' && '🥦'}
                    {type === 'non-veg' && '🍗'}
                    {type === 'vegan' && '🌿'}
                    <span style={{ fontWeight: 700 }}>{type}</span>
                  </div>
                  {dietType === type && <Check size={18} />}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={prevStep}>Back</button>
              <button className="btn btn-primary" style={{ flex: 2 }} onClick={nextStep}>Continue <ChevronRight size={18} /></button>
            </div>
          </motion.div>
        )}

        {step === 6 && (
          <motion.div key="step6" variants={variants} initial="enter" animate="center" exit="exit">
            <h2 className="title">Join a Community</h2>
            <p className="subtitle">Connect with others sharing similar goals.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
              {COMMUNITIES.map(c => (
                <button 
                  key={c.name}
                  className={`btn ${selectedCommunity === c.name ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ 
                    flexDirection: 'column', 
                    height: 'auto', 
                    padding: '1rem',
                    border: selectedCommunity === c.name ? 'none' : '2px solid var(--border)'
                  }}
                  onClick={() => setSelectedCommunity(c.name)}
                >
                  <span style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{c.icon}</span>
                  <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>{c.name}</span>
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={prevStep}>Back</button>
              <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleFinish}>Finish Journey</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
