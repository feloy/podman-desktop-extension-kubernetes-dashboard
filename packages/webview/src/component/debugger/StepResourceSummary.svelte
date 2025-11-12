<script lang="ts">
import Cell from '/@/component/details/Cell.svelte';
import { getNewManagedFields } from '/@/component/debugger/debugger';
import Table from '/@/component/details/Table.svelte';
import Title from '/@/component/details/Title.svelte';
import type { DebuggerStepResourceUI } from '/@/component/debugger/step-helper';

interface Props {
  stepInfo: DebuggerStepResourceUI;
}
let { stepInfo }: Props = $props();

let newManagedFields = $derived(getNewManagedFields(stepInfo.object, stepInfo.previous));
</script>

<Table>
  <tr>
    <Cell>Type</Cell>
    <Cell>{stepInfo.type}</Cell>
  </tr>
  <tr>
    <Cell>Resource</Cell>
    <Cell>{stepInfo.kind} / {stepInfo.name}</Cell>
  </tr>

  {#if newManagedFields.length > 0}
    <Title>Managed Fields</Title>
    {#each newManagedFields as managedField, index (index)}
      <tr>
        <Cell>Manager</Cell>
        <Cell>{managedField.manager}</Cell>
      </tr>
      <tr>
        <Cell>Operation</Cell>
        <Cell>{managedField.operation}</Cell>
      </tr>
      {#if managedField.subresource}
        <tr>
          <Cell>Subresource</Cell>
          <Cell>{managedField.subresource}</Cell>
        </tr>
      {/if}
    {/each}
  {/if}
</Table>
