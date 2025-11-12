<script lang="ts">
import type { Props } from './props';
import type { KubernetesObject } from '@kubernetes/client-node';
import { getManagedField } from '/@/component/debugger/columns/event-details';
import { getAgeAndCount } from '/@/component/debugger/debugger';
import { getContext } from 'svelte';
import { DependencyAccessor } from '/@/inject/dependency-accessor';
import { DebuggerStepHelper } from '/@/component/debugger/step-helper';

let { object }: Props = $props();

const dependencyAccessor = getContext<DependencyAccessor>(DependencyAccessor);
const stepHelper = dependencyAccessor.get<DebuggerStepHelper>(DebuggerStepHelper);

function displayGenerationOrResourceVersion(object: KubernetesObject, previous?: KubernetesObject): string {
  if (object.metadata?.generation) {
    if (previous?.metadata?.generation && previous.metadata.generation !== object.metadata.generation) {
      return `generation ${previous.metadata.generation} → ${object.metadata.generation}`;
    }
    return `generation ${object.metadata.generation}`;
  }
  if (object.metadata?.resourceVersion) {
    if (previous?.metadata?.resourceVersion) {
      return `resource version ${previous.metadata.resourceVersion} → ${object.metadata.resourceVersion}`;
    }
    return `resource version ${object.metadata.resourceVersion}`;
  }
  return '';
}
</script>

{#if !stepHelper.isResourceStepUI(object) && object.event}
  {@const ageAndCount = getAgeAndCount(object.event)}
  <div class="flex flex-col max-w-full text-left">
    <div class="text-(--pd-table-body-text-highlight) overflow-hidden text-ellipsis">
      {ageAndCount ? `${ageAndCount} - ` : ''}{object.event.reason}
    </div>
    <div class="text-(--pd-table-body-text) font-extra-light text-sm overflow-hidden text-ellipsis">
      {object.event.message}
    </div>
  </div>
{/if}
{#if stepHelper.isResourceStepUI(object)}
  <div class="flex flex-col max-w-full text-left">
    <div class="text-(--pd-table-body-text-highlight) overflow-hidden text-ellipsis">
      {getManagedField(object.object, object.previous)}
    </div>
    <div class="text-(--pd-table-body-text) font-extra-light text-sm overflow-hidden text-ellipsis">
      {displayGenerationOrResourceVersion(object.object, object.previous)}
    </div>
  </div>
{/if}
