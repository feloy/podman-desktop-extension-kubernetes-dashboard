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
    {object.name}
  </div>
  <div class="text-(--pd-table-body-text) font-extra-light text-sm overflow-hidden text-ellipsis">
    {object.kind}, {object.type.replace('-', ' ')}
  </div>
</button>
