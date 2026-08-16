'use client';

import { useCallback, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Stepper } from '@/components/ui/stepper';
import { Notice } from '@/components/ui/misc';
import type { UploadedFile } from '@/components/ui/file-upload';
import { StepLocation, StepQuantity, StepSchedule, StepService } from './steps';
import { GuestGate, StepReview } from './step-review';
import { createServiceRequest } from '@/lib/actions/requests';
import {
  guestSchema,
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  step5Schema,
  type WizardData,
} from '@/lib/validations/request';
import type { ServiceType } from '@/types';

const STEP_LABELS = ['Servicio', 'Cantidad', 'Ubicación', 'Detalles', 'Confirmación'];

type Errors = Record<string, string | undefined>;

function toErrors(issues: { path: (string | number)[]; message: string }[]): Errors {
  const out: Errors = {};
  for (const i of issues) {
    const key = String(i.path[0] ?? '');
    if (key && !out[key]) out[key] = i.message;
  }
  return out;
}

export function RequestWizard({
  isGuest,
  defaultService,
  defaultContact,
}: {
  isGuest: boolean;
  defaultService?: ServiceType;
  defaultContact?: { name?: string; phone?: string; email?: string };
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  // El invitado pasa primero por la pantalla de datos de contacto (indice -1).
  const [step, setStep] = useState(isGuest ? -1 : 0);
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [files, setFiles] = useState<UploadedFile[]>([]);

  const [data, setData] = useState<WizardData>({
    service_type: defaultService,
    quantity_gal: null,
    quantity_unknown: false,
    urgency: 'normal',
    facility_type: undefined,
    contact_name: defaultContact?.name ?? '',
    contact_phone: defaultContact?.phone ?? '',
    contact_email: defaultContact?.email ?? '',
    terms_accepted: false,
  });

  const update = useCallback((patch: Partial<WizardData>) => {
    setData((prev) => ({ ...prev, ...patch }));
    setErrors((prev) => {
      const next = { ...prev };
      for (const k of Object.keys(patch)) delete next[k];
      return next;
    });
  }, []);

  const validateStep = useCallback(
    (index: number): boolean => {
      const schemas = [step1Schema, step2Schema, step3Schema, step4Schema, step5Schema];
      const schema = index === -1 ? guestSchema : schemas[index];
      const result = schema.safeParse(data);
      if (result.success) {
        setErrors({});
        return true;
      }
      setErrors(toErrors(result.error.issues));
      return false;
    },
    [data],
  );

  const next = () => {
    if (!validateStep(step)) {
      toast.error('Revisa los campos marcados antes de continuar.');
      return;
    }
    setStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const back = () => {
    setErrors({});
    setStep((s) => s - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submit = () => {
    if (!validateStep(4)) {
      toast.error('Debes aceptar la condición para enviar la solicitud.');
      return;
    }
    setServerError(null);

    startTransition(async () => {
      const result = await createServiceRequest({
        ...data,
        quantity_gal: data.quantity_unknown ? null : (data.quantity_gal ?? null),
        attachment_paths: files.map((f) => f.path),
        contact_email: data.contact_email || undefined,
      });

      if (!result.ok) {
        setServerError(result.error);
        if (result.fieldErrors) {
          const fe: Errors = {};
          for (const [k, v] of Object.entries(result.fieldErrors)) fe[k] = v[0];
          setErrors(fe);
        }
        toast.error(result.error);
        return;
      }

      toast.success('Solicitud enviada correctamente.');
      const d = result.data!;
      router.push(
        d.is_guest
          ? `/solicitud-enviada/${d.id}?token=${d.access_token}`
          : `/solicitud-enviada/${d.id}`,
      );
    });
  };

  const progressIndex = useMemo(() => Math.max(0, step), [step]);

  return (
    <div className="mx-auto w-full max-w-3xl">
      {step >= 0 && (
        <div className="mb-6">
          <Stepper
            steps={STEP_LABELS}
            current={progressIndex}
            onStepClick={(i) => {
              setErrors({});
              setStep(i);
            }}
          />
        </div>
      )}

      <Card className="p-6 sm:p-8">
        {serverError && <Notice tone="danger" className="mb-6">{serverError}</Notice>}

        <div key={step} className="wizard-step-enter">
          {step === -1 && <GuestGate data={data} update={update} errors={errors} />}
          {step === 0 && <StepService data={data} update={update} errors={errors} />}
          {step === 1 && <StepQuantity data={data} update={update} errors={errors} />}
          {step === 2 && (
            <StepLocation
              data={data}
              update={update}
              errors={errors}
              files={files}
              onFilesChange={setFiles}
            />
          )}
          {step === 3 && <StepSchedule data={data} update={update} errors={errors} />}
          {step === 4 && <StepReview data={data} update={update} errors={errors} isGuest={isGuest} />}
        </div>

        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-navy-100 pt-6 sm:flex-row sm:justify-between">
          {step > (isGuest ? -1 : 0) ? (
            <Button variant="secondary" onClick={back} disabled={pending}>
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Anterior
            </Button>
          ) : (
            <span />
          )}

          {step < 4 ? (
            <Button onClick={next} size="lg" className="sm:min-w-[170px]">
              Siguiente
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
          ) : (
            <Button onClick={submit} size="lg" loading={pending} className="sm:min-w-[190px]">
              <Send className="h-4 w-4" aria-hidden />
              Enviar solicitud
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
