/**
 * "¿Qué seguro necesito?" assistant: a four-step questionnaire rendered as a
 * React island on `/herramientas/que-seguro-necesito/`.
 *
 * Hydrated with `client:visible` (ROADMAP §8). The copy is Spanish because it
 * is visible to the visitor; every identifier and comment stays in English.
 *
 * The questionnaire only guides: it never quotes, underwrites or asserts
 * coverage. All rules live in `assistantLogic.ts` so they can be tested
 * without a browser.
 */
import { useEffect, useRef, useState } from 'react';

import { siteConfig } from '../../config/site';
import { trackToolComplete } from '../../scripts/tracking';
import {
  buildRecommendation,
  buildWhatsAppUrl,
  summarizeAnswers,
  EMPTY_ANSWERS,
  PRIORITY_OPTIONS,
  PROTECTION_OPTIONS,
  USAGE_OPTIONS,
  VEHICLE_TYPE_OPTIONS,
  type Answers,
  type Option,
} from './assistantLogic';

type Step = 'protection' | 'vehicle' | 'priority' | 'summary';

const STEP_LABELS: Record<Step, string> = {
  protection: 'Qué quieres proteger',
  vehicle: 'Tu vehículo',
  priority: 'Tu prioridad',
  summary: 'Tu resumen',
};

const PRIMARY_BUTTON =
  'inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--red-bright)] px-6 py-3 text-sm font-bold text-white transition hover:bg-[var(--red)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--navy)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-[var(--red-bright)] sm:w-auto';

const SECONDARY_BUTTON =
  'inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#cbd5e1] bg-white px-6 py-3 text-sm font-bold text-[var(--navy)] transition hover:border-[var(--navy)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--navy)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[#cbd5e1] sm:w-auto';

const LEGEND = 'block w-full text-xl font-bold text-[var(--navy)]';
const HELP = 'mt-1 mb-5 block text-sm text-[var(--text-muted)]';

interface OptionCardProps<T extends string> {
  name: string;
  option: Option<T>;
  checked: boolean;
  onSelect: (value: T) => void;
}

function OptionCard<T extends string>({ name, option, checked, onSelect }: OptionCardProps<T>) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
        checked
          ? 'border-[var(--red-bright)] bg-[#fef2f2] ring-2 ring-[var(--red-bright)]/25'
          : 'border-[#e2e8f0] bg-white hover:border-[#94a3b8]'
      }`}
    >
      <input
        type="radio"
        name={name}
        value={option.value}
        checked={checked}
        onChange={() => onSelect(option.value)}
        className="mt-1 h-4 w-4 shrink-0 accent-[var(--red-bright)]"
      />
      <span>
        <span className="block text-base font-semibold text-[var(--navy)]">{option.label}</span>
        <span className="mt-0.5 block text-sm leading-snug text-[var(--text-muted)]">
          {option.hint}
        </span>
      </span>
    </label>
  );
}

export default function InsuranceAssistant() {
  const [answers, setAnswers] = useState<Answers>(EMPTY_ANSWERS);
  const [stepIndex, setStepIndex] = useState(0);

  // The questionnaire counts as completed the first time the summary is shown
  // in this mount; going back and forth does not send the event again.
  const completionTracked = useRef(false);

  // The vehicle step only exists once the visitor chooses a vehicle, so the
  // questionnaire runs in four steps for vehicles and three for everything else.
  const steps: Step[] =
    answers.protection === 'auto'
      ? ['protection', 'vehicle', 'priority', 'summary']
      : ['protection', 'priority', 'summary'];

  const index = Math.min(stepIndex, steps.length - 1);
  const step = steps[index];
  const total = steps.length;

  const patch = (changes: Partial<Answers>) =>
    setAnswers((current) => ({ ...current, ...changes }));

  const canContinue =
    step === 'protection'
      ? answers.protection !== null
      : step === 'vehicle'
        ? answers.vehicleType !== null && answers.usage !== null
        : step === 'priority'
          ? answers.priority !== null
          : true;

  const goNext = () => {
    if (!canContinue) return;
    setStepIndex(Math.min(index + 1, total - 1));
  };

  const goBack = () => setStepIndex(Math.max(index - 1, 0));

  const restart = () => {
    setAnswers(EMPTY_ANSWERS);
    setStepIndex(0);
  };

  useEffect(() => {
    if (step !== 'summary' || completionTracked.current) return;
    completionTracked.current = true;
    trackToolComplete('asistente-necesidades');
  }, [step]);

  const recommendation = step === 'summary' ? buildRecommendation(answers) : null;
  const rows = step === 'summary' ? summarizeAnswers(answers) : [];
  const whatsappHref = buildWhatsAppUrl(siteConfig.whatsappNumber, answers);

  return (
    <div className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-[0_10px_30px_rgba(11,37,69,0.06)] sm:p-8">
      {/* Progress */}
      <div className="mb-6">
        <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <p className="text-sm font-bold text-[var(--red)]">
            Paso {index + 1} de {total}
          </p>
          <p className="text-sm font-medium text-[var(--text-muted)]">{STEP_LABELS[step]}</p>
        </div>
        <div
          className="h-2 w-full overflow-hidden rounded-full bg-[#e2e8f0]"
          role="progressbar"
          aria-label="Avance del cuestionario"
          aria-valuemin={1}
          aria-valuemax={total}
          aria-valuenow={index + 1}
          aria-valuetext={`Paso ${index + 1} de ${total}`}
        >
          <div
            className="h-full rounded-full bg-[var(--red-bright)] transition-[width] duration-300"
            style={{ width: `${((index + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      <div className="min-h-[260px]">
        {step === 'protection' && (
          <fieldset>
            <legend className={LEGEND}>¿Qué quieres proteger?</legend>
            <p className={HELP}>
              Elige el punto de partida. Si tu caso combina varias cosas, el asesor las revisa
              contigo en una sola conversación.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {PROTECTION_OPTIONS.map((option) => (
                <OptionCard
                  key={option.value}
                  name="protection"
                  option={option}
                  checked={answers.protection === option.value}
                  onSelect={(value) => patch({ protection: value })}
                />
              ))}
            </div>
          </fieldset>
        )}

        {step === 'vehicle' && (
          <>
            <fieldset>
              <legend className="block w-full text-lg font-bold text-[var(--navy)]">
                ¿Qué vehículo usas?
              </legend>
              <p className={HELP}>La cobertura cambia según sea auto o moto.</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {VEHICLE_TYPE_OPTIONS.map((option) => (
                  <OptionCard
                    key={option.value}
                    name="vehicle-type"
                    option={option}
                    checked={answers.vehicleType === option.value}
                    onSelect={(value) => patch({ vehicleType: value })}
                  />
                ))}
              </div>
            </fieldset>

            <fieldset className="mt-6">
              <legend className="block w-full text-lg font-bold text-[var(--navy)]">
                ¿Para qué lo usas?
              </legend>
              <p className={HELP}>
                El uso que declaras a la aseguradora es lo que decide si la póliza responde o no.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {USAGE_OPTIONS.map((option) => (
                  <OptionCard
                    key={option.value}
                    name="usage"
                    option={option}
                    checked={answers.usage === option.value}
                    onSelect={(value) => patch({ usage: value })}
                  />
                ))}
              </div>
            </fieldset>
          </>
        )}

        {step === 'priority' && (
          <fieldset>
            <legend className={LEGEND}>¿Qué es lo más importante para ti?</legend>
            <p className={HELP}>
              No hay una respuesta correcta: sirve para saber qué revisar primero.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {PRIORITY_OPTIONS.map((option) => (
                <OptionCard
                  key={option.value}
                  name="priority"
                  option={option}
                  checked={answers.priority === option.value}
                  onSelect={(value) => patch({ priority: value })}
                />
              ))}
            </div>
          </fieldset>
        )}

        {step === 'summary' && (
          <div>
            <h2 className="text-xl font-bold text-[var(--navy)]">Tu resumen</h2>
            <p className="mt-1 mb-5 text-sm text-[var(--text-muted)]">
              Esto es lo que respondiste. Puedes volver y cambiarlo antes de escribir al asesor.
            </p>

            <dl className="mb-6 grid gap-3 rounded-xl bg-[var(--gray-card)] p-4 sm:grid-cols-2">
              {rows.map((row) => (
                <div key={row.label}>
                  <dt className="text-xs font-semibold tracking-wide text-[var(--text-muted)] uppercase">
                    {row.label}
                  </dt>
                  <dd className="mt-0.5 text-sm font-semibold text-[var(--navy)]">{row.value}</dd>
                </div>
              ))}
            </dl>

            {recommendation && (
              <div className="rounded-xl border-l-4 border-[var(--red-bright)] bg-[var(--gray-card)] p-5">
                <h3 className="text-lg font-bold text-[var(--navy)]">{recommendation.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
                  {recommendation.description}
                </p>
                {recommendation.note && (
                  <p className="mt-3 text-sm font-semibold text-[var(--navy)]">
                    {recommendation.note}
                  </p>
                )}
                <a
                  href={recommendation.href}
                  className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[var(--red)] hover:underline"
                >
                  {recommendation.linkLabel}
                  <i className="fas fa-arrow-right" aria-hidden="true" />
                </a>
              </div>
            )}

            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#0b6e5f] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#085549] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--navy)] sm:w-auto"
            >
              <i className="fab fa-whatsapp text-lg" aria-hidden="true" />
              Enviar mis respuestas por WhatsApp
            </a>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="mt-7 flex flex-col-reverse gap-3 border-t border-[#e2e8f0] pt-5 sm:flex-row sm:items-center sm:justify-between">
        <button type="button" onClick={goBack} disabled={index === 0} className={SECONDARY_BUTTON}>
          <i className="fas fa-arrow-left" aria-hidden="true" />
          Volver
        </button>

        {step === 'summary' ? (
          <button type="button" onClick={restart} className={SECONDARY_BUTTON}>
            <i className="fas fa-rotate-left" aria-hidden="true" />
            Empezar de nuevo
          </button>
        ) : (
          <button type="button" onClick={goNext} disabled={!canContinue} className={PRIMARY_BUTTON}>
            {index === total - 2 ? 'Ver mi recomendación' : 'Siguiente'}
            <i className="fas fa-arrow-right" aria-hidden="true" />
          </button>
        )}
      </div>

      <p className="mt-6 border-t border-[#e2e8f0] pt-4 text-xs leading-relaxed text-[var(--text-muted)]">
        <i className="fas fa-info-circle mr-1 text-[var(--red)]" aria-hidden="true" />
        Esta es una guía educativa, no una oferta de seguro. Las coberturas, deducibles y
        exclusiones los define el condicionado de cada aseguradora.
      </p>
    </div>
  );
}
