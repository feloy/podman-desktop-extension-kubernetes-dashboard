<script lang="ts">
import { getContext } from 'svelte';
import { States } from '/@/state/states';
import { DependencyAccessor } from '/@/inject/dependency-accessor';
import { DebuggerStepHelper } from '/@/component/debugger/step-helper';
import { DetailsPage, Tab } from '@podman-desktop/ui-svelte';
import { router } from 'tinro';
import StepEventSummary from '/@/component/debugger/StepEventSummary.svelte';
import StepResourceSummary from '/@/component/debugger/StepResourceSummary.svelte';

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
    title = stepInfo.name;
    if (stepHelper.isResourceStepUI(stepInfo)) {
      subtitle = `Resource ${stepInfo.type}`;
    } else {
      subtitle = `Event ${stepInfo.type.split('-')[1]}`;
    }
  }
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
    {#snippet tabsSnippet()}
      <Tab title="Summary" selected={$router.path.endsWith('/summary')} url="/debugger/{stepInfo.index}/summary" />
    {/snippet}
    {#snippet contentSnippet()}
      {#if stepHelper.isResourceStepUI(stepInfo)}
        <StepResourceSummary stepInfo={stepInfo} />
      {:else}
        <StepEventSummary stepInfo={stepInfo} />
      {/if}
    {/snippet}
  </DetailsPage>
{/if}
