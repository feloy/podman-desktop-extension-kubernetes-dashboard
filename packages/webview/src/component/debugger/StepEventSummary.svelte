<script lang="ts">
import Table from '/@/component/details/Table.svelte';
import Title from '/@/component/details/Title.svelte';
import Cell from '/@/component/details/Cell.svelte';
import { getAgeAndCount } from '/@/component/debugger/debugger';
import type { DebuggerStepEventUI } from '/@/component/debugger/step-helper';

interface Props {
  stepInfo: DebuggerStepEventUI;
}
let { stepInfo }: Props = $props();

let ageAndCount = $derived(getAgeAndCount(stepInfo.event));
</script>

<Table>
  <tr>
    <Cell>Type</Cell>
    <Cell>{stepInfo.type.replace('-', ' ')}</Cell>
  </tr>
  <tr>
    <Cell>Resource</Cell>
    <Cell>{stepInfo.kind} / {stepInfo.name}</Cell>
  </tr>

  <Title>Event</Title>
  {#if stepInfo.event.related}
    <tr>
      <Cell>Related resource</Cell>
      <Cell>{stepInfo.event.related.kind} / {stepInfo.event.related.name}</Cell>
    </tr>
  {/if}
  {#if stepInfo.event.type}
    <tr>
      <Cell>Type</Cell>
      <Cell>{stepInfo.event.type}</Cell>
    </tr>
  {/if}
  {#if ageAndCount}
    <tr>
      <Cell>Age</Cell>
      <Cell>{ageAndCount}</Cell>
    </tr>
  {/if}
  {#if stepInfo.event.action}
    <tr>
      <Cell>Action</Cell>
      <Cell>{stepInfo.event.action}</Cell>
    </tr>
  {/if}
  {#if stepInfo.event.reason}
    <tr>
      <Cell>Reason</Cell>
      <Cell>{stepInfo.event.reason}</Cell>
    </tr>
  {/if}
  {#if stepInfo.event.message}
    <tr>
      <Cell>Message</Cell>
      <Cell>{stepInfo.event.message}</Cell>
    </tr>
  {/if}
  {#if stepInfo.event.reportingComponent}
    <tr>
      <Cell>Reporting Component</Cell>
      <Cell
        >{stepInfo.event.reportingComponent}{stepInfo.event.reportingInstance
          ? ` (${stepInfo.event.reportingInstance})`
          : ''}</Cell>
    </tr>
  {/if}
</Table>
