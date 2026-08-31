import React, { useState } from 'react';
import { Scenario } from '../types';
import { Plus, Trash2, Check, Sparkles, ArrowRight } from 'lucide-react';

interface ScenarioBuilderProps {
  scenarios: Scenario[];
  isAiSpecific?: boolean;
  minRequired?: number;
  onUpdateScenarios: (scenarios: Scenario[]) => void;
}

export const ScenarioBuilder: React.FC<ScenarioBuilderProps> = ({
  scenarios,
  isAiSpecific = false,
  minRequired = 3,
  onUpdateScenarios
}) => {
  const [activeScenarioId, setActiveScenarioId] = useState<string>(
    scenarios[0]?.id || ''
  );

  const activeScenario = scenarios.find(s => s.id === activeScenarioId) || scenarios[0];

  const handleUpdateActiveField = (field: keyof Scenario, val: any) => {
    if (!activeScenario) return;
    const updated = scenarios.map(s =>
      s.id === activeScenario.id
        ? {
            ...s,
            [field]: val
          }
        : s
    );
    onUpdateScenarios(updated);
  };

  const handleAddScenario = () => {
    const newId = `sc-${Date.now()}`;
    const newSc: Scenario = {
      id: newId,
      title: isAiSpecific ? `AI Scenario ${scenarios.length + 1}` : `Workplace Scenario ${scenarios.length + 1}`,
      isAiSpecific,
      situation: '',
      challenge: '',
      decisionPoint: '',
      debrief: '',
      status: 'In progress'
    };
    onUpdateScenarios([...scenarios, newSc]);
    setActiveScenarioId(newId);
  };

  const handleDeleteScenario = (id: string) => {
    const remaining = scenarios.filter(s => s.id !== id);
    onUpdateScenarios(remaining);
    if (activeScenarioId === id && remaining.length > 0) {
      setActiveScenarioId(remaining[0].id);
    }
  };

  const isScenarioComplete = (sc: Scenario) => {
    return Boolean(
      sc.title?.trim() &&
      sc.situation?.trim() &&
      sc.challenge?.trim() &&
      sc.decisionPoint?.trim() &&
      sc.debrief?.trim()
    );
  };

  return (
    <div id="scenario-builder-component" className="space-y-5">
      {/* Scenario Selector Tabs & Add button */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          {scenarios.map((sc, idx) => {
            const isSelected = activeScenario?.id === sc.id;
            const complete = isScenarioComplete(sc);

            return (
              <button
                key={sc.id}
                onClick={() => setActiveScenarioId(sc.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#052B66] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>
                  {isAiSpecific ? 'AI Scenario' : 'Scenario'} {idx + 1}
                </span>
                {complete && (
                  <Check className={`w-3 h-3 ${isSelected ? 'text-[#45CC42]' : 'text-emerald-600'} stroke-[3]`} />
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-slate-500">
            {scenarios.length} of {minRequired} required
          </span>
          <button
            type="button"
            onClick={handleAddScenario}
            className="inline-flex items-center gap-1 text-xs font-bold text-[#052B66] bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-md transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Scenario</span>
          </button>
        </div>
      </div>

      {/* Active Scenario Editor matching Mockup Page 7 */}
      {activeScenario ? (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-lg">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                SCENARIO TITLE
              </label>
              <input
                type="text"
                value={activeScenario.title}
                onChange={e => handleUpdateActiveField('title', e.target.value)}
                placeholder="e.g. AI-generated customer communication"
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm font-bold text-slate-900 focus:border-[#052B66] outline-none bg-slate-50/50"
              />
            </div>

            <div className="flex items-center gap-3">
              {isScenarioComplete(activeScenario) && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Complete</span>
                </span>
              )}

              {scenarios.length > 1 && (
                <button
                  onClick={() => handleDeleteScenario(activeScenario.id)}
                  className="text-xs font-medium text-rose-600 hover:bg-rose-50 px-2.5 py-1.5 rounded transition-colors cursor-pointer"
                >
                  Delete scenario
                </button>
              )}
            </div>
          </div>

          {/* Visual Step Pipeline: Situation → Challenge → Decision Point → Debrief */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Situation */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-[#052B66]">Situation</span>
                <span className="text-[11px] text-slate-400 font-medium">Describe context</span>
              </div>
              <textarea
                rows={3}
                value={activeScenario.situation}
                onChange={e => handleUpdateActiveField('situation', e.target.value)}
                placeholder="e.g. A service consultant uses a generative AI tool to draft a response to a customer complaint."
                className="w-full p-3 rounded-lg border border-slate-200 text-xs text-slate-800 focus:border-[#052B66] outline-none resize-y leading-relaxed"
              />
            </div>

            {/* Challenge */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-[#052B66]">Challenge</span>
                <span className="text-[11px] text-slate-400 font-medium">What problem must be solved?</span>
              </div>
              <textarea
                rows={3}
                value={activeScenario.challenge}
                onChange={e => handleUpdateActiveField('challenge', e.target.value)}
                placeholder="e.g. The draft contains an inaccurate product promise and includes personal customer details."
                className="w-full p-3 rounded-lg border border-slate-200 text-xs text-slate-800 focus:border-[#052B66] outline-none resize-y leading-relaxed"
              />
            </div>

            {/* Decision Point */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-[#052B66]">Decision Point</span>
                <span className="text-[11px] text-slate-400 font-medium">What decision must the learner make?</span>
              </div>
              <textarea
                rows={3}
                value={activeScenario.decisionPoint}
                onChange={e => handleUpdateActiveField('decisionPoint', e.target.value)}
                placeholder="e.g. What should the consultant verify, remove and escalate before sending the response?"
                className="w-full p-3 rounded-lg border border-slate-200 text-xs text-slate-800 focus:border-[#052B66] outline-none resize-y leading-relaxed"
              />
            </div>

            {/* Debrief */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-[#052B66]">Debrief</span>
                <span className="text-[11px] text-slate-400 font-medium">Explain reasoning & takeaway</span>
              </div>
              <textarea
                rows={3}
                value={activeScenario.debrief}
                onChange={e => handleUpdateActiveField('debrief', e.target.value)}
                placeholder="e.g. Verify claims against approved sources, remove personal data, disclose AI assistance where required, and retain human accountability."
                className="w-full p-3 rounded-lg border border-slate-200 text-xs text-slate-800 focus:border-[#052B66] outline-none resize-y leading-relaxed"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <p className="text-xs text-slate-500">No scenarios created for this module yet.</p>
          <button
            onClick={handleAddScenario}
            className="px-4 py-2 bg-[#052B66] text-white rounded-lg text-xs font-bold"
          >
            + Create First Scenario
          </button>
        </div>
      )}
    </div>
  );
};
