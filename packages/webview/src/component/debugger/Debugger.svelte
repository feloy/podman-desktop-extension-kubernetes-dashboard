<script lang="ts">
import { getContext, onDestroy, onMount } from 'svelte';
import { Remote } from '/@/remote/remote';
import { API_CONTEXTS, type ContextsApi } from '@kubernetes-dashboard/channels';
import { NavPage, Table, TableColumn, TableRow } from '@podman-desktop/ui-svelte';
import { States } from '/@/state/states';
import type { Unsubscriber } from 'svelte/store';
import { faPlay, faStop } from '@fortawesome/free-solid-svg-icons';
import IconButton from '/@/component/button/IconButton.svelte';
import NameKind from '/@/component/debugger/columns/NameKind.svelte';
import Status from '/@/component/debugger/columns/Status.svelte';
import EventDetails from '/@/component/debugger/columns/EventDetails.svelte';
import Actions from '/@/component/debugger/columns/Actions.svelte';
import { DependencyAccessor } from '/@/inject/dependency-accessor';
import { DebuggerStepHelper, type DebuggerStepUI } from '/@/component/debugger/step-helper';

const dependencyAccessor = getContext<DependencyAccessor>(DependencyAccessor);
const stepHelper = dependencyAccessor.get<DebuggerStepHelper>(DebuggerStepHelper);

const remote = getContext<Remote>(Remote);
const contextsApi = remote.getProxy<ContextsApi>(API_CONTEXTS);
const states = getContext<States>(States);
const debuggerInfo = states.stateDebuggerInfoUI;

let unsubscriber: Unsubscriber | undefined;

onMount(() => {
  unsubscriber = debuggerInfo.subscribe();
});

onDestroy(() => {
  unsubscriber?.();
  unsubscriber = undefined;
});

const data = $derived(
  debuggerInfo.data?.steps
    .map((step, index) => stepHelper.DebuggerStepUI(step, index))
    .filter(step => step !== undefined),
);

let statusColumn = new TableColumn<DebuggerStepUI>('Status', {
  align: 'center',
  width: '70px',
  renderer: Status,
});
let nameColumn = new TableColumn<DebuggerStepUI>('Name', {
  renderer: NameKind,
});
let eventDetailsColumn = new TableColumn<DebuggerStepUI>('Event Info', {
  renderer: EventDetails,
});
let actionsColumn = new TableColumn<DebuggerStepUI>('Actions', {
  align: 'right',
  width: '100px',
  renderer: Actions,
});

const columns = [statusColumn, nameColumn, eventDetailsColumn, actionsColumn];
const row = new TableRow<DebuggerStepUI>({});
</script>

<NavPage searchEnabled={false} title="Debugger">
  {#snippet additionalActions()}
    <div class="flex grow justify-end">
      <IconButton
        enabled={!debuggerInfo.data?.active}
        title="Start debugger"
        onClick={async (): Promise<void> => {
          await contextsApi.setStepByStepMode(true);
        }}
        icon={faPlay} />
      <IconButton
        enabled={debuggerInfo.data?.active}
        title="Stop debugger"
        onClick={async (): Promise<void> => {
          await contextsApi.setStepByStepMode(false);
        }}
        icon={faStop} />
    </div>
  {/snippet}
  {#snippet content()}
    <div class="flex min-w-full h-full">
      <Table kind="Step" data={data ?? []} columns={columns} row={row}></Table>
    </div>
  {/snippet}
</NavPage>
