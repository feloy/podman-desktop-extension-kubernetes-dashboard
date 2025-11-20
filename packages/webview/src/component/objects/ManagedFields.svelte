<script lang="ts">
import type { V1ManagedFieldsEntry } from '@kubernetes/client-node';
import ManagedField from '/@/component/objects/ManagedField.svelte';
import { Dropdown } from '@podman-desktop/ui-svelte';

interface Props {
  object: unknown;
  fields: V1ManagedFieldsEntry[];
}
let { object, fields }: Props = $props();

let selectedManager = $state('');

function handleManagerChange(value: unknown): void {
  selectedManager = String(value);
}

let managers = $derived([
  ...new Set(
    fields
      .filter(field => field.manager && field.manager.length > 0)
      .map(field => field.manager)
      .filter(manager => !!manager && manager.length > 0) as string[],
  ),
]);
</script>

<div class="flex flex-col h-full gap-2">
  <Dropdown
    ariaLabel="Managed fields"
    name="managed-fields"
    class="w-56 max-w-56"
    value=""
    onChange={handleManagerChange}
    options={[
      {
        label: '(all managers)',
        value: '',
      },
      ...managers.map(manager => ({
        label: manager,
        value: manager,
      })),
    ]}>
  </Dropdown>
  <div class="overflow-y-auto h-full">
    <ManagedField object={object} fields={fields} selectedManager={selectedManager} />
  </div>
</div>
