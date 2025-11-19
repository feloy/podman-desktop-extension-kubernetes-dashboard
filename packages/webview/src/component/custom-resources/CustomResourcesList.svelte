<script lang="ts">
import { TableColumn, TableRow, TableSimpleColumn } from '@podman-desktop/ui-svelte';
import KubernetesObjectsList from '/@/component/objects/KubernetesObjectsList.svelte';
import { getContext, onDestroy, onMount } from 'svelte';
import KubernetesEmptyScreen from '/@/component/objects/KubernetesEmptyScreen.svelte';
import { States } from '/@/state/states';
import KubernetesIcon from '/@/component/icons/KubernetesIcon.svelte';
import type { KubernetesNamespacedObjectUI } from '/@/component/objects/KubernetesObjectUI';
import type { Unsubscriber } from 'svelte/store';

const states = getContext<States>(States);
const updateResource = states.stateUpdateResourceInfoUI;
const configuration = states.stateConfigurationInfoUI;

let resourceSubscription: Unsubscriber | undefined = undefined;
let subscriptions: Unsubscriber[] = [];

onMount(() => {
  subscriptions.push(configuration.subscribe());
});

onDestroy(() => {
  subscriptions.forEach(subscription => subscription?.());
  resourceSubscription?.();
});

let nameColumn = new TableColumn<{ name: string }, string>('Name', {
  width: '1.3fr',
  renderMapping: (res): string => res.name,
  renderer: TableSimpleColumn,
  comparator: (a, b): number => a.name.localeCompare(b.name),
});

const columns = [nameColumn];

const row = new TableRow<{ name: string }>({
  selectable: (_service): boolean => true,
});

let previousResource = $state<string>();
$effect(() => {
  if (previousResource !== configuration.data?.customResource?.plural) {
    previousResource = configuration.data?.customResource?.plural ?? '';
    resourceSubscription?.();
    resourceSubscription = updateResource.subscribe({
      contextName: undefined, // ask for resources in the default context
      resourceName: previousResource,
    });
  }
});
</script>

{#if configuration.data?.customResource}
  <KubernetesObjectsList
    kinds={[
      {
        resource: configuration.data.customResource.plural,
        transformer: (res): KubernetesNamespacedObjectUI => ({
          kind: configuration.data?.customResource?.kind ?? '',
          status: 'RUNNING',
          name: res.metadata?.name ?? '',
          namespace: res.metadata?.namespace ?? '',
        }),
      },
    ]}
    singular={configuration.data?.customResource?.kind ?? ''}
    plural={configuration.data?.customResource?.plural ?? ''}
    isNamespaced={configuration.data.customResource.isNamespaced}
    icon={KubernetesIcon}
    columns={columns}
    row={row}>
    <!-- eslint-disable-next-line sonarjs/no-unused-vars -->
    {#snippet emptySnippet()}
      {#if configuration.data?.customResource}
        <KubernetesEmptyScreen icon={KubernetesIcon} resources={[configuration.data.customResource.plural]} />
      {/if}
    {/snippet}
  </KubernetesObjectsList>
{/if}
