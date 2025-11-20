<script lang="ts">
import { KubernetesObjectUIHelper } from '/@/component/objects/kubernetes-object-ui-helper';

import type { ObjectProps } from './object-props';
import { getContext } from 'svelte';
import { DependencyAccessor } from '/@/inject/dependency-accessor';
import { router } from 'tinro';

let { object }: ObjectProps = $props();

const dependencyAccessor = getContext<DependencyAccessor>(DependencyAccessor);
const objectHelper = dependencyAccessor.get<KubernetesObjectUIHelper>(KubernetesObjectUIHelper);

async function openDetails(): Promise<void> {
  let namespace = '';
  if (objectHelper.isNamespaced(object)) {
    namespace = object.namespace;
  }
  router.goto(`/custom-resource/${object.name}/${namespace}/summary`);
}
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
