<script lang="ts">
import type { KubernetesObject } from '@kubernetes/client-node';
import type { TableColumn, TableRow } from '@podman-desktop/ui-svelte';
import { FilteredEmptyScreen, NavPage, Table } from '@podman-desktop/ui-svelte';
import { getContext, onDestroy, onMount, type Snippet } from 'svelte';
import { type Unsubscriber } from 'svelte/store';

import type { KubernetesObjectUI } from './KubernetesObjectUI';
import { States } from '/@/state/states';
import type { ContextResourceItems } from '/@common/model/context-resources-items';
import { KubernetesObjectUIHelper } from './kubernetes-object-ui-helper';
import { DependencyAccessor } from '/@/inject/dependency-accessor';
import CurrentContextConnectionBadge from '/@/component/connection/CurrentContextConnectionBadge.svelte';

export interface Kind {
  resource: string;
  transformer: (o: KubernetesObject) => KubernetesObjectUI;
}

interface Props {
  kinds: Kind[];
  singular: string;
  plural: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: TableColumn<any>[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  row: TableRow<any>;

  emptySnippet: Snippet;
}

let { kinds, singular, plural, icon, columns, row, emptySnippet }: Props = $props();

const dependencyAccessor = getContext<DependencyAccessor>(DependencyAccessor);
const objectHelper = dependencyAccessor.get<KubernetesObjectUIHelper>(KubernetesObjectUIHelper);

let searchTerm = $state<string>('');

const states = getContext<States>(States);
const updateResource = states.stateUpdateResourceInfoUI;
const currentContext = states.stateCurrentContextInfoUI;

let unsubscribers: Unsubscriber[] = [];

$effect(() => {
  // first unsubscribe from previous context
  unsubscribeFromContext();
  if (currentContext.data?.contextName) {
    subscribeToContext(currentContext.data.contextName);
  }
});

function filterResources(allResources: ContextResourceItems[], resourceName: string): ContextResourceItems[] {
  return allResources.filter(
    resources => resources.contextName === currentContext.data?.contextName && resourceName === resources.resourceName,
  );
}

const objects = $derived(
  kinds.flatMap(kind =>
    filterResources(updateResource?.data?.resources ?? [], kind.resource)
      .flatMap(resourceItems => resourceItems.items)
      .filter(object => (searchTerm ? objectHelper.findMatchInLeaves(object, searchTerm) : true))
      .map(object => kind.transformer(object)),
  ),
);

function subscribeToContext(contextName: string): void {
  unsubscribers = kinds.map(kind =>
    updateResource.subscribe({
      contextName: contextName,
      resourceName: kind.resource,
    }),
  );
}

function unsubscribeFromContext(): void {
  unsubscribers.forEach(unsubscriber => unsubscriber());
}

onMount(() => {
  // returns the unsubscriber, which will be called automatically at destroy time
  return currentContext.subscribe();
});

onDestroy(() => {
  unsubscribeFromContext();
});
</script>

<NavPage bind:searchTerm={searchTerm} title={plural}>
  {#snippet bottomAdditionalActions()}
    <div class="flex grow justify-end">
      <CurrentContextConnectionBadge />
    </div>
  {/snippet}

  {#snippet content()}
    <div class="flex min-w-full h-full">
      <Table kind={singular} data={objects} columns={columns} row={row} defaultSortColumn="Name"></Table>

      {#if objects.length === 0}
        {#if searchTerm}
          <FilteredEmptyScreen
            icon={icon}
            kind={plural}
            searchTerm={searchTerm}
            on:resetFilter={(): string => (searchTerm = '')} />
        {:else}
          {@render emptySnippet()}
        {/if}
      {/if}
    </div>
  {/snippet}
</NavPage>
