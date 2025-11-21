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

function ownsKValue(field: V1ManagedFieldsEntry, key: string, value: unknown): boolean {
  if (!Object.keys(field.fieldsV1).some(k => k.startsWith(`k:`))) {
    return false;
  }
  const keysList = Object.keys(field.fieldsV1).filter(k => k.startsWith(`k:`));
  if (!keysList.length) {
    return false;
  }
  for (const keys of keysList) {
    if (ownsValueByKey(JSON.parse(keys.substring(2)), value)) {
      return true;
    }
  }
  return false;
}

function ownsValueByKey(keys: Record<string, unknown>, value: unknown): boolean {
  for (const [k, v] of Object.entries(keys)) {
    if (typeof value !== 'object' || !value || (value as Record<string, unknown>)[k] !== v) {
      return false;
    }
  }
  return true;
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
    .filter(
      field =>
        typeof field.fieldsV1 === 'object' &&
        !!field.fieldsV1 &&
        (ownsFValue(field, key, value) || ownsKValue(field, key, value)),
    )
    .map(field => field.manager)
    .filter(manager => !!manager && manager.length > 0) as string[];
}

function hasUser(key: string): boolean {
  if (selectedManager === '') {
    return fields.some(
      field =>
        typeof field.fieldsV1 === 'object' &&
        !!field.fieldsV1 &&
        (`f:${key}` in field.fieldsV1 || Object.keys(field.fieldsV1).some(k => k.startsWith(`k:`))),
    );
  } else {
    const fieldsV1 = fields.find(field => field.manager === selectedManager)?.fieldsV1;
    return (
      typeof fieldsV1 === 'object' &&
      !!fieldsV1 &&
      (`f:${key}` in fieldsV1 || Object.keys(fieldsV1).some(k => k.startsWith(`k:`)))
    );
  }
}

function subFields(key: string, fields: V1ManagedFieldsEntry[], value: unknown): V1ManagedFieldsEntry[] {
  if (!isNaN(parseInt(key, 10))) {
    // It's an arry entry, we need to check if there are any `k:` fields that match the value
    return fields.map(field => {
      let subField: unknown = {};
      if (field.fieldsV1) {
        const keysList = Object.keys(field.fieldsV1).filter(k => k.startsWith(`k:`));
        if (!keysList.length) {
          subField = {};
        } else {
          for (const keys of keysList) {
            if (ownsValueByKey(JSON.parse(keys.substring(2)), value)) {
              subField = field.fieldsV1[keys];
              break;
            }
          }
        }
      }
      return {
        ...field,
        fieldsV1: subField,
      };
    });
  }

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
              <ManagedField object={value} fields={subFields(key, fields, value)} selectedManager={selectedManager} />
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
