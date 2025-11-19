<script lang="ts">
import { getContext, onMount } from 'svelte';
import { States } from '/@/state/states';
import { DependencyAccessor } from '/@/inject/dependency-accessor';
import { DebuggerStepHelper } from '/@/component/debugger/step-helper';
import { DetailsPage, Tab } from '@podman-desktop/ui-svelte';
import { router } from 'tinro';
import StepEventSummary from '/@/component/debugger/StepEventSummary.svelte';
import StepResourceSummary from '/@/component/debugger/StepResourceSummary.svelte';
import Route from '/@/Route.svelte';
import MonacoEditor from '/@/component/editor/MonacoEditor.svelte';
import MonacoDiff from '/@/component/editor/MonacoDiff.svelte';
import IconButton from '/@/component/button/IconButton.svelte';
import { faBackward, faForward } from '@fortawesome/free-solid-svg-icons';

interface Props {
  step: number;
}
let { step }: Props = $props();

const dependencyAccessor = getContext<DependencyAccessor>(DependencyAccessor);
const stepHelper = dependencyAccessor.get<DebuggerStepHelper>(DebuggerStepHelper);

const states = getContext<States>(States);
const debuggerInfo = states.stateDebuggerInfoUI;
let stepInfo = $derived(
  debuggerInfo.data?.steps[step] ? stepHelper.DebuggerStepUI(debuggerInfo.data?.steps[step], step) : undefined,
);

function navigateToList(): void {
  router.goto('/debugger');
}

let title = $state('');
let subtitle = $state('');

$effect(() => {
  if (stepInfo) {
    switch (stepInfo.type) {
      case 'add':
        title = `New ${stepInfo.kind}`;
        break;
      case 'update':
        title = `Update ${stepInfo.kind}`;
        break;
      case 'delete':
        title = `Delete ${stepInfo.kind}`;
        break;
      case 'event-add':
        title = `New event on ${stepInfo.kind}`;
        break;
      case 'event-update':
        title = `Update event on ${stepInfo.kind}`;
        break;
    }
    subtitle = stepInfo.name;
  }
});

function advanceOneStep(): void {
  if (!stepInfo) return;
  router.goto(`/debugger/${stepInfo.index + 1}/summary`);
}

function goToPreviousStep(): void {
  if (!stepInfo) return;
  router.goto(`/debugger/${stepInfo.index - 1}/summary`);
}

onMount(() => {
  return debuggerInfo.subscribe();
});
</script>

{#if stepInfo}
  <DetailsPage
    title={title}
    subtitle={subtitle}
    breadcrumbLeftPart="Debugger"
    breadcrumbRightPart={title}
    onbreadcrumbClick={navigateToList}
    onclose={navigateToList}>
    {#snippet actionsSnippet()}
      <IconButton
        icon={faBackward}
        title="Go to previous step"
        onClick={goToPreviousStep}
        enabled={stepInfo && stepInfo.index > 0} />
      <IconButton
        icon={faForward}
        title="Go to next step"
        onClick={advanceOneStep}
        enabled={stepInfo && debuggerInfo.data && stepInfo.index < debuggerInfo.data.steps.length - 1} />
    {/snippet}
    {#snippet tabsSnippet()}
      <Tab title="Summary" selected={$router.path.endsWith('/summary')} url="/debugger/{stepInfo.index}/summary" />
      {#if stepHelper.isResourceStepUI(stepInfo)}
        {#if stepInfo.type === 'update'}
          <Tab
            title="Inspect previous"
            selected={$router.path.endsWith('/yaml-previous')}
            url="/debugger/{stepInfo.index}/yaml-previous" />
        {/if}
        <Tab
          title={stepInfo.type === 'update'
            ? 'Inspect next'
            : stepInfo.type === 'delete'
              ? 'Inspect deleted'
              : 'Inspect added'}
          selected={$router.path.endsWith('/yaml-next')}
          url="/debugger/{stepInfo.index}/yaml-next" />
        {#if stepInfo.type === 'update'}
          <Tab
            title="Changes"
            selected={$router.path.endsWith('/yaml-diff')}
            url="/debugger/{stepInfo.index}/yaml-diff" />
        {/if}
      {/if}
    {/snippet}
    {#snippet contentSnippet()}
      <Route path="/summary">
        {#if stepHelper.isResourceStepUI(stepInfo)}
          <StepResourceSummary stepInfo={stepInfo} />
        {:else}
          <StepEventSummary stepInfo={stepInfo} />
        {/if}
      </Route>
      {#if stepHelper.isResourceStepUI(stepInfo)}
        <Route path="/yaml-previous">
          <MonacoEditor content={stepInfo.yamlPrevious ?? ''} language="yaml" />
        </Route>
        <Route path="/yaml-next">
          <MonacoEditor content={stepInfo.yamlObject ?? ''} language="yaml" />
        </Route>
        <Route path="/yaml-diff">
          <MonacoDiff before={stepInfo.yamlPrevious ?? ''} after={stepInfo.yamlObject ?? ''} language="yaml" />
        </Route>
      {/if}
    {/snippet}
  </DetailsPage>
{/if}
