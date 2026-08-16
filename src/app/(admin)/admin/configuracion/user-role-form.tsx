'use client';

import { useActionState, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Checkbox, Field, Select } from '@/components/ui/input';
import { Notice } from '@/components/ui/misc';
import { updateUserRole } from '@/lib/actions/settings';
import type { AppUser } from '@/types';

export function UserRoleForm({ user, isSelf }: { user: AppUser; isSelf: boolean }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(updateUserRole, null);

  useEffect(() => {
    if (state?.ok) {
      toast.success(state.message ?? 'Usuario actualizado.');
      setOpen(false);
    }
  }, [state]);

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>Editar</Button>

      <Dialog open={open} onClose={() => setOpen(false)} title={`Editar ${user.full_name || user.email}`}>
        <form action={action} className="space-y-5">
          <input type="hidden" name="user_id" value={user.id} />
          {state && !state.ok && <Notice tone="danger">{state.error}</Notice>}
          {isSelf && <Notice tone="warning">Estas editando tu propia cuenta.</Notice>}

          <Field label="Rol" htmlFor={`role-${user.id}`} required>
            <Select id={`role-${user.id}`} name="role" defaultValue={user.role}>
              <option value="client">Cliente</option>
              <option value="admin">Administrador</option>
            </Select>
          </Field>

          <Checkbox
            id={`active-${user.id}`}
            name="is_active"
            label="Cuenta activa"
            defaultChecked={user.is_active}
          />

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={pending}>Guardar</Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
