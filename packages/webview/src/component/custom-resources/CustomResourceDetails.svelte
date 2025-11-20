<script lang="ts">
import { getContext, onDestroy, onMount } from 'svelte';
import KubernetesObjectDetails from '/@/component/objects/KubernetesObjectDetails.svelte';
import type { KubernetesObject } from '@kubernetes/client-node';
import { States } from '/@/state/states';
import type { Unsubscriber } from 'svelte/store';
import type { KubernetesObjectUICustomResource } from '/@/component/custom-resources/custom-resource';
import Actions from '/@/component/namespaces/columns/Actions.svelte';
import CustomResourceDetailsSummary from '/@/component/custom-resources/CustomResourceDetailsSummary.svelte';

interface Props {
  name: string;
  namespace: string;
}
let { name, namespace }: Props = $props();

const states = getContext<States>(States);
const configuration = states.stateConfigurationInfoUI;

let subscriptions: Unsubscriber[] = [];

onMount(() => {
  subscriptions.push(configuration.subscribe());
});

onDestroy(() => {
  subscriptions.forEach(subscription => subscription?.());
});

function transformer(res: KubernetesObject): KubernetesObjectUICustomResource {
  return {
    status: 'RUNNING',
    name: res.metadata?.name ?? '',
    kind: configuration.data?.customResource?.kind ?? '',
    metadata: res.metadata ?? {},
    spec: 'spec' in res ? (res.spec as Record<string, unknown>) : {},
    statusOriginal: 'status' in res ? (res.status as Record<string, unknown>) : {},
  };
}
</script>

{#if configuration.data?.customResource}
  <KubernetesObjectDetails
    typed={{} as KubernetesObject}
    typedUI={{} as KubernetesObjectUICustomResource}
    kind={configuration.data.customResource.kind}
    resourceName={configuration.data.customResource.plural}
    listName={configuration.data.customResource.plural}
    name={name}
    namespace={namespace}
    transformer={transformer}
    ActionsComponent={Actions}
    SummaryComponent={CustomResourceDetailsSummary} />
{/if}
