<script lang="ts">
import type { Props } from './props';
import type { CoreV1Event } from '@kubernetes/client-node';
import humanizeDuration from 'humanize-duration';
import moment from 'moment';

let { object }: Props = $props();

function getAgeAndCount(event: CoreV1Event): string {
  if ((event.count ?? 0) > 1) {
    return `${event.count}x over ${humanizeDuration(moment().diff(event.firstTimestamp), { round: true, largest: 1 })} - `;
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
