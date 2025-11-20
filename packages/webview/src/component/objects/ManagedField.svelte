<script lang="ts">
import type { V1ManagedFieldsEntry } from '@kubernetes/client-node';
import ManagedField from '/@/component/objects/ManagedField.svelte';

interface Props {
  object: unknown;
  fields: V1ManagedFieldsEntry[];
  selectedManager: string;
}
let { object, fields, selectedManager }: Props = $props();

let displayAll = $derived(selectedManager === '');

function ownsFValue(field: V1ManagedFieldsEntry, key: string, value: unknown): boolean {
  return `f:${key}` in field.fieldsV1 && (ownsObject(field, key, value) || ownsValue(field, key, value));
}

function ownsObject(field: V1ManagedFieldsEntry, key: string, value: unknown): boolean {
  return typeof value === 'object' && '.' in field.fieldsV1[`f:${key}`];
}

function ownsValue(field: V1ManagedFieldsEntry, key: string, value: unknown): boolean {
  return (
    typeof value !== 'object' &&
    typeof field.fieldsV1[`f:${key}`] === 'object' &&
    Object.keys(field.fieldsV1[`f:${key}`]).length === 0
  );
}

function displayManagers(key: string, value: unknown): string[] {
  if (!displayAll) {
    return [];
  }
  return fields
    .filter(field => typeof field.fieldsV1 === 'object' && !!field.fieldsV1 && ownsFValue(field, key, value))
    .map(field => field.manager)
    .filter(manager => !!manager && manager.length > 0) as string[];
}

function hasUser(key: string): boolean {
  if (selectedManager === '') {
    return fields.some(field => typeof field.fieldsV1 === 'object' && !!field.fieldsV1 && `f:${key}` in field.fieldsV1);
  } else {
    const fieldsV1 = fields.find(field => field.manager === selectedManager)?.fieldsV1;
    return typeof fieldsV1 === 'object' && !!fieldsV1 && `f:${key}` in fieldsV1;
  }
}

function subFields(key: string, fields: V1ManagedFieldsEntry[]): V1ManagedFieldsEntry[] {
  return fields.map(field => ({
    ...field,
    fieldsV1: field.fieldsV1?.[`f:${key}`],
  }));
}
</script>

{#if typeof object === 'object' && !!object}
  {#each Object.entries(object) as [key, value] (key)}
    {#if key !== 'managedFields'}
      {@const _hasUser = hasUser(key)}
      {#if displayAll || _hasUser}
        <div style="margin-left: 0.5rem;">
          <div class:text-yamlfield={_hasUser} class:text-gray-900={!_hasUser}>
            {key}:
            {#if typeof value === 'object' && !!value}
              <span class="text-sm text-gray-700 pl-8">{displayManagers(key, value).join(', ')}</span>
              <ManagedField object={value} fields={subFields(key, fields)} selectedManager={selectedManager} />
            {:else}
              <span class:text-yamlvalue={_hasUser} class:text-gray-900={!_hasUser}> {value}</span>
              <span class="text-sm text-gray-700 pl-8">{displayManagers(key, value).join(', ')}</span>
            {/if}
          </div>
        </div>
      {/if}
    {/if}
  {/each}
{/if}
