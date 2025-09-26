<script lang="ts">
import type { V1Pod } from '@kubernetes/client-node';
import { getContext, onDestroy, onMount } from 'svelte';
import { Streams } from '/@/stream/streams';
import type { IDisposable } from 'monaco-editor';
import { Terminal } from '@xterm/xterm';
import { getTerminalTheme } from '../terminal/terminal-theme';
import { FitAddon } from '@xterm/addon-fit';
import { SerializeAddon } from '@xterm/addon-serialize';
import { Remote } from '/@/remote/remote';
import { API_POD_TERMINALS } from '/@common/channels';

interface Props {
  object: V1Pod;
}
let { object }: Props = $props();

const streams = getContext<Streams>(Streams);
const remote = getContext<Remote>(Remote);
const podTerminalsApi = remote.getProxy(API_POD_TERMINALS);

let disposables: IDisposable[] = [];

let terminalXtermDiv: HTMLElement = document.createElement('div');
let shellTerminal: Terminal;

onMount(async () => {
  const podName = object.metadata?.name ?? '';
  const namespace = object.metadata?.namespace ?? '';
  const containerName = object.spec?.containers?.[0]?.name ?? '';
  await initializeNewTerminal(terminalXtermDiv, podName, namespace, containerName);
  disposables.push(await streams.streamPodTerminals.subscribe(
    podName, 
    namespace, 
    containerName,
    chunk => {
      if (chunk.podName !== podName || chunk.namespace !== namespace || chunk.containerName !== containerName) {
        return;
      }
      shellTerminal.write(chunk.data);
    },
  ));
});

onDestroy(() => {
  disposables.forEach(disposable => disposable.dispose());
  disposables = [];
});

async function initializeNewTerminal(
  container: HTMLElement,
  podName: string,
  namespace: string,
  containerName: string,
): Promise<void> {
  if (!terminalXtermDiv) {
    return;
  }
  shellTerminal = new Terminal({
    fontSize: 10,
    lineHeight: 1,
    screenReaderMode: true,
    theme: getTerminalTheme(),
  });
  const fitAddon = new FitAddon();
  const serializeAddon = new SerializeAddon();
  shellTerminal.loadAddon(fitAddon);
  shellTerminal.loadAddon(serializeAddon);
  shellTerminal.open(container);
  fitAddon.fit();
  shellTerminal.onData(data => {
    podTerminalsApi.sendData(podName, namespace, containerName, data);
  });
}
</script>

<div class="h-full w-full p-[5px] pr-0 bg-[var(--pd-terminal-background)]" bind:this={terminalXtermDiv}></div>
