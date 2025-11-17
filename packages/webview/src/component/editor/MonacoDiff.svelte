<script lang="ts">
import { onDestroy, onMount } from 'svelte';
import type * as Monaco from 'monaco-editor/esm/vs/editor/editor.api';
import type { HTMLAttributes } from 'svelte/elements';
import { MonacoManager } from './monaco';

interface Props extends HTMLAttributes<HTMLElement> {
  before: string;
  after: string;
  language?: string;
  readOnly?: boolean;
  noMinimap?: boolean;
  onChange?: (content: string) => void;
}

let {
  before,
  after,
  language = 'json',
  readOnly = true,
  onChange,
  noMinimap,
  class: className,
  ...restProps
}: Props = $props();

let editorInstance: Monaco.editor.IStandaloneDiffEditor;
let editorContainer: HTMLElement;

onMount(async () => {
  const monaco = await MonacoManager.getMonaco();

  editorInstance = monaco.editor.createDiffEditor(editorContainer, {
    renderSideBySide: false,
    automaticLayout: true,
    scrollBeyondLastLine: false,
    readOnly: readOnly,
    fontSize: 10,
    theme: MonacoManager.getThemeName(),
    minimap: {
      enabled: !noMinimap,
    },
  });

  editorInstance.setModel({
    original: monaco.editor.createModel(before, language),
    modified: monaco.editor.createModel(after, language),
  });
});

onDestroy(() => {
  editorInstance?.dispose();
});
</script>

<div class="h-full {className}" {...restProps} bind:this={editorContainer}></div>
