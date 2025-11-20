<script lang="ts">
import { TableColumn, TableDurationColumn, TableRow, TableSimpleColumn } from '@podman-desktop/ui-svelte';
import KubernetesObjectsList from '/@/component/objects/KubernetesObjectsList.svelte';
import { getContext, onDestroy, onMount } from 'svelte';
import KubernetesEmptyScreen from '/@/component/objects/KubernetesEmptyScreen.svelte';
import { States } from '/@/state/states';
import KubernetesIcon from '/@/component/icons/KubernetesIcon.svelte';
import type { Unsubscriber } from 'svelte/store';
import type { V1CustomResourceColumnDefinition } from '@kubernetes/client-node';
import {
  getPrinterColumns,
  type KubernetesObjectUICustomResource,
} from '/@/component/custom-resources/custom-resource';
import Name from '/@/component/custom-resources/columns/Name.svelte';

const states = getContext<States>(States);
const updateResource = states.stateUpdateResourceInfoUI;
const configuration = states.stateConfigurationInfoUI;

let resourceSubscription: Unsubscriber | undefined = undefined;
let subscriptions: Unsubscriber[] = [];

onMount(() => {
  subscriptions.push(configuration.subscribe());
  subscriptions.push(
    updateResource.subscribe({
      contextName: undefined,
      resourceName: 'customresourcedefinitions',
    }),
  );
});

onDestroy(() => {
  subscriptions.forEach(subscription => subscription?.());
  resourceSubscription?.();
});

let nameColumn = new TableColumn<KubernetesObjectUICustomResource>('Name', {
  width: '1.3fr',
  renderer: Name,
  comparator: (a, b): number => a.name.localeCompare(b.name),
});

let columns = $state<TableColumn<KubernetesObjectUICustomResource, unknown>[]>();

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

$effect(() => {
  if (columns) {
    return;
  }
  if (!configuration.data?.customResource) {
    return;
  }
  if (!updateResource.data?.resources) {
    return;
  }
  const crdResources = updateResource.data?.resources.find(
    resource => resource.resourceName === 'customresourcedefinitions',
  );
  if (!crdResources) {
    return;
  }
  const printerColumns = getPrinterColumns(crdResources, configuration.data.customResource);
  if (!printerColumns) {
    columns = [nameColumn] as TableColumn<KubernetesObjectUICustomResource, unknown>[];
    return;
  }
  columns = [
    nameColumn as TableColumn<KubernetesObjectUICustomResource, unknown>,
    ...printerColumns.map(column => getColumn(column)),
  ];
});

function getColumn(column: V1CustomResourceColumnDefinition): TableColumn<KubernetesObjectUICustomResource, unknown> {
  if (column.type === 'date') {
    return new TableColumn<KubernetesObjectUICustomResource, Date>(column.name, {
      renderMapping: (res): Date => getValue(res, column.jsonPath) as Date,
      renderer: TableDurationColumn,
    }) as TableColumn<KubernetesObjectUICustomResource, unknown>;
  }
  return new TableColumn<KubernetesObjectUICustomResource, string>(column.name, {
    renderMapping: (res): string => getValue(res, column.jsonPath) as string,
    renderer: TableSimpleColumn,
  }) as TableColumn<KubernetesObjectUICustomResource, unknown>;
}

function getValue(object: KubernetesObjectUICustomResource, jsonPath: string): unknown {
  const value = jsonPath
    .split('.')
    .slice(1)
    .reduce<unknown>((acc, key, index) => {
      if (key === 'status' && index === 0) {
        key = 'statusOriginal';
      }
      // eslint-disable-next-line no-null/no-null
      if (typeof acc === 'object' && acc !== null) {
        return (acc as Record<string, unknown>)[key];
      }
      return undefined;
    }, object) as unknown;
  return value?.toString() ?? '';
}
</script>

{#if columns && configuration.data?.customResource}
  <KubernetesObjectsList
    kinds={[
      {
        resource: configuration.data.customResource.plural,
        transformer: (res): KubernetesObjectUICustomResource => ({
          status: 'RUNNING',
          name: res.metadata?.name ?? '',
          namespace: res.metadata?.namespace ?? '',
          kind: configuration.data?.customResource?.kind ?? '',
          metadata: res.metadata ?? {},
          spec: 'spec' in res ? (res.spec as Record<string, unknown>) : {},
          statusOriginal: 'status' in res ? (res.status as Record<string, unknown>) : {},
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
