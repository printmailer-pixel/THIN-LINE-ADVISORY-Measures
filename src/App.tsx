import React, { useState, useEffect } from 'react';
import { AppState, MeasureData } from './types';
import {
  CAPE_QUESTIONS,
  PCL5_QUESTIONS,
  GAD7_QUESTIONS,
  PHQ9_QUESTIONS,
  CSSRS_QUESTIONS,
  SPRINGER_QUESTIONS
} from './data';
import { ChevronRight, Check } from 'lucide-react';

const INITIAL_STATE: AppState = {
  demographics: {
    callSign: '', email: '', age: '', gender: '', role: '', status: '',
    years: '', leadership: '', military: '', combat: '', orgType: '', setting: ''
  },
  springer: {},
  cape: {},
  pcl5: {},
  gad7: {},
  phq9: {},
  cssrs: {}
};

export default function App() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<AppState>(INITIAL_STATE);
  
  const updateData = (section: keyof AppState, values: Partial<any>) => {
    setData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...values }
    }));
  };

  const nextStep = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep(s => s + 1);
  };

  // If we are at CSSRS but PHQ9 item 9 is 0, skip to final
  useEffect(() => {
    if (step === 7) {
      const phq9Item9 = data.phq9['8']; // 0-indexed, so 9th item is index 8
      if (phq9Item9 === undefined || Number(phq9Item9) === 0) {
        setStep(8); // skip to final
      }
    }
  }, [step, data.phq9]);

  const handleSubmit = () => {
    // Process results for Google Apps Script
    const capeScore = Object.values(data.cape).reduce((sum: number, val: any) => sum + Number(val), 0) as number;
    const pcl5Score = Object.values(data.pcl5).reduce((sum: number, val: any) => sum + Number(val), 0) as number;
    
    let capeInterp = "No reported career-related adverse events";
    if (capeScore >= 1 && capeScore <= 3) capeInterp = "Low to moderate exposure";
    if (capeScore >= 4 && capeScore <= 6) capeInterp = "High exposure (elevated health risks)";
    if (capeScore >= 7) capeInterp = "Very high exposure (greater risk)";

    let pcl5Interp = "Minimal PTSD symptoms";
    if (pcl5Score >= 20 && pcl5Score <= 31) pcl5Interp = "Mild symptoms";
    if (pcl5Score >= 32 && pcl5Score <= 49) pcl5Interp = "Moderate symptoms";
    if (pcl5Score >= 50) pcl5Interp = "Severe symptoms";

    const finalPayload = {
      ...data,
      scores: {
        cape: capeScore,
        capeInterpretation: capeInterp,
        pcl5: pcl5Score,
        pcl5Interpretation: pcl5Interp,
      }
    };

    console.log(JSON.stringify(finalPayload, null, 2));

    // @ts-ignore
    if (typeof google !== 'undefined' && google.script && google.script.run) {
      // @ts-ignore
      google.script.run
        .withSuccessHandler(() => console.log('Successfully saved to Google Apps Script'))
        .withFailureHandler((err: any) => console.error('Failed to save', err))
        .submitSurveyData(finalPayload);
    }
    
    setStep(8);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-slate-200">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        {step === 0 && <Intro nextStep={nextStep} />}
        {step === 1 && <Demographics data={data.demographics} updateData={(v) => updateData('demographics', v)} nextStep={nextStep} />}
        {step === 2 && (
          <Measure
            title="The Springer Measure of Elasticity"
            description="This first measure looks at your current flexibility and range of motion in your nervous system, identity and relationships. Thousands of first responders have completed this measure so if we ever talk through your score, I can share how your scores compare to others."
            questions={SPRINGER_QUESTIONS}
            options={[
              { label: 'Strongly Disagree', value: 1 },
              { label: 'Disagree', value: 2 },
              { label: 'Neutral', value: 3 },
              { label: 'Agree', value: 4 },
              { label: 'Strongly Agree', value: 5 }
            ]}
            data={data.springer}
            updateData={(v) => updateData('springer', v)}
            nextStep={nextStep}
          />
        )}
        {step === 3 && (
          <Measure
            title="Checklist of Adverse Professional Experiences (CAPE)"
            description="This next measure looks at different kinds of exposures that are common within the protector/defender community. Your total score is related to your current allostatic load (cumulative trauma load)."
            questions={CAPE_QUESTIONS}
            options={[
              { label: 'No', value: 0 },
              { label: 'Yes', value: 1 }
            ]}
            data={data.cape}
            updateData={(v) => updateData('cape', v)}
            nextStep={nextStep}
          />
        )}
        {step === 4 && (
          <Measure
            title="PCL-5"
            description="You’re more than halfway done! This next measure might be familiar since it is widely used to gauge a person’s current level of self-reported post-traumatic stress symptoms. In the past month, how much were you bothered by:"
            questions={PCL5_QUESTIONS}
            options={[
              { label: 'Not at all', value: 0 },
              { label: 'A little bit', value: 1 },
              { label: 'Moderately', value: 2 },
              { label: 'Quite a bit', value: 3 },
              { label: 'Extremely', value: 4 }
            ]}
            data={data.pcl5}
            updateData={(v) => updateData('pcl5', v)}
            nextStep={nextStep}
          />
        )}
        {step === 5 && (
          <Measure
            title="GAD-7"
            description="You’re almost there – just 3 more short measures. The next ones look at anxiety and depression. Over the last 2 weeks, how often have you been bothered by the following problems?"
            questions={GAD7_QUESTIONS}
            options={[
              { label: 'Not at all', value: 0 },
              { label: 'Several days', value: 1 },
              { label: 'More than half the days', value: 2 },
              { label: 'Nearly every day', value: 3 }
            ]}
            data={data.gad7}
            updateData={(v) => updateData('gad7', v)}
            nextStep={nextStep}
          />
        )}
        {step === 6 && (
          <Measure
            title="PHQ-9"
            description="Over the last 2 weeks, how often have you been bothered by any of the following problems?"
            questions={PHQ9_QUESTIONS}
            options={[
              { label: 'Not at all', value: 0 },
              { label: 'Several days', value: 1 },
              { label: 'More than half the days', value: 2 },
              { label: 'Nearly every day', value: 3 }
            ]}
            data={data.phq9}
            updateData={(v) => updateData('phq9', v)}
            nextStep={step === 6 && data.phq9['8'] && Number(data.phq9['8']) > 0 ? nextStep : handleSubmit}
            isSubmit={!(step === 6 && data.phq9['8'] && Number(data.phq9['8']) > 0)}
          />
        )}
        {step === 7 && (
          <Measure
            title="C-SSRS"
            description="Please answer the following questions regarding your thoughts and behaviors."
            questions={CSSRS_QUESTIONS}
            options={[
              { label: 'No', value: 0 },
              { label: 'Yes', value: 1 }
            ]}
            data={data.cssrs}
            updateData={(v) => updateData('cssrs', v)}
            nextStep={handleSubmit}
            isSubmit={true}
          />
        )}
        {step === 8 && <FinalScreen email={data.demographics.email} />}
      </div>
    </div>
  );
}

function Intro({ nextStep }: { nextStep: () => void }) {
  return (
    <div className="space-y-6 bg-white p-6 sm:p-10 rounded-2xl shadow-sm border border-slate-200">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
        Assessment & Feedback
      </h1>
      <div className="space-y-4 text-slate-600 leading-relaxed text-sm">
        <p>
          How many times have you been asked to fill out forms – and been given no feedback at all? 
        </p>
        <p>
          Maybe your results were used to inform a mental health provider about your symptoms, or were captured for research, and NO ONE gave you feedback on your results and what they mean. <strong>THIS IS NOT THAT.</strong>
        </p>
        <p>
          This brief assessment process is designed to be private and to provide YOU with information that may be very helpful in seeing the challenges you’re currently facing. Unless you request follow up from me on your results (and share your unique call sign with me during a conversation) your specific results will only be sent to you.
        </p>
        <div className="bg-slate-100 p-4 rounded-xl text-sm text-slate-700">
          <strong>Please note:</strong> Because I do not collect any information to verify individual identity (like your name, date of birth, or an official work email), I will not be able to follow up if your results indicate things like high depression, anxiety, post-traumatic stress, or thoughts of self-harm. For this reason, at the end of the forms, I provide all participants with resources that may be helpful for addressing any challenges that may be identified. I strongly encourage you to take action on any challenges you become aware of.
        </div>
        <p>
          If you are meeting with me or a member of my team, we can talk through your results and some potential next steps (you can let us know your results, or we can look them up if you tell us what unique “call sign” you used).
        </p>
      </div>
      <div className="pt-4">
        <Button onClick={nextStep}>
          Let's drop in <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

function Demographics({ data, updateData, nextStep }: any) {
  const isComplete = data.callSign && data.age && data.gender && data.role && data.status && data.years && data.leadership && data.military && data.orgType && data.setting;

  return (
    <div className="space-y-8 bg-white p-6 sm:p-10 rounded-2xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-light text-slate-800">Getting Started</h2>
      
      <div className="space-y-8">
        <Field label="1) PICK a MEMORABLE BUT FAKE NAME - a “CALL SIGN” that is unique to you only:" hint="(“Sarge” and “Maverick” are too common – pick something like “ScreamingEagle88” or “Squirrel66”)">
          <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 outline-none transition-all" value={data.callSign} onChange={e => updateData({ callSign: e.target.value })} placeholder="Enter your call sign" />
        </Field>

        <Field label="2) OPTIONAL: If you want a copy of your results, what email would you like to have these sent to?" hint="(I suggest you use a non-work email for privacy)">
          <input type="email" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 outline-none transition-all" value={data.email} onChange={e => updateData({ email: e.target.value })} placeholder="Email address (optional)" />
        </Field>

        <Field label="3) Current age:">
          <input type="number" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 outline-none transition-all" value={data.age} onChange={e => updateData({ age: e.target.value })} placeholder="Age" />
        </Field>

        <RadioGroup label="4) Gender identity (Optional)" options={['Male', 'Female', 'Other designation', 'Prefer not to answer']} value={data.gender} onChange={v => updateData({ gender: v })} />
        <RadioGroup label="5) Primary role" options={['Law enforcement', 'Fire service', 'EMS', 'Emergency communications/dispatch', 'Corrections', 'Military (active duty)', 'Veteran', 'Other']} value={data.role} onChange={v => updateData({ role: v })} />
        <RadioGroup label="6) Current status" options={['Active', 'Retired', 'Former', 'Reserve/National Guard']} value={data.status} onChange={v => updateData({ status: v })} />
        <RadioGroup label="7) Years of service" options={['<5', '5–10', '11–20', '21+']} value={data.years} onChange={v => updateData({ years: v })} />
        <RadioGroup label="8) Leadership level" options={['Frontline/member', 'Supervisor', 'Manager/command staff', 'Executive leadership']} value={data.leadership} onChange={v => updateData({ leadership: v })} />
        <RadioGroup label="9) Military service" options={['Never served', 'Active duty', 'Reserve/Guard', 'Veteran']} value={data.military} onChange={v => updateData({ military: v })} />
        <RadioGroup label="10) Combat deployment (Optional)" options={['Yes', 'No', 'Prefer not to answer']} value={data.combat} onChange={v => updateData({ combat: v })} />
        <RadioGroup label="11) Organization type" options={['Municipal', 'County', 'State', 'Federal', 'Private', 'Volunteer']} value={data.orgType} onChange={v => updateData({ orgType: v })} />
        <RadioGroup label="12) Geographic setting" options={['Urban', 'Suburban', 'Rural']} value={data.setting} onChange={v => updateData({ setting: v })} />
      </div>

      <div className="pt-6 border-t border-slate-100 flex justify-end">
        <Button onClick={nextStep} disabled={!isComplete}>
          Continue <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

function Measure({ title, description, questions, options, data, updateData, nextStep, isSubmit = false }: any) {
  const isComplete = questions.every((_: any, i: number) => data[i] !== undefined);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 space-y-4">
        <h2 className="text-2xl font-light text-slate-800">{title}</h2>
        {description && <p className="text-slate-600 leading-relaxed text-sm">{description}</p>}
      </div>

      <div className="space-y-4">
        {questions.map((q: string, i: number) => (
          <div key={i} className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
            <p className="text-sm font-medium text-slate-900 mb-4">{i + 1}. {q}</p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-2">
              {options.map((opt: any) => {
                const isSelected = data[i] === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => updateData({ [i]: opt.value })}
                    className={`flex-1 min-w-[120px] p-3 rounded-lg border text-sm font-medium transition-all duration-200 ${
                      isSelected 
                        ? 'border-slate-900 bg-slate-900 text-white shadow-md' 
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 flex justify-end sticky bottom-4 z-10">
        <Button onClick={nextStep} disabled={!isComplete} className="shadow-lg w-full sm:w-auto text-lg py-4 px-8">
          {isSubmit ? 'Submit Assessment' : 'Continue'} <ChevronRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}

function FinalScreen({ email }: { email: string }) {
  return (
    <div className="space-y-8 bg-white p-6 sm:p-10 rounded-2xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-slate-100 text-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-8 h-8" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-light text-slate-800">All done!</h2>
        {email && (
          <p className="text-slate-600 text-sm">
            A copy of your results will be sent to <strong>{email}</strong>.
          </p>
        )}
      </div>

      <div className="space-y-6 pt-6 border-t border-slate-100">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Here are some potentially helpful resources:</h3>
        
        <div className="space-y-4">
          <ResourceSection title="Crisis Support">
            <ResourceLink title="988 Suicide & Crisis Lifeline" url="https://988lifeline.org" />
            <ResourceLink title="Veterans Crisis Line" url="https://www.veteranscrisisline.net" />
          </ResourceSection>

          <ResourceSection title="Free Mental Health Care for Veterans">
            <ResourceLink title="The Headstrong Project" url="https://theheadstrongproject.org" />
            <ResourceLink title="Stop Soldier Suicide" url="https://www.stopsoldiersuicide.org" />
          </ResourceSection>

          <ResourceSection title="First Responder Resources">
            <ResourceLink 
              title="Fortitude Recovery (Palo Alto)" 
              url="https://www.fortituderecovery.com/"
              description="A specialized recovery program for first responders and veterans addressing trauma, PTSD symptoms, substance use, and related mental health challenges. Offers confidential, trauma-informed residential and outpatient care with clinicians who understand the unique experiences of those who serve."
            />
            <ResourceLink title="ResponderStrong" url="https://responderstrong.org" />
            <ResourceLink title="First Responder Project" url="https://firstresponderproject.org" />
          </ResourceSection>
        </div>
      </div>
    </div>
  );
}

// Helpers
function Field({ label, hint, children }: any) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
        {label}
        {hint && <span className="block text-[10px] text-slate-400 font-normal mt-1 normal-case tracking-normal">{hint}</span>}
      </label>
      {children}
    </div>
  );
}

function RadioGroup({ label, options, value, onChange }: any) {
  return (
    <div className="space-y-3">
      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{label}</label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {options.map((opt: string) => (
          <label key={opt} className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
            value === opt 
              ? 'border-slate-900 bg-slate-900 text-white shadow-md' 
              : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
          }`}>
            <input type="radio" className="sr-only" checked={value === opt} onChange={() => onChange(opt)} />
            <span className="text-xs font-medium">{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function Button({ children, onClick, disabled, className = '' }: any) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center px-8 py-3 rounded-full text-sm font-bold shadow-xl transition-colors ${
        disabled
          ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
          : 'bg-slate-900 text-white hover:bg-slate-800'
      } ${className}`}
    >
      {children}
    </button>
  );
}

function ResourceSection({ title, children }: any) {
  return (
    <div className="space-y-3">
      <h4 className="font-bold text-sm text-slate-800">{title}</h4>
      <div className="space-y-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {children}
      </div>
    </div>
  );
}

function ResourceLink({ title, url, description }: any) {
  return (
    <div className="block p-4 rounded-xl border border-slate-200 bg-slate-50 hover:border-slate-300 transition-colors h-full">
      <a href={url} target="_blank" rel="noopener noreferrer" className="text-slate-900 font-bold text-sm hover:underline inline-flex items-center">
        {title}
      </a>
      {description && <p className="text-xs text-slate-500 mt-2 leading-relaxed">{description}</p>}
      <a href={url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-slate-400 mt-2 block truncate font-mono">
        {url}
      </a>
    </div>
  );
}
