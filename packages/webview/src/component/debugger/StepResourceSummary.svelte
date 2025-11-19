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
    <Title>Field management</Title>
    <tr>
      <td colspan="2" class="italic py-1">
        {#if newManagedFields.length === 1}
          A new Field management record was added to the object during the update
        {:else}
          New Field management records were added to the object during the update
        {/if}
      </td>
    </tr>
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
