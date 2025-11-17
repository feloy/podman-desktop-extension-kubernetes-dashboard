<script lang="ts">
import { router } from 'tinro';
import type { Props } from './props';

let { object }: Props = $props();

async function openDetails(): Promise<void> {
  router.goto(`/debugger/${object.index}/summary`);
}
</script>

<button class="flex flex-col max-w-full text-left" onclick={openDetails}>
  <div class="text-(--pd-table-body-text-highlight) overflow-hidden text-ellipsis">
    {#if object.type === 'add'}New {object.kind}
    {:else if object.type === 'update'}
      Update {object.kind}
    {:else if object.type === 'delete'}
      Delete {object.kind}
    {:else if object.type === 'event-add'}
      New event on {object.kind}
    {:else if object.type === 'event-update'}
      Update event on {object.kind}
    {/if}
  </div>
  <div class="text-(--pd-table-body-text) font-extra-light text-sm overflow-hidden text-ellipsis">
    {object.name}
  </div>
</button>
