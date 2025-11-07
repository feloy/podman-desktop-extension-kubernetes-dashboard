<script lang="ts">
import type { Props } from './props';
import type { CoreV1Event, KubernetesObject } from '@kubernetes/client-node';
import humanizeDuration from 'humanize-duration';
import moment from 'moment';
import { getManagedField } from '/@/component/debugger/columns/event-details';

let { object }: Props = $props();

function getAgeAndCount(event: CoreV1Event): string {
  if ((event.count ?? 0) > 1) {
    return `${event.count}x over ${humanizeDuration(moment().diff(event.firstTimestamp), { round: true, largest: 1 })} - `;
  }
  return '';
}

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

{#if ['event-add', 'event-update', 'event-delete'].includes(object.type) && object.event}
  <div class="flex flex-col max-w-full text-left">
    <div class="text-(--pd-table-body-text-highlight) overflow-hidden text-ellipsis">
      {getAgeAndCount(object.event)}{object.event.reason}
    </div>
    <div class="text-(--pd-table-body-text) font-extra-light text-sm overflow-hidden text-ellipsis">
      {object.event.message}
    </div>
  </div>
{/if}
{#if ['add', 'update', 'delete'].includes(object.type)}
  <div class="flex flex-col max-w-full text-left">
    <div class="text-(--pd-table-body-text-highlight) overflow-hidden text-ellipsis">
      {getManagedField(object.object, object.previous)}
    </div>
    <div class="text-(--pd-table-body-text) font-extra-light text-sm overflow-hidden text-ellipsis">
      {displayGenerationOrResourceVersion(object.object, object.previous)}
    </div>
  </div>
{/if}
