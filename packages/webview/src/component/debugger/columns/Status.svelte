<script lang="ts">
import type { Component } from 'svelte';
import type { Props } from './props';
import { icon } from '/@/component/icons/icon';
import KubeIcon from '/@/component/icons/KubeIcon.svelte';
import StarIcon from '/@/component/icons/StarIcon.svelte';

let { object }: Props = $props();
const Icon: Component = $derived.by(() => icon[object?.kind ?? ''] ?? KubeIcon);
</script>

<div class="grid place-content-center" style="position:relative">
  <div
    class="text-(--pd-status-contrast) p-1 grid place-content-center rounded-sm aspect-square text-xs"
    class:bg-(--pd-state-success)={object.type === 'add'}
    class:bg-(--pd-state-error)={object.type === 'delete'}
    role="status"
    title={object.type}>
    <Icon icon={icon} size={20} />
  </div>
  {#if ['event-add', 'event-update', 'event-delete'].includes(object.type)}
    <StarIcon size="8" style="position:absolute;top:0;right:0" />
  {/if}
</div>
