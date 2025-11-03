<script lang="ts">
import type { Props } from './props';

let { object }: Props = $props();
</script>

<div class="flex flex-col max-w-full text-left">
  <div class="text-(--pd-table-body-text-highlight) overflow-hidden text-ellipsis">
    {object.name}
  </div>
  <div class="text-(--pd-table-body-text) font-extra-light text-sm overflow-hidden text-ellipsis">
    {object.kind}, {object.type.replace('-', ' ')}
  </div>
</div>
