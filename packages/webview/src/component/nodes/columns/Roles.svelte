<script lang="ts">
import type { IconDefinition } from '@fortawesome/fontawesome-common-types';
import { faMicrochip, faSatelliteDish, faServer } from '@fortawesome/free-solid-svg-icons';
import Fa from 'svelte-fa';

import type { Props } from './props';
import Label from '/@/component/label/Label.svelte';

let { object }: Props = $props();

let roleName = $state<string>();
let roleIcon = $state<IconDefinition>(faServer);
let roleClass = $state<string>();

$effect(() => {
  switch (object.role) {
    case 'control-plane':
      roleName = 'Control Plane';
      // faSatelliteDish: Represents a satellite dish, suitable for the control plane role
      roleIcon = faSatelliteDish;
      roleClass = 'text-[var(--pd-status-running)]';
      break;
    case 'node':
      roleName = 'Node';
      // faServer: Better represents a "node" / server rack
      roleIcon = faServer;
      roleClass = 'text-[var(--pd-status-updated)]';
      break;
  }
});
</script>

<div class="flex flex-row gap-1">
  <Label name={roleName}>
    <Fa size="1x" icon={roleIcon} class={roleClass} />
  </Label>
  {#if object.hasGpu}
    <Label name="GPU">
      <Fa size="1x" icon={faMicrochip} class="text-[var(--pd-status-updated)]" />
    </Label>
  {/if}
</div>
