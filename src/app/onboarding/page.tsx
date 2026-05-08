'use client';

import { useState } from 'react';
import { useUser } from '@/lib/user-context';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, AlertCircle, Activity, Dumbbell, PersonStanding, Wind, Heart, Target } from 'lucide-react';

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
  const { setPreferences, joinCommunity, preferences } = useUser();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [dietType, setDietType] = useState<'vegetarian' | 'non-veg' | 'vegan'>('non-veg');
  const [proteinGoal, setProteinGoal] = useState(60);
  const [routine, setRoutine] = useState('Sedentary');
  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null);

  const TOTAL_STEPS = 5;

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
      proteinGoal,
      routine,
      community: selectedCommunity,
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
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" variants={variants} initial="enter" animate="center" exit="exit">
            <h2 className="title">Health Status</h2>
            <p className="subtitle">Select any chronic conditions or health concerns you have.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {CONDITIONS.map(condition => (
                <button 
                  key={condition}
                  className={`btn ${selectedConditions.includes(condition) ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ justifyContent: 'flex-start' }}
                  onClick={() => toggleItem(condition, selectedConditions, setSelectedConditions)}
                >
                  {selectedConditions.includes(condition) ? <Check size={18} /> : <Activity size={18} />}
                  {condition}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" variants={variants} initial="enter" animate="center" exit="exit">
            <h2 className="title">Dietary Preference</h2>
            <p className="subtitle">Choose your preferred diet type.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {(['vegetarian', 'non-veg', 'vegan'] as const).map(type => (
                <button 
                  key={type}
                  className={`btn ${dietType === type ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setDietType(type)}
                  style={{ textTransform: 'capitalize' }}
                >
                  {type}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div key="step4" variants={variants} initial="enter" animate="center" exit="exit">
            <h2 className="title">Goals & Routine</h2>
            <p className="subtitle">Tell us about your daily activity and protein needs.</p>
            
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Protein Goal ({proteinGoal}g)</label>
            <input 
              type="range" 
              min="20" max="200" step="5" 
              className="input" 
              value={proteinGoal} 
              onChange={(e) => setProteinGoal(Number(e.target.value))}
              style={{ marginBottom: '1.5rem', padding: 0 }}
            />

            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Daily Routine</label>
            <select className="input" value={routine} onChange={(e) => setRoutine(e.target.value)}>
              <option>Sedentary (Office work, low movement)</option>
              <option>Lightly Active (Walking, light exercise)</option>
              <option>Moderately Active (Daily exercise)</option>
              <option>Very Active (Athletic/Hard manual labor)</option>
            </select>
          </motion.div>
        )}

        {step === 5 && (
          <motion.div key="step5" variants={variants} initial="enter" animate="center" exit="exit">
            <h2 className="title">Join a Community</h2>
            <p className="subtitle">Connect with people who share your health journey. You can post scan results to your community feed!</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
              {COMMUNITIES.map(community => (
                <motion.button
                  key={community.name}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setSelectedCommunity(
                    selectedCommunity === community.name ? null : community.name
                  )}
                  style={{
                    background: selectedCommunity === community.name
                      ? `${community.color}22`
                      : 'var(--secondary)',
                    border: `2px solid ${selectedCommunity === community.name ? community.color : 'transparent'}`,
                    borderRadius: '1.25rem',
                    padding: '1.25rem 1rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                >
                  {selectedCommunity === community.name && (
                    <div style={{
                      position: 'absolute', top: '0.5rem', right: '0.5rem',
                      background: community.color, borderRadius: '50%',
                      width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <Check size={12} color="white" />
                    </div>
                  )}
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{community.icon}</div>
                  <p style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.25rem', color: 'var(--foreground)' }}>
                    {community.name}
                  </p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--muted)', lineHeight: 1.3 }}>
                    {community.description}
                  </p>
                </motion.button>
              ))}
            </div>
            {!selectedCommunity && (
              <p style={{ fontSize: '0.8rem', color: 'var(--muted)', textAlign: 'center', marginTop: '1rem' }}>
                Skip this step to continue without a community
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
        {step < TOTAL_STEPS ? (
          <button className="btn btn-primary" onClick={() => setStep(step + 1)}>
            Continue
            <ChevronRight size={20} />
          </button>
        ) : (
          <button className="btn btn-primary" onClick={handleFinish}>
            Get Started 🚀
            <Check size={20} />
          </button>
        )}
        {step > 1 && (
          <button 
            className="btn btn-secondary" 
            style={{ marginTop: '0.75rem', background: 'transparent' }}
            onClick={() => setStep(step - 1)}
          >
            Back
          </button>
        )}
      </div>
    </div>
  );
}
