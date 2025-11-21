<script lang="ts">
import { Navigator } from '/@/navigation/navigator';
import { KubernetesObjectUIHelper } from '/@/component/objects/kubernetes-object-ui-helper';

import type { ObjectProps } from './object-props';
import { getContext, onMount } from 'svelte';
import { DependencyAccessor } from '/@/inject/dependency-accessor';
import { States } from '/@/state/states';
import { router } from 'tinro';

let { object }: ObjectProps = $props();

const dependencyAccessor = getContext<DependencyAccessor>(DependencyAccessor);
const navigator = dependencyAccessor.get<Navigator>(Navigator);
const objectHelper = dependencyAccessor.get<KubernetesObjectUIHelper>(KubernetesObjectUIHelper);

const states = getContext<States>(States);
const configuration = states.stateConfigurationInfoUI;

async function openDetails(): Promise<void> {
  if (configuration.data?.customResource && object.kind === configuration.data.customResource.kind) {
    let namespace = '';
    if (objectHelper.isNamespaced(object)) {
      namespace = object.namespace;
    }
    router.goto(`/custom-resource/${object.name}/${namespace}/summary`);
    return;
  }

  if (objectHelper.isNamespaced(object)) {
    navigator.navigateTo({
      kind: object.kind,
      name: object.name,
      namespace: object.namespace,
    });
  } else {
    navigator.navigateTo({
      kind: object.kind,
      name: object.name,
    });
  }
}

onMount(() => {
  return configuration.subscribe();
});
</script>

<button class="hover:cursor-pointer flex flex-col max-w-full text-left" onclick={openDetails}>
  <div class="text-(--pd-table-body-text-highlight) overflow-hidden text-ellipsis">
    {object.name}
  </div>
  {#if objectHelper.isNamespaced(object)}
    <div class="text-(--pd-table-body-text) font-extra-light text-sm overflow-hidden text-ellipsis">
      {object.namespace}
    </div>
  {/if}
</button>
