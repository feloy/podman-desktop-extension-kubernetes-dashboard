<script lang="ts">
import { faStepForward } from '@fortawesome/free-solid-svg-icons';
import type { Props } from './props';
import IconButton from '/@/component/button/IconButton.svelte';
import { getContext } from 'svelte';
import { Remote } from '/@/remote/remote';
import { API_CONTEXTS, type ContextsApi } from '@kubernetes-dashboard/channels';

let { object }: Props = $props();

const remote = getContext<Remote>(Remote);
const contextsApi = remote.getProxy<ContextsApi>(API_CONTEXTS);
</script>

{#if object.index === 0}
  <IconButton
    title="Advance one step"
    onClick={async (): Promise<void> => {
      await contextsApi.advanceOneStep();
    }}
    icon={faStepForward} />
{/if}
