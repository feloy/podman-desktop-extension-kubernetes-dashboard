<script lang="ts">
import type { V1Pod } from '@kubernetes/client-node';
import { getContext, onDestroy, onMount } from 'svelte';
import { Streams } from '/@/stream/streams';
import type { IDisposable } from 'monaco-editor';

interface Props {
  object: V1Pod;
}
let { object }: Props = $props();

const streams = getContext<Streams>(Streams);

let disposables: IDisposable[] = [];

onMount(async () => {
  disposables.push(await streams.streamPodTerminals.subscribe(object.metadata?.name ?? '', object.metadata?.namespace ?? '', object.spec?.containers?.[0]?.name ?? ''));
});

onDestroy(() => {
  disposables.forEach(disposable => disposable.dispose());
  disposables = [];
});
</script>
